import type { Answer, DialangSession, Item, PreestAssignment, PreestWeight, SAGrade, SAWeight, TES, VSPBand, VSPWord } from "../types.ts";

import type { Storage } from "./storage.ts";

export class MockStorage implements Storage {

  async saveSession(sessionId: string, session: DialangSession): Promise<boolean> {
    return false;
  }

  async getSession(sessionId: string): Promise<DialangSession | null> {
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    return;
  }

  async getTES(sessionId: string): Promise<TES | null> {
    return null;
  }

  async saveTES(sessionId: string, tes: TES): Promise<boolean> {
    return false;
  }

  async getVSPWords(tl: string): Promise<Array<VSPWord> | null> {
    return null;
  }

  async getVSPBands(tl: string): Promise<Array<VSPBand> | null> {
    return null;
  }

  async getSAGrade(skill: string, rsc: number): Promise<SAGrade | null> {
    return null;
  }

  async getSAWeights(skill: string): Promise<Record<string, number> | null> {
    return null;
  }

  async getPreestWeight(key: string): Promise<PreestWeight | null> {
    return null;
  }

  async getPreestAssignments(key: string): Promise<Array<PreestAssignment> | null> {
    return null;
  }

  async getBookletLength(bookletId: number): Promise<number | null> {
    return null;
  }

  async getBaskets(bookletId: number): Promise<Array<number> | null> {
    return null;
  }

  async getItem(id: number): Promise<Item | null> {
    return null;
  }

  async getAnswer(id: number): Promise<Answer | null> {
    return null;
  }

  async getItemAnswers(itemId: number): Promise<Array<Answer> | null> {
    return null
  }

  async getItemGrade(key: string, rawScore: number): Promise<Record<string, any>> {
    return {};
  }

  async getPunctuationList(): Promise<Array<string> | null> {
    return [];
  }

  async getTestResults(): Promise<any> {
    return {};
  }

  async logTestStart(session: DialangSession): Promise<boolean> {
    return false;
  }

  async logVsptScores(session: DialangSession): Promise<boolean> {
    return false;
  }

  async logSaScores(session: DialangSession): Promise<boolean> {
    return false;
  }

  async logTestResult(session: DialangSession): Promise<boolean> {
    return false;
  }

  async storeQuestionnaire(sessionId: string, body: any): Promise<boolean> {
    return false;
  }
}
