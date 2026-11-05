import { beforeEach, expect, test, vi } from 'vitest'
import { CEFR_LEVELS, getItemGrade, getSaPPEAndLevel, getScoredIdResponseItem, getScoredTextResponseItem }  from "./scoring.ts";
import * as data from "../data/data.ts";
import type { Answer, Item, ItemResult, SAGrade, ScoredItem }  from "../types.ts";

beforeEach(() => {
  vi.resetAllMocks();
});

test("getItemGrade returns defaults when no grade bands present", async () => {

  vi.spyOn(data, "getItemGrade").mockResolvedValue(null);

  const tl = "spa_es";
  const skill = "reading";
  const bookletId = 1;

  const [ rawScore, _, level ] = await getItemGrade(tl, skill, bookletId, []);
  expect(data.getItemGrade).toHaveBeenCalled();
  expect(rawScore).toEqual(0);
  expect(level).toEqual(CEFR_LEVELS[1]);
});

test("Grades a set of scored items correctly", async () => {

  const tl = "spa_es";
  const skill = "reading";
  const bookletId = 1;

  const itemGrade = { tl, skill, bookletId, rsc: 2, ppe: 0, se: 0, grade: 3 };

  vi.spyOn(data, "getItemGrade").mockResolvedValue(itemGrade);

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

  const [ rawScore, grade, level ] = await getItemGrade(tl, skill, bookletId, scoredItems);
  expect(rawScore).toEqual(scoredItems.reduce((acc, curr) => acc + curr.score, 0));
  expect(grade).toEqual(itemGrade.grade);
  expect(level).toEqual(CEFR_LEVELS[grade as number]);
});

test("Gets a scored id response item successfully", async () => {

  const itemId = 1;
  const responseId = 1;

  let itemResult: ItemResult = await getScoredIdResponseItem(itemId, responseId);
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

  vi.spyOn(data, "getItem").mockResolvedValue(item);

  itemResult = await getScoredIdResponseItem(itemId, responseId);
  expect(itemResult.error).toEqual(`Failed to get answer for responseId: ${responseId}`);

  const answer: Answer = {
    id: responseId,
    itemId: itemId,
    text: "",
    correct: 1,
  };

  vi.spyOn(data, "getAnswer").mockResolvedValue(answer);
  itemResult = await getScoredIdResponseItem(itemId, responseId);
  expect(itemResult.error).toBeUndefined();

  expect(itemResult.item).toBeDefined();
  expect(itemResult?.item?.correct).toBeTruthy();
  expect(itemResult?.item?.score).toEqual(weight);
});

test("Gets a scored text response item successfully", async () => {

  const itemId = 1;
  const answerText = "omelette";

  let itemResult: ItemResult = await getScoredTextResponseItem(itemId, answerText);
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

  vi.spyOn(data, "getItem").mockResolvedValue(item);
  itemResult = await getScoredTextResponseItem(itemId, answerText);
  expect(itemResult.error).toEqual(`Failed to get answers for itemId: ${itemId}`);

	let answers: Array<Answer> = [
    {
      id: 1,
      itemId,
      text: "OMELETTE",
      correct: 1,
    },
  ];
  vi.spyOn(data, "getItemAnswers").mockResolvedValue(answers);
  itemResult = await getScoredTextResponseItem(itemId, answerText);
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

  itemResult = await getScoredTextResponseItem(itemId, answerText);
  expect(itemResult.error).toBeUndefined();
  expect(itemResult.item?.score).toEqual(weight);
  expect(itemResult.item?.correct).toEqual(true);
});

test("Gets SA, PPE and Level successfully", async () => {

  const skill = "reading";

  const responses: Record<string, boolean> = {
    "11": false,
    "17": true,
  };

  let result: Array<number | string | null> = await getSaPPEAndLevel(skill, responses);
  expect(result.length).toEqual(3);
  expect(result[0]).toEqual(0);
  expect(result[1]).toEqual("");
  expect(result[2]).toEqual("Failed to get raw score");

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
  //stub(storage, "getSAWeights", () => Promise.resolve(weights));
  vi.spyOn(data, "getSAWeights").mockResolvedValue(weights);

  result = await getSaPPEAndLevel(skill, responses);
  expect(result.length).toEqual(3);
  expect(result[0]).toEqual(0);
  expect(result[1]).toEqual("");
	expect(result[2]).toEqual("Failed to match skill and raw score to an sa grade");

  //stub(storage, "getSAGrade", () => Promise.resolve(grade));
  vi.spyOn(data, "getSAGrade").mockResolvedValue(grade);

  result = await getSaPPEAndLevel(skill, responses);
  expect(result.length).toEqual(3);
  expect(result[0]).toEqual(ppe);
  expect(result[1]).toEqual(CEFR_LEVELS[grade.grade]);
  expect(result[2]).toEqual(null);
});
