import type {
  Answer,
  DialangSession,
  Item,
  PreestAssignment,
  PreestWeight,
  SAGrade,
  SAWeight,
  TES,
  TestSession,
  VSPBand,
  VSPWord } from "../types.ts";

import type { Storage } from "./storage.ts";

export class KVStorage implements Storage {

  #kv: Deno.Kv;

  private constructor(kv: Deno.Kv) {
    this.#kv = kv;
  }
  
  static async open(path?: string): Promise<Storage> {
    return new KVStorage(await Deno.openKv());
  }

  /*
  getKv(): Deno.Kv {
    return this.#kv;
  }
  */

  async saveSession(sessionId: string, session: DialangSession): Promise<boolean> {
    session.lastModified = Date.now();
    //  8 hours from now
    const expireIn = 8 * 60 * 60 * 1000;
    return (await this.#kv.set(["sessions", sessionId], session, { expireIn })).ok;
  }

  async getSession(sessionId: string): Promise<DialangSession | null> {
    return (await this.#kv.get<DialangSession>(["sessions", sessionId])).value;
  }

  deleteSession(sessionId: string): Promise<void> {
    return this.#kv.delete(["sessions", sessionId]);
  }

  async getTES(sessionId: string): Promise<TES | null> {
    return (await this.#kv.get<TES>(["sessions", sessionId, "tes"])).value;
  }

  async saveTES(sessionId: string, tes: TES): Promise<boolean> {
    return (await this.#kv.set(["sessions", sessionId, "tes"], tes)).ok;
  }

  async getVSPWords(tl: string): Promise<Array<VSPWord> | null> {
    return (await this.#kv.get<Array<VSPWord>>([ "data", "vspt-words", tl])).value;
  }

  async getVSPBands(tl: string): Promise<Array<VSPBand> | null> {
    return (await this.#kv.get<Array<VSPBand>>([ "data", "vspt-bands", tl])).value;
  }

  async getSAGrade(skill: string, rsc: number): Promise<SAGrade | null> {
    return (await this.#kv.get<SAGrade>([ "data", "sa-grades", skill, rsc ])).value;
  }

  async getSAWeights(skill: string): Promise<Record<string, number> | null> {
    return (await this.#kv.get<Record<string, number>>([ "data", "sa-weights", skill ])).value;
  }

  async getPreestWeight(key: string): Promise<PreestWeight | null> {
    return (await this.#kv.get<PreestWeight>([ "data", "preest-weights", key ])).value;
  }

  async getPreestAssignments(key: string): Promise<Array<PreestAssignment> | null> {
    return (await this.#kv.get<Array<PreestAssignment>>([ "data", "preest-assignments", key ])).value;
  }

  async getBookletLength(bookletId: number): Promise<number | null> {
    return (await this.#kv.get<number>([ "data", "booklet-lengths", bookletId ])).value;
  }

  async getBaskets(bookletId: number): Promise<Array<number> | null> {
    return (await this.#kv.get<Array<number>>([ "data", "booklet-baskets", bookletId ])).value;
  }

  async getItem(id: number): Promise<Item | null> {
    return (await this.#kv.get<Item>([ "data", "items", id ])).value;
  }

  async getAnswer(id: number): Promise<Answer | null> {
    return (await this.#kv.get<Answer>([ "data", "answers", id ])).value;
  }

  async getItemAnswers(itemId: number): Promise<Array<Answer> | null> {
    return (await this.#kv.get<Array<Answer>>([ "data", "item-answers", itemId ])).value;
  }

  async getItemGrade(key: string, rawScore: number): Promise<Record<string, string | number> | null> {
    console.debug(`Retrieving item grade for key ${key} and raw score ${rawScore} ...`);
    return (await this.#kv.get<Record<string, any>>([ "data", "item-grades", key, rawScore ])).value;
  }

  async getLanguageName(al: string, tl: string): Promise<string | null> {

    const names: Record<string, string> | null = (await this.#kv.get<Record<string, string>>([ "data", "language-names", al ])).value;
    if (!names) {
      console.warn(`No language names found for admin language ${al}`);
      return null;
    }
    return names[tl];
  }

  async getSkillName(al: string, skill: string): Promise<string | null> {
    const names: Record<string, string> | null = (await this.#kv.get<Record<string, string>>([ "data", "skill-names", al ])).value;
    if (!names) {
      console.warn(`No skill names found for admin language ${al}`);
      return null;
    }
    return names[skill];
  }

  async getPunctuationList(): Promise<Array<string> | null> {
    return (await this.#kv.get<Array<string>>([ "data", "punctuation" ])).value;
  }

  async getTestResults(): Promise<Array<TestSession>> {

    const data: Array<TestSession> = [];
    const iter = this.#kv.list<TestSession>({ prefix: [ "datacapture", "tests-taken" ] });
    for await (const entry of iter) {
      data.push(entry.value);
    }
    return data;
  }

  async logTestStart(session: DialangSession): Promise<boolean> {

    const data: TestSession = {
      sessionId: session.id,
      ipAddress: session.ipAddress,
      referrer: session.referrer,
      al: session.al,
      tl: session.tl,
      skill: session.skill,
      started: session.started,
    };

    return this.setTestSession(data);
  }

  async logVsptScores(session: DialangSession): Promise<boolean> {

    const testSession: TestSession | null = await this.getTestSession(session.id);

    if (!testSession) {
      console.warn(`No test session for sessionId ${session.id}`);
      return false;
    }

    testSession.vsptZScore = session.vsptZScore;
    testSession.vsptMearaScore = session.vsptMearaScore;
    testSession.vsptLevel = session.vsptLevel;
    return this.setTestSession(testSession);
  }

  async logSaScores(session: DialangSession): Promise<boolean> {

    const testSession: TestSession | null = await this.getTestSession(session.id);

    if (!testSession) {
      console.warn(`No test session for sessionId ${session.id}`);
      return false;
    }

	  testSession.saPPE = session.saPPE;
	  testSession.saLevel = session.saLevel;
    return this.setTestSession(testSession);
  }

  async logTestResult(session: DialangSession): Promise<boolean> {

    const testSession: TestSession | null = await this.getTestSession(session.id);

    if (!testSession) {
      console.warn(`No test session for sessionId ${session.id}`);
      return false;
    }

    testSession.itemRawScore = session.itemRawScore;
    testSession.itemGrade = session.itemGrade;
    testSession.itemLevel = session.itemLevel;
    return this.setTestSession(testSession);
  }

  async storeQuestionnaire(sessionId: string, body: any): Promise<boolean> {

    const testSession: TestSession | null = await this.getTestSession(sessionId);

    if (!testSession) {
      console.warn(`No test session for sessionId ${sessionId}`);
      return false;
    }

    testSession.questionnaire = {
      ...body, 
      gender: body.gender === "-1" ? "n/a" : body.gender === "other" ? body.othergender : body.gender,
    };

    return this.setTestSession(testSession);
  }

  async getTestSession(id: string): Promise<TestSession | null> {
    return (await this.#kv.get<TestSession>([ "datacapture", "tests-taken", id ])).value;
  }

  async setTestSession(testSession: TestSession): Promise<boolean> {
    return (await this.#kv.set([ "datacapture", "tests-taken", testSession.sessionId ], testSession)).ok;
  }
}
