import { env } from "cloudflare:workers";

import type {
  Answer,
  DialangSession,
  Item,
  PreestAssignment,
  PreestWeight,
  Questionnaire,
  SAGrade,
  SavedDialangSession,
  TestSession,
  VSPBand,
  VSPWord } from "../types.ts";

// Workers KV keys are flat strings, so the hierarchical key parts are joined with ":".
function kvKey(...parts: Array<string | number>): string {
  return parts.join(":");
}

export async function getVSPWords(tl: string): Promise<Array<VSPWord> | null> {
  return env.DIALANG_DATA.get<Array<VSPWord>>(kvKey("data", "vspt-words", tl), "json");
}

export async function getVSPBands(tl: string): Promise<Array<VSPBand> | null> {
  return env.DIALANG_DATA.get<Array<VSPBand>>(kvKey("data", "vspt-bands", tl), "json");
}

export async function getSAGrade(skill: string, rsc: number): Promise<SAGrade | null> {
  return env.DIALANG_DATA.get<SAGrade>(kvKey("data", "sa-grades", skill, rsc), "json");
}

export async function getSAWeights(skill: string): Promise<Record<string, number> | null> {
  return env.DIALANG_DATA.get<Record<string, number>>(kvKey("data", "sa-weights", skill), "json");
}

export async function getPreestWeight(key: string): Promise<PreestWeight | null> {
  return env.DIALANG_DATA.get<PreestWeight>(kvKey("data", "preest-weights", key), "json");
}

export async function getPreestAssignments(key: string): Promise<Array<PreestAssignment> | null> {
  return env.DIALANG_DATA.get<Array<PreestAssignment>>(kvKey("data", "preest-assignments", key), "json");
}

export async function getBookletLength(bookletId: number): Promise<number | null> {
  return env.DIALANG_DATA.get<number>(kvKey("data", "booklet-lengths", bookletId), "json");
}

export async function getBaskets(bookletId: number): Promise<Array<number> | null> {
  return env.DIALANG_DATA.get<Array<number>>(kvKey("data", "booklet-baskets", bookletId), "json");
}

export async function getItem(id: number): Promise<Item | null> {
  return env.DIALANG_DATA.get<Item>(kvKey("data", "items", id), "json");
}

export async function getAnswer(id: number): Promise<Answer | null> {
  return env.DIALANG_DATA.get<Answer>(kvKey("data", "answers", id), "json");
}

export async function getItemAnswers(itemId: number): Promise<Array<Answer> | null> {
  return env.DIALANG_DATA.get<Array<Answer>>(kvKey("data", "item-answers", itemId), "json");
}

export async function getItemGrade(key: string, rawScore: number): Promise<Record<string, string | number> | null> {
  console.debug(`Retrieving item grade for key ${key} and raw score ${rawScore} ...`);
  return env.DIALANG_DATA.get<Record<string, string | number>>(kvKey("data", "item-grades", key, rawScore), "json");
}

export async function getLanguageName(al: string, tl: string): Promise<string | null> {

  const names: Record<string, string> | null = await env.DIALANG_DATA.get<Record<string, string>>(kvKey("data", "language-names", al), "json");
  if (!names) {
    console.warn(`No language names found for admin language ${al}`);
    return null;
  }
  return names[tl];
}

export async function getSkillName(al: string, skill: string): Promise<string | null> {
  const names: Record<string, string> | null = await env.DIALANG_DATA.get<Record<string, string>>(kvKey("data", "skill-names", al), "json");
  if (!names) {
    console.warn(`No skill names found for admin language ${al}`);
    return null;
  }
  return names[skill];
}

export async function getPunctuationList(): Promise<Array<string> | null> {
  return env.DIALANG_DATA.get<Array<string>>(kvKey("data", "punctuation"), "json");
}
