import { expect } from "@std/expect";
import { stub } from "jsr:@std/testing/mock";
import { CEFR_LEVELS, getItemGrade }  from "./scoring.ts";
import type { ScoredItem }  from "../types/types.ts";
import type { Storage }  from "../storage/storage.ts";
import { MockStorage }  from "../storage/mock-storage.ts";

Deno.test("getItemGrade returns defaults when no grade bands present", async () => {

  const tl = "spa_es";
  const skill = "reading";
  const bookletId = 1;

  const storage: Storage = new MockStorage();

  // Test the error condition
  stub(storage, "getItemGrades", () => Promise.resolve([null, "No grades"]));
  const [ rawScore, grade, level ] = await getItemGrade(tl, skill, bookletId, [], storage);
  expect(grade).toEqual(0);
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
    },
    {
      id: 2,
      type: "mcq",
      skill,
      subskill: "IT",
      position: 1,
      weight: 1,
      score: 1,
    },
  ];

  const [ rawScore, grade, level ] = await getItemGrade(tl, skill, bookletId, scoredItems, storage);
  expect(rawScore).toEqual(scoredItems.reduce((acc, curr) => acc + curr.score, 0));
  expect(grade).toEqual(itemGrade.grade);
  expect(level).toEqual(CEFR_LEVELS[grade]);
});
