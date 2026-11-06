import { HTTPException } from "hono/http-exception";
import { getSession } from "../utils/utils.ts";
import { getBaskets, getItemAnswers } from "../data/data.ts";
import { SessionDO } from "../session-do.ts";
//import { LTIKit, Score } from "@adrianfish/lti-kit";
import { getItemGrade, getScoredIdResponseItem, getScoredTextResponseItem } from "../scoring/scoring.ts";
import { storeMultipleIdResponses, storeMultipleTextualResponses, storeSingleIdResponse, storeTestResult } from "../data-capture/data-capture.ts";

import type { Context } from "hono";
import type { CurrentBasketData, ItemResult, ItemScore, ScoredBasket, ScoredItem, SubmitBasketRequirements, TestResult } from "../types.ts";

export async function submitBasket(
  c: Context,
  //lti: LTIKit,
): Promise<Response> {

  const session: SessionDO | null = getSession(c);
  if (!session) {
    throw new HTTPException(500, { message: "Failed to get session" });
  }

  const submitBasketRequirements: SubmitBasketRequirements = await session.getSubmitBasketRequirements();

	if (!submitBasketRequirements.tl || !submitBasketRequirements.skill || !submitBasketRequirements.currentBasketId || !submitBasketRequirements.bookletId || submitBasketRequirements.currentBasketNumber === undefined) {
    throw new HTTPException(500, { message: "None of the test language, skill, current basket id, booklet id or current basket number were set in the session." });
	}

  const body = await c.req.parseBody();

  const basketType: string = body["basketType"] as string;
  if (!basketType) {
    throw new HTTPException(400, { message: "No basketType supplied." })
  }

  const positionInBasketSorter = (a: ScoredItem, b: ScoredItem) => a.positionInBasket - b.positionInBasket;

  const numScoredItems: number = submitBasketRequirements.itemScores?.length || 0;
  const currentBasketId: number = submitBasketRequirements.currentBasketId;

  const returnMap: Record<string, string | number | ScoredBasket | boolean> = {};

  const scoredItemList: Array<ScoredItem> = submitBasketRequirements.scoredItems || [];

  switch (basketType) {
    case "mcq": {
      const itemId: number = parseInt(body["itemId"] as string);
      if (!itemId) {
        throw new HTTPException(400, { message: "Invalid or missing item id." })
      }
      const answerId: number = parseInt(body["response"] as string);
      if (!answerId) {
        throw new HTTPException(400, { message: "No response supplied." })
      }

      const itemResult: ItemResult = await getScoredIdResponseItem(itemId, answerId);
      if (itemResult.item) {
        const scoredItem: ScoredItem = itemResult.item;
        scoredItem.basketId = submitBasketRequirements.currentBasketId;
        scoredItem.positionInBasket = 1;
        scoredItem.responseId = answerId;
        scoredItem.positionInTest = numScoredItems + 1;

        scoredItem.answers = await getItemAnswers(itemId);

        if (!scoredItem.answers?.length) {
          throw new HTTPException(400, { message: `No answers for item ${itemId}.` });
        }

        scoredItemList.push(scoredItem);
        const scoredBasket: ScoredBasket = { id: currentBasketId, type: "mcq", skill: scoredItem.skill, items: [scoredItem] };
        returnMap["scoredBasket"] = scoredBasket
        /* @ts-ignore */
        await storeSingleIdResponse((await session.getPassId()) as string, scoredItem);
      } else {
        throw new HTTPException(500, { message: `Failed to get scored item for itemId ${itemId} and responseId ${answerId}` });
      }
      break;
    }

    case "tabbedpane": {
      const itemsToLog: Array<ScoredItem> = [];
      const responses: Record<number, number> = getMultipleIdResponses(body);
      const basketItems: Array<ScoredItem> = [];
      const entries = Object.entries(responses);
      for (let i = 0; i < entries.length; i++) {
        const [ itemId, answerId ] = entries[i];
        const itemResult: ItemResult = await getScoredIdResponseItem(parseInt(itemId), answerId);
        if (itemResult.item) {
          const item: ScoredItem = itemResult.item;
          item.responseId = answerId;
          const position: string = body[item.id + "-position"] as string;
          if (position) {
            item.positionInBasket = parseInt(position);
          } else {
            throw new HTTPException(400, { message: `No position supplied for item ${item.id}.` });
          }

          item.basketId = currentBasketId;
          item.positionInTest = numScoredItems + item.positionInBasket;

          item.answers = await getItemAnswers(item.id);

          if (!item.answers?.length) {
            throw new HTTPException(400, { message: `No answers for item ${item.id}.` });
          }

          itemsToLog.push(item);
          scoredItemList.push(item);
          basketItems.push(item);
        } else {
          console.error(itemResult.error);
        }
      }
      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "tabbedpane", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      /* @ts-ignore */
      await storeMultipleIdResponses((await session.getPassId()) as string,  itemsToLog);
      break;
    }

    case "shortanswer": {
      const responses = getMultipleTextualResponses(body);
      const basketItems: Array<ScoredItem> = [];
      const itemsToLog: Array<ScoredItem> = [];
      const entries = Object.entries(responses);
      for (let i = 0; i < entries.length; i++) {
        const [ itemId, responseText ] = entries[i];
        const itemResult: ItemResult = await getScoredTextResponseItem(parseInt(itemId), responseText);
        if (itemResult.item) {
          const item: ScoredItem = itemResult.item;
          item.basketId = currentBasketId;
          item.responseText = responseText;
          const position: string = body[item.id + "-position"] as string;
          if (position) {
            item.positionInBasket = parseInt(position);
          } else {
            throw new HTTPException(400, { message: `No position supplied for item ${item.id}.` });
          }
          item.positionInTest = numScoredItems + item.positionInBasket;
          item.answers = await getItemAnswers(item.id);
          scoredItemList.push(item);
          itemsToLog.push(item);
          basketItems.push(item);
        } else {
          console.error(itemResult.error);
        }
      }
      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "shortanswer", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      /* @ts-ignore */
      await storeMultipleTextualResponses((await session.getPassId()) as string,  itemsToLog);
      break;
    }

    case "gaptext": {
      const responses = getMultipleTextualResponses(body);
      const basketItems: Array<ScoredItem> = [];
      const itemsToLog: Array<ScoredItem> = [];

      const entries = Object.entries(responses);
      for (let i = 0; i < entries.length; i++) {
        const [ itemId, responseText ] = entries[i];

        const itemResult: ItemResult = await getScoredTextResponseItem(parseInt(itemId), responseText);
        if (itemResult.item) {
          const item: ScoredItem = itemResult.item;
          item.basketId = currentBasketId;
          item.responseText = responseText;
          const position: string = body[item.id + "-position"] as string;
          if (position) {
            item.positionInBasket = parseInt(position);
          } else {
            throw new HTTPException(400, { message: `No position supplied for item ${item.id}.` });
          }
          item.positionInTest = numScoredItems + item.positionInBasket;
          item.answers = await getItemAnswers(itemResult.item.id);
          scoredItemList.push(item);
          itemsToLog.push(item);
          basketItems.push(item);
        } else {
          console.error(itemResult.error);
        }
      }
      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "gaptext", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      break;
      /* @ts-ignore */
      await storeMultipleTextualResponses((await session.getPassId()) as string,  itemsToLog);
    }

    case "gapdrop": {
      const responses: Record<number, number> = getMultipleIdResponses(body);
      const basketItems: Array<ScoredItem> = [];
      const itemsToLog: Array<ScoredItem> = [];

      const entries = Object.entries(responses);
      for (let i = 0; i < entries.length; i++) {
        const [ itemId, responseId ] = entries[i];
        const itemResult: ItemResult = await getScoredIdResponseItem(parseInt(itemId), responseId);

        if (itemResult.item) {
          const item: ScoredItem = itemResult.item;
          item.basketId = currentBasketId;
          item.responseId = responseId;

          const position: string = body[item.id + "-position"] as string;
          if (position) {
            item.positionInBasket = parseInt(position);
          } else {
            throw new HTTPException(400, { message: `No position supplied for item ${item.id}.` });
          }

          item.positionInTest = numScoredItems + item.positionInBasket;
          item.answers = await getItemAnswers(item.id);
          scoredItemList.push(item);
          itemsToLog.push(item);
          basketItems.push(item);
        } else {
          console.error(itemResult.error);
        }
      }

      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "gapdrop", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      break;
      /* @ts-ignore */
      await storeMultipleIdResponses((await session.getPassId()) as string,  itemsToLog);
    }

    default: {
      console.warn("Unrecognised basketType supplied. Returning 400 (Bad Request) ...");
      c.status(400);
      return c.html("");
    }
  }

  const scoredBaskets: Array<ScoredBasket> = submitBasketRequirements.scoredBaskets || [];
  scoredBaskets.push(returnMap["scoredBasket"]);

  let itemScores: Array<ItemScore> = submitBasketRequirements.itemScores || []
  itemScores = [ ...itemScores, ...sparsifyItems(scoredItemList) ];

  const nextBasketNumber = submitBasketRequirements.currentBasketNumber + 1;

  const basketIds: Array<number> | null = await getBaskets(submitBasketRequirements.bookletId);

  if (!basketIds) {
    throw new HTTPException(500, { message: `No basket ids for booklet ${submitBasketRequirements.bookletId}` });
  }

  if (nextBasketNumber >= basketIds.length) {
    // The test has finished. Grade it.
    const [ rawScore, itemGrade, itemLevel ]
      = await getItemGrade(submitBasketRequirements.tl, submitBasketRequirements.skill, submitBasketRequirements.bookletId, itemScores);

    // If we're in an LTI session, post the score.
    /*
    if (session.isLTI) {
      const ltik: string = body["ltik"] as string;
      const userId = session.user;

      if (ltik && userId) {
        const score: Score = {
          userId,
          scoreGiven: rawScore as number,
          scoreMaximum: 1000,
          activityProgress: "Completed",
          gradingProgress: "NotReady",
        };
        // Use the null lineItemUrl version so the single line item is picked up by the lti lib.
        lti.postScore(ltik, null, score);
      } else {
        console.warn("We're in an LTI session, but the ltik or userId were not supplied. Score not posted");
      }
    }
    */

    const testResult: TestResult = {
      itemRawScore: rawScore as number,
      itemGrade: itemGrade as number,
      itemLevel: itemLevel as string,
      scoredBaskets: scoredBaskets,
    };

    await session.saveTestResult(testResult);
    /* @ts-ignore */
    await storeTestResult((await session.getPassId()) as string, testResult);

    if (submitBasketRequirements.resultUrl) {
      const parts = submitBasketRequirements.resultUrl.split("?");
      let url = `${parts[0]}?`;
      if (parts.length == 2) {
        url += `${parts[1]}&`;
      }
      url += `itemGrade=${itemGrade}`;
      const saLevel: string | undefined = await session.getSALevel();
      if (saLevel) {
        url += `&saLevel=${saLevel}`;
      }
      const vsptLevel: string | undefined = await session.getVSPTLevel();
      if (vsptLevel) {
        url += `&vsptLevel=${vsptLevel}`;
      }
      returnMap["redirect"] = url;
      return c.json(returnMap);
    } else {
      // We set testDone to true so the client js knows to enable the sa feedback and advice buttons
      returnMap["itemLevel"] = itemLevel;
      returnMap["testDone"] = true;
      return c.json(returnMap);
    }
  } else {
    //datacapture.LogBasket(session.passId, currentBasketId, session.currentBasketNumber)

    const nextBasketId = basketIds[nextBasketNumber];

    const currentBasketData: CurrentBasketData = {
      currentBasketId: nextBasketId,
      currentBasketNumber: nextBasketNumber,
      itemScores,
      scoredBaskets,
    };

    await session.saveCurrentBasketData(currentBasketData);

    returnMap["nextBasketId"] = nextBasketId;
    returnMap["itemsCompleted"] = scoredItemList.length;

    return c.json(returnMap);
  }
}

function getMultipleIdResponses(body: object): Record<number, number> {

  const responses: Record<number, number> = [];

  Object.entries(body).forEach(([k, v]) => {

    if (!k.endsWith?.("-response")) return;

    const itemId: number = parseInt(k.split("-")[0]);
    const answerId: number = parseInt(v as string);
    responses[itemId] = answerId;
  });
  return responses;
}

/**
 * Returns a map of response text on to itemId
 */
function getMultipleTextualResponses(body: object): Record<number, string> {

  const responses: Record<number, string> = {};

  Object.entries(body).forEach(([k, v]) => {

    if (!k.endsWith("-response")) return;

    const itemId: number = parseInt(k.split("-")[0]);
    responses[itemId] = v as string;
  });

  return responses;
}

function sparsifyItems(items: Array<ScoredItem>): Array<ItemScore> {
  return items.map(item => ({ id: item.id, score: item.score }));
}
