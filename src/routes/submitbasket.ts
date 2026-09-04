import { Context } from "@hono/hono";
import { getSessionId } from "../utils/utils.ts";
import { Storage } from "../storage/storage.ts";
import { LTIKit, Score } from "@adrianfish/lti-kit";
import type { DialangSession, ScoredBasket, ScoredItem, TES } from "../types.ts";
import { getItemGrade, getScoredIdResponseItem, getScoredTextResponseItem } from "../scoring/scoring.ts";

export async function submitBasket(
  c: Context,
  storage: Storage,
  lti: LTIKit,
): Promise<Response> {

  const sessionId: string | undefined = getSessionId(c);
  if (!sessionId) {
		console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }

  const session: DialangSession | null = await storage.getSession(sessionId);

  if (!session) {
		console.error(`No session for id ${sessionId}`);
		c.status(500);
		return c.html("");
  }

	if (!session.tl || !session.skill || !session.currentBasketId || !session.bookletId || session.currentBasketNumber === undefined) {
		console.error("None of the test language, skill, current basket id, booklet id or current basket number were set in the session. Returning 500 ...");
		c.status(500);
		return c.html("");
	}

  const body = await c.req.parseBody();

  const basketType: string = body["basketType"] as string;
  if (!basketType) {
    console.warn("No basketType supplied. Returning 400 (Bad Request) ...")
    c.status(400);
    return c.html("");
  }

  const positionInBasketSorter = (a: ScoredItem, b: ScoredItem) => a.positionInBasket - b.positionInBasket;

  const numScoredItems: number = session.scoredItems?.length || 0;
  const currentBasketId: number = session.currentBasketId;

  console.debug(`basketType: ${basketType}`);
  console.debug(`currentBasketId: ${currentBasketId}`);
  console.debug(`currentBasketNumber: ${session.currentBasketNumber}`);
  console.debug(`scored item list length: ${numScoredItems}`);

  const returnMap: Record<string, any> = {};

  const itemList = session.scoredItems || [];

  switch (basketType) {
    case "mcq": {
      const itemId: number = parseInt(body["itemId"] as string);
      if (!itemId) {
        console.error("Invalid or missing item id. Returning 400 (Bad Request) ...")
        c.status(400);
        return c.html("");
      }
      const answerId: number = parseInt(body["response"] as string);
      if (!answerId) {
        console.warn("No response supplied. Returning 400 (Bad Request) ...")
        c.status(400);
        return c.html("");
      }

      const [ scoredItem, err ] = await getScoredIdResponseItem(itemId, answerId, storage);
      if (err) {
        console.error(`Failed to get scored item for itemId ${itemId} and responseId ${answerId}`);
        c.status(500);
        return c.html("");
      } else {
        scoredItem.basketId = session.currentBasketId;
        scoredItem.positionInBasket = 1;
        scoredItem.responseId = answerId;
        scoredItem.positionInTest = numScoredItems + 1;
        console.debug(`Item position in test: ${scoredItem.positionInTest}`);
        scoredItem.answers = await storage.getItemAnswers(itemId);
        itemList.push(scoredItem);
        const scoredBasket: ScoredBasket = { id: currentBasketId, type: "mcq", skill: scoredItem.skill, items: [scoredItem] };
        returnMap["scoredBasket"] = scoredBasket
        //datacapture.LogSingleIdResponse(session.passId, scoredItem)
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
        const [ item, error ] = await getScoredIdResponseItem(parseInt(itemId), answerId, storage);
        item.responseId = answerId;
        const position: string = body[item.id + "-position"] as string;
        if (position) {
          item.positionInBasket = parseInt(position);
        } else {
          console.warn(`No position supplied for item ${item.id}. Returning 400 (Bad Request) ...`);
          c.status(400);
          return c.html("");
        }

        item.BasketId = currentBasketId;
        item.positionInTest = numScoredItems + item.positionInBasket;
        console.debug(`Item position in basket: ${item.positionInBasket}`);
        console.debug(`Item position in test: ${item.PositionInTest}`);
        item.answers = await storage.getItemAnswers(item.id);
        itemsToLog.push(item);
        itemList.push(item);
        basketItems.push(item);
      }
      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "tabbedpane", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      //datacapture.LogMultipleIdResponses(session.passId, itemsToLog)
      break;
    }

    case "shortanswer": {
      const responses = getMultipleTextualResponses(body);
      const basketItems: Array<ScoredItem> = [];
      const itemsToLog: Array<ScoredItem> = [];
      const entries = Object.entries(responses);
      for (let i = 0; i < entries.length; i++) {
        const [ itemId, responseText ] = entries[i];
        const [ item, error ] = await getScoredTextResponseItem(parseInt(itemId), responseText, storage);
        if (item) {
          item.basketId = currentBasketId;
          item.responseText = responseText;
          const position: string = body[item.id + "-position"] as string;
          if (position) {
            item.positionInBasket = parseInt(position);
          } else {
            console.warn(`No position supplied for item ${item.id}. Returning 400 (Bad Request) ...`);
            c.status(400);
            return c.html("");
          }
          item.positionInTest = numScoredItems + item.positionInBasket;
          console.debug(`Item position in test: ${item.positionInTest}`);
          item.answers = await storage.getItemAnswers(item.id);
          itemList.push(item);
          itemsToLog.push(item);
          basketItems.push(item);
        } else {
          console.error("No item returned from scoring");
        }
      }
      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "shortanswer", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      //datacapture.LogMultipleTextualResponses(session.passId, itemsToLog)
      break;
    }

    case "gaptext": {
      const responses = getMultipleTextualResponses(body);
      const basketItems: Array<ScoredItem> = [];
      const itemsToLog: Array<ScoredItem> = [];

      const entries = Object.entries(responses);
      for (let i = 0; i < entries.length; i++) {
        const [ itemId, responseText ] = entries[i];

        const [ item, error ] = await getScoredTextResponseItem(parseInt(itemId), responseText, storage);
        if (item) {
          item.basketId = currentBasketId;
          item.responseText = responseText;
          const position: string = body[item.id + "-position"] as string;
          if (position) {
            item.positionInBasket = parseInt(position);
          } else {
            console.warn(`No position supplied for item ${item.id}. Returning 400 (Bad Request) ...`);
            c.status(400);
            return c.html("");
          }
          item.positionInTest = numScoredItems + item.positionInBasket;
          console.debug(`Item position in test: ${item.positionInTest}`);
          item.answers = await storage.getItemAnswers(item.id);
          itemList.push(item);
          itemsToLog.push(item);
          basketItems.push(item);
        } else {
          console.error("No item returned from scoring");
        }
      }
      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "gaptext", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      break;
      //datacapture.LogMultipleTextualResponses(session.passId, itemsToLog)
    }

    case "gapdrop": {
      const responses: Record<number, number> = getMultipleIdResponses(body);
      const basketItems: Array<ScoredItem> = [];
      const itemsToLog: Array<ScoredItem> = [];

      const entries = Object.entries(responses);
      for (let i = 0; i < entries.length; i++) {
        const [ itemId, responseId ] = entries[i];
        const [ item, error ] = await getScoredIdResponseItem(parseInt(itemId), responseId, storage);

        if (item) {
          item.basketId = currentBasketId;
          item.responseId = responseId;

          const position: string = body[item.id + "-position"] as string;
          if (position) {
            item.positionInBasket = parseInt(position);
          } else {
            console.warn(`No position supplied for item ${item.id}. Returning 400 (Bad Request) ...`);
            c.status(400);
            return c.html("");
          }

          item.positionInTest = numScoredItems + item.positionInBasket;
          item.answers = await storage.getItemAnswers(item.id);
          itemList.push(item);
          itemsToLog.push(item);
          basketItems.push(item);
        } else {
          console.error("No item returned from scoring");
        }
      }

      basketItems.sort(positionInBasketSorter);
      const scoredBasket: ScoredBasket = { id: currentBasketId, type: "gapdrop", skill: basketItems[0].skill, items: basketItems };
      returnMap["scoredBasket"] = scoredBasket;
      break;
      //datacapture.LogMultipleIdResponses(session.passId, itemsToLog)
    }

    default: {
      console.warn("Unrecognised basketType supplied. Returning 400 (Bad Request) ...");
      c.status(400);
      return c.html("");
    }
  }

  session.scoredItems = sparsifyItems(itemList);

  const nextBasketNumber = session.currentBasketNumber + 1;
  console.debug(`nextBasketNumber: ${nextBasketNumber}`);

  const basketIds: Array<number> | null = await storage.getBaskets(session.bookletId);

  if (!basketIds) {
    console.error(`No basket ids for booklet ${session.bookletId}`);
    c.status(500);
    return c.html("");
  }

  if (nextBasketNumber >= basketIds.length) {
    // The test has finished. Grade it.
    const [ rawScore, itemGrade, itemLevel ]
      = await getItemGrade(session.tl, session.skill, session.bookletId, itemList, storage);

    // If we're in an LTI session, post the score.
    if (session.isLTI) {
      const ltik: string = body["ltik"] as string;
      const userId = session.user;

      if (ltik && userId) {
        const score: Score = {
          userId,
          scoreGiven: rawScore,
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

    session.itemRawScore = rawScore;
    session.itemGrade = itemGrade;
    session.itemLevel = itemLevel;

    storage.saveSession(sessionId, session);

    //datacapture.LogTestFinish(session.passId)
    storage.logTestResult(session);

    if (session.resultUrl) {
      const parts = session.resultUrl.split("?");
      let url = `${parts[0]}?`;
      if (parts.length == 2) {
        url += `${parts[1]}&`;
      }
      url += `itemGrade=${itemGrade}`;
      if (session.saLevel) {
        url += `&saLevel=${session.saLevel}`;
      }
      if (session.vsptLevel) {
        url += `&vsptLevel=${session.vsptLevel}`;
      }
      returnMap["redirect"] = url;
      return c.json(returnMap);
    } else {
      // We set testDone to true so the client js knows to enable the sa feedback and advice buttons
      returnMap["itemLevel"] = itemLevel;
      returnMap["testDone"] = "true";
      return c.json(returnMap);
    }
  } else {
    //datacapture.LogBasket(session.passId, currentBasketId, session.currentBasketNumber)

    const nextBasketId = basketIds[nextBasketNumber];

    session.currentBasketNumber = nextBasketNumber;
    session.currentBasketId = nextBasketId;
    storage.saveSession(sessionId, session);

    returnMap["nextBasketId"] = nextBasketId;
    returnMap["itemsCompleted"] = itemList.length;

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

function sparsifyItems(items: Array<ScoredItem>): Array<any> {
  return items.map(item => ({ id: item.id, score: item.score }));
}
