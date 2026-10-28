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

  async saveSession(sessionId: string, session: DialangSession): Promise<boolean> {
    try {
      session.lastModified = Date.now();
      //  8 hours from now
      const expirationTtl = 8 * 60 * 60;
      await this.#kv.put(kvKey("sessions", sessionId), JSON.stringify(session), { expirationTtl });
      return true;
    } catch (error) {
      console.error(`Failed to save session ${sessionId}`, error);
      return false;
    }
  }

  async getSession(sessionId: string): Promise<DialangSession | null> {
    return this.#kv.get<DialangSession>(kvKey("sessions", sessionId), "json");
  }

  async saveSavedSession(session: SavedDialangSession): Promise<boolean> {
    try {
      session.savedAt = Date.now();
      //  48 hours from now
      const expirationTtl = 48 * 60 * 60;
      await this.#kv.put(kvKey("saved-sessions", session.saveToken), JSON.stringify(session), { expirationTtl });
      return true;
    } catch (error) {
      console.error(`Failed to save saved-session ${session.saveToken}`, error);
      return false;
    }
  }

  async getSavedSession(saveToken: string): Promise<SavedDialangSession | null> {
    return this.#kv.get<SavedDialangSession>(kvKey("saved-sessions", saveToken), "json");
  }

  deleteSession(sessionId: string): Promise<void> {
    return this.#kv.delete(kvKey("sessions", sessionId));
  }

  deleteSavedSession(sessionId: string): Promise<void> {
    return this.#kv.delete(kvKey("saved-sessions", sessionId));
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

  async getTestSessions(completed?: boolean): Promise<Array<TestSession>> {

    const data: Array<TestSession> = [];
    const prefix: string = kvKey("datacapture", "tests-taken");
    let cursor: string | undefined = undefined;
    let listComplete = false;

    do {
      const page = await this.#kv.list({ prefix, cursor });
      const names = page.keys.map((k) => k.name);

      const maxKeys = 100;
      for (let i = 0; i < names.length; i += maxKeys) {
        const batch = names.slice(i, i + maxKeys);
        const results = await this.#kv.get<TestSession>(batch, "json");

        for (const session of results.values()) {
          if (!session) continue;
          if (completed) {
            session.itemLevel && data.push(session);
          } else {
            data.push(session);
          }
        }
      }

      cursor = page.cursor;
      listComplete = page.list_complete;
    } while (!listComplete);

    return data;
  }

  async logTestStart(session: DialangSession): Promise<boolean> {
    try {
      const data: TestSession = {
        sessionId: session.id,
        ipAddress: session.ipAddress,
        referrer: session.referrer,
        al: session.al,
        tl: session.tl,
        skill: session.skill,
        started: session.started,
      };

      return await this.setTestSession(data);
    } catch (error) {
      console.error(`Failed to log test start for session ${session.id}`, error);
      return false;
    }
  }

  async storeQuestionnaire(sessionId: string, body: Questionnaire): Promise<boolean> {
    try {
      const testSession: TestSession | null = await this.getTestSession(sessionId);

      if (!testSession) {
        console.warn(`No test session for sessionId ${sessionId}`);
        return false;
      }

      const questionnaire = {
        ...body,
        gender: body.gender === "-1" ? "n/a" : body.gender === "other" ? body.othergender : body.gender,
      };

      await this.#kv.put(kvKey("datacapture", "questionnaires", testSession.sessionId), JSON.stringify(questionnaire));
      return true;
    } catch (error) {
      console.error(`Failed to store questionnaire for session ${sessionId}`, error);
      return false;
    }
  }

  async getTestSession(id: string): Promise<TestSession | null> {
    return this.#kv.get<TestSession>(kvKey("datacapture", "tests-taken", id), "json");
  }

  async setTestSession(testSession: TestSession): Promise<boolean> {
    try {
      await this.#kv.put(kvKey("datacapture", "tests-taken", testSession.sessionId), JSON.stringify(testSession));
      return true;
    } catch (error) {
      console.error(`Failed to set test session ${testSession.sessionId}`, error);
      return false;
    }
  }
}
