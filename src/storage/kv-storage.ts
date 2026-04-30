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

  async saveSession(sessionId: string, session: DialangSession): Promise<boolean> {
    session.lastModified = Date.now();
    const expireIn = 8 * 60 * 60 * 1000;
    return (await this.#kv.set(["sessions", sessionId], session, { expireIn })).ok;
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
    return (await this.#kv.get([ "data", "vspt-words", tl])).value;
  }

  async getVSPBands(tl: string): Promise<Array<VSPBand>> {
    return (await this.#kv.get([ "data", "vspt-bands", tl])).value;
  }

  async getSAGrade(skill: string, rsc: number): Promise<SAGrade> {
    return (await this.#kv.get([ "data", "sa-grades", skill, rsc ])).value;
  }

  async getSAWeights(skill: string): Promise<Record<string, number>> {
    return (await this.#kv.get([ "data", "sa-weights", skill ])).value;
  }

  async getPreestWeight(key: string): Promise<PreestWeight> {
    return (await this.#kv.get([ "data", "preest-weights", key ])).value;
  }

  async getPreestAssignments(key: string): Promise<Array<PreestAssignment>> {
    return (await this.#kv.get([ "data", "preest-assignments", key ])).value;
  }

  async getBookletLength(bookletId: number): Promise<number> {
    return (await this.#kv.get([ "data", "booklet-lengths", bookletId ])).value;
  }

  async getBaskets(bookletId: number): Promise<Array<number>> {
    return (await this.#kv.get([ "data", "booklet-baskets", bookletId ])).value;
  }

  async getItem(id: number): Promise<Item> {
    return (await this.#kv.get([ "data", "items", id ])).value;
  }

  async getAnswer(id: number): Promise<Answer> {
    return (await this.#kv.get([ "data", "answers", id ])).value;
  }

  async getItemAnswers(itemId: number): Promise<Array<Answer>> {
    return (await this.#kv.get([ "data", "item-answers", itemId ])).value;
  }

  async getItemGrade(key: string, rawScore: number): Promise<Record<string, any>> {
    console.debug(`Retrieving item grade for key ${key} and raw score ${rawScore} ...`);
    return (await this.#kv.get([ "data", "item-grades", key, rawScore ])).value;
  }

  async getPunctuationList(): Promise<Array<string>> {
    return (await this.#kv.get([ "data", "punctuation" ])).value;
  }

  async getTestResults(): Promise<Array<any>> {

    const data = [];
    const iter = this.#kv.list({ prefix: [ "datacapture", "tests-taken" ] });
    for await (const entry of iter) {
      data.push(entry.value);
    }
    return data;
  }

  async logTestStart(session: DialangSession): Promise<boolean> {

    const data = {
      sessionId: session.id,
      ipAddress: session.ipAddress,
      referrer: session.referrer,
      al: session.al,
      tl: session.tl,
      skill: session.skill,
      started: session.lastModified,
    };

    return this.setTestSession(data);
  }

  async logVsptScores(session: DialangSession): Promise<boolean> {

    const testSession = await this.getTestSession(session.id);
    testSession.vsptZScore = session.vsptZScore;
    testSession.vsptMearaScore = session.vsptMearaScore;
    testSession.vsptLevel = session.vsptLevel;
    return this.setTestSession(testSession);
  }

  async logSaScores(session: DialangSession): Promise<boolean> {

    const testSession = await this.getTestSession(session.id);
	  testSession.saPPE = session.saPPE;
	  testSession.saLevel = session.saLevel;
    return this.setTestSession(testSession);
  }

  async logTestResult(session: DialangSession): Promise<boolean> {

    const testSession = await this.getTestSession(session.id);
    testSession.itemRawScore = session.itemRawScore;
    testSession.itemGrade = session.itemGrade;
    testSession.itemLevel = session.itemLevel;
    return this.setTestSession(testSession);
  }

  async storeQuestionnaire(sessionId: string, body: any): Promise<boolean> {

    const testSession = await this.getTestSession(sessionId);

    testSession.questionnaire = {
      ...body, 
      gender: body.gender === "-1" ? "n/a" : body.gender === "other" ? body.othergender : body.gender,
    };

    return this.setTestSession(testSession);
  }

  async getTestSession(id): Promise<any> {
    return (await this.#kv.get([ "datacapture", "tests-taken", id ])).value;
  }

  async setTestSession(testSession): Promise<boolean> {
    return (await this.#kv.set([ "datacapture", "tests-taken", testSession.sessionId ], testSession)).ok;
  }
}
