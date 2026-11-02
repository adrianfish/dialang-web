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

import type { Storage } from "./storage.ts";

// Workers KV keys are flat strings, so the hierarchical key parts are joined with ":".
function kvKey(...parts: Array<string | number>): string {
  return parts.join(":");
}

export class KVStorage implements Storage {

  #kv: KVNamespace;

  private constructor(kv: KVNamespace) {
    this.#kv = kv;
  }

  static async open(): Promise<Storage> {
    return new KVStorage(env.DIALANG_KV);
  }

  async getVSPWords(tl: string): Promise<Array<VSPWord> | null> {
    return this.#kv.get<Array<VSPWord>>(kvKey("data", "vspt-words", tl), "json");
  }

  async getVSPBands(tl: string): Promise<Array<VSPBand> | null> {
    return this.#kv.get<Array<VSPBand>>(kvKey("data", "vspt-bands", tl), "json");
  }

  async getSAGrade(skill: string, rsc: number): Promise<SAGrade | null> {
    return this.#kv.get<SAGrade>(kvKey("data", "sa-grades", skill, rsc), "json");
  }

  async getSAWeights(skill: string): Promise<Record<string, number> | null> {
    return this.#kv.get<Record<string, number>>(kvKey("data", "sa-weights", skill), "json");
  }

  async getPreestWeight(key: string): Promise<PreestWeight | null> {
    return this.#kv.get<PreestWeight>(kvKey("data", "preest-weights", key), "json");
  }

  async getPreestAssignments(key: string): Promise<Array<PreestAssignment> | null> {
    return this.#kv.get<Array<PreestAssignment>>(kvKey("data", "preest-assignments", key), "json");
  }

  async getBookletLength(bookletId: number): Promise<number | null> {
    return this.#kv.get<number>(kvKey("data", "booklet-lengths", bookletId), "json");
  }

  async getBaskets(bookletId: number): Promise<Array<number> | null> {
    return this.#kv.get<Array<number>>(kvKey("data", "booklet-baskets", bookletId), "json");
  }

  async getItem(id: number): Promise<Item | null> {
    return this.#kv.get<Item>(kvKey("data", "items", id), "json");
  }

  async getAnswer(id: number): Promise<Answer | null> {
    return this.#kv.get<Answer>(kvKey("data", "answers", id), "json");
  }

  async getItemAnswers(itemId: number): Promise<Array<Answer> | null> {
    return this.#kv.get<Array<Answer>>(kvKey("data", "item-answers", itemId), "json");
  }

  async getItemGrade(key: string, rawScore: number): Promise<Record<string, string | number> | null> {
    console.debug(`Retrieving item grade for key ${key} and raw score ${rawScore} ...`);
    return this.#kv.get<Record<string, string | number>>(kvKey("data", "item-grades", key, rawScore), "json");
  }

  async getLanguageName(al: string, tl: string): Promise<string | null> {

    const names: Record<string, string> | null = await this.#kv.get<Record<string, string>>(kvKey("data", "language-names", al), "json");
    if (!names) {
      console.warn(`No language names found for admin language ${al}`);
      return null;
    }
    return names[tl];
  }

  async getSkillName(al: string, skill: string): Promise<string | null> {
    const names: Record<string, string> | null = await this.#kv.get<Record<string, string>>(kvKey("data", "skill-names", al), "json");
    if (!names) {
      console.warn(`No skill names found for admin language ${al}`);
      return null;
    }
    return names[skill];
  }

  async getPunctuationList(): Promise<Array<string> | null> {
    return this.#kv.get<Array<string>>(kvKey("data", "punctuation"), "json");
  }
}
