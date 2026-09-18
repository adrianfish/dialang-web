import { expect } from "@std/expect";
import { stub } from "@std/testing/mock";
import { CEFR_LEVELS, getItemGrade, getSaPPEAndLevel, getScoredIdResponseItem, getScoredTextResponseItem }  from "./scoring.ts";
import type { Answer, Item, ItemResult, SAGrade, ScoredItem }  from "../types.ts";
import type { Storage }  from "../storage/storage.ts";
import { MockStorage }  from "../storage/mock-storage.ts";

Deno.test("getItemGrade returns defaults when no grade bands present", async () => {

  const tl = "spa_es";
  const skill = "reading";
  const bookletId = 1;

  const storage: Storage = new MockStorage();

  // Test the error condition
  stub(storage, "getItemGrade", () => Promise.resolve(null));
  const [ rawScore, _, level ] = await getItemGrade(tl, skill, bookletId, [], storage);
  expect(rawScore).toEqual(0);
  expect(level).toEqual(CEFR_LEVELS[1]);
});

Deno.test("Grades a set of scored items correctly", async () => {

  const tl = "spa_es";
  const skill = "reading";
  const bookletId = 1;

  const itemGrade = { tl, skill, bookletId, rsc: 2, ppe: 0, se: 0, grade: 3 };

  const storage: Storage = new MockStorage();
  stub(storage, "getItemGrade", () => Promise.resolve(itemGrade));

  const scoredItems: Array<ScoredItem> = [
    {
      id: 1,
      type: "mcq",
      skill,
      subskill: "IT",
      position: 0,
      weight: 1,
      score: 1,
      text: "a",
      positionInBasket: 1,
    },
    {
      id: 2,
      type: "mcq",
      skill,
      subskill: "IT",
      position: 1,
      weight: 1,
      score: 1,
      text: "b",
      positionInBasket: 2,
    },
  ];

  const [ rawScore, grade, level ] = await getItemGrade(tl, skill, bookletId, scoredItems, storage);
  expect(rawScore).toEqual(scoredItems.reduce((acc, curr) => acc + curr.score, 0));
  expect(grade).toEqual(itemGrade.grade);
  expect(level).toEqual(CEFR_LEVELS[grade as number]);
});

Deno.test("Gets a scored id response item successfully", async () => {

  const storage: Storage = new MockStorage();

  const itemId = 1;
  const responseId = 1;

  let itemResult: ItemResult = await getScoredIdResponseItem(itemId, responseId, storage);
  expect(itemResult.error).toEqual(`Failed to get item for itemId: ${itemId}`);

  const weight = 3;
  const item: Item = {
    id: itemId,
    type: "mcq",
    skill: "reading",
    position: 1,
    subskill: "OV",
    text: "",
    weight,
  };

  stub(storage, "getItem", () => Promise.resolve(item));

  itemResult = await getScoredIdResponseItem(itemId, responseId, storage);
  expect(itemResult.error).toEqual(`Failed to get answer for responseId: ${responseId}`);

  const answer: Answer = {
    id: responseId,
    itemId: itemId,
    text: "",
    correct: 1,
  };

  stub(storage, "getAnswer", () => Promise.resolve(answer));
  itemResult = await getScoredIdResponseItem(itemId, responseId, storage);
  expect(itemResult.error).toBeUndefined();

  expect(itemResult.item).toBeDefined();
  expect(itemResult?.item?.correct).toBeTruthy();
  expect(itemResult?.item?.score).toEqual(weight);
});

Deno.test("Gets a scored text response item successfully", async () => {

  const storage: Storage = new MockStorage();

  const itemId = 1;
  const answerText = "omelette";

  let itemResult: ItemResult = await getScoredTextResponseItem(itemId, answerText, storage);
  expect(itemResult.error).toEqual(`Failed to get item for itemId: ${itemId}`);

  const weight = 3;
  const item: Item = {
    id: itemId,
    type: "mcq",
    skill: "reading",
    position: 1,
    subskill: "OV",
    text: "",
    weight,
  };

  stub(storage, "getItem", () => Promise.resolve(item));
  itemResult = await getScoredTextResponseItem(itemId, answerText, storage);
  expect(itemResult.error).toEqual(`Failed to get answers for itemId: ${itemId}`);

	let answers: Array<Answer> = [
    {
      id: 1,
      itemId,
      text: "OMELETTE",
      correct: 1,
    },
  ];
  stub(storage, "getItemAnswers", () => Promise.resolve(answers));
  itemResult = await getScoredTextResponseItem(itemId, answerText, storage);
  expect(itemResult.error).toBeUndefined();
  expect(itemResult.item?.score).toEqual(weight);
  expect(itemResult.item?.correct).toEqual(true);

  answers = [
    {
      id: 1,
      itemId,
      text: `  ${answerText}`,
      correct: 1,
    }
  ];

  itemResult = await getScoredTextResponseItem(itemId, answerText, storage);
  expect(itemResult.error).toBeUndefined();
  expect(itemResult.item?.score).toEqual(weight);
  expect(itemResult.item?.correct).toEqual(true);
});

Deno.test("Gets SA, PPE and Level successfully", async () => {

  const skill = "reading";
  const storage: Storage = new MockStorage();

  const responses: Record<string, boolean> = {
    "11": false,
    "17": true,
  };
  const weights: Record<string, number> = {
    "11": 5,
    "17": 3,
  };

  const ppe = -1.587;
  const grade: SAGrade = {
    "skill": "reading",
    "rsc": 3,
    "ppe": ppe,
    "se": 0.364,
    "grade": 1,
  };
  stub(storage, "getSAWeights", () => Promise.resolve(weights));
  stub(storage, "getSAGrade", () => Promise.resolve(grade));

  const result: Array<number | string | null> = await getSaPPEAndLevel(skill, responses, storage);
  expect(result[0]).toEqual(ppe);
  expect(result[1]).toEqual(CEFR_LEVELS[grade.grade]);
});

