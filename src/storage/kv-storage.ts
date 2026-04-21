import type { Answer, DialangSession, Item, PreestAssignment, PreestWeight, SAGrade, SAWeight, Storage, TES, VSPBand, VSPWord } from "../types/types.ts";

import type { Storage } from "./storage.ts";

export class KVStorage implements Storage {

  #kv: Deno.Kv;

  private constructor(kv: Deno.Kv) {
    this.#kv = kv;
  }
  
  static async open(path?: string): Promise<Storage> {
    return new KVStorage(await Deno.openKv());
  }

  getKv() {
    return this.#kv;
  }

  saveSession(sessionId: string, session: DialangSession): Promise<boolean> {
    session.lastModified = Date.now();
    const expireIn = 8 * 60 * 60 * 1000;
    this.#kv.set(["sessions", sessionId], session, { expireIn });
  }

  async getSession(sessionId: string): Promise<DialangSession> {
    return (await this.#kv.get(["sessions", sessionId])).value;
  }

  deleteSession(sessionId: string): Promise<void> {
    return this.#kv.delete(["sessions", sessionId]);
  }

  async getTES(sessionId: string): Promise<TES> {
    return (await this.#kv.get(["sessions", sessionId, "tes"])).value;
  }

  saveTES(sessionId: string, tes: TES): Promise<boolean> {
    this.#kv.set(["sessions", sessionId, "tes"], tes);
  }

  async getVSPWords(tl: string): Promise<Array<VSPWord>> {
    return (await this.#kv.get([ "vsp_words", tl])).value;
  }

  async getVSPBands(tl: string): Promise<Array<VSPBand>> {
    return (await this.#kv.get([ "vsp_bands", tl])).value;
  }

  async getSAGrade(skill: string, rsc: number): Promise<SAGrade> {
    return (await this.#kv.get([ "sa_grades", skill, rsc ])).value;
  }

  async getSAWeights(skill: string): Promise<Record<string, number>> {
    return (await this.#kv.get([ "sa_weights", skill ])).value;
  }

  async getPreestWeight(key: string): Promise<PreestWeight> {
    return (await this.#kv.get([ "preest_weights", key ])).value;
  }

  async getPreestAssignments(key: string): Promise<Array<PreestAssignment>> {
    return (await this.#kv.get([ "preest_assignments", key ])).value;
  }

  async getBookletLength(bookletId: number): Promise<number> {
    return (await this.#kv.get([ "booklet_lengths", bookletId ])).value;
  }

  async getBaskets(bookletId: number): Promise<Array<number>> {
    return (await this.#kv.get([ "booklet_baskets", bookletId ])).value;
  }

  async getItem(id: number): Promise<Item> {
    return (await this.#kv.get([ "items", id ])).value;
  }

  async getAnswer(id: number): Promise<Answer> {
    return (await this.#kv.get([ "answers", id ])).value;
  }

  async getItemAnswers(itemId: number): Promise<Array<Answer>> {
    return (await this.#kv.get([ "item_answers", itemId ])).value;
  }

  async getItemGrade(key: string, rawScore: number): Promise<Record<string, any>> {
    console.debug(`Retrieving item grade for key ${key} and raw score ${rawScore} ...`);
    return (await this.#kv.get([ "item_grades", key, rawScore ])).value;
  }

  async getPunctuationList(): Promise<Array<string>> {
    return (await this.#kv.get([ "punctuation" ])).value;
  }
}
