import type { Answer, DialangSession, Item, PreestAssignment, PreestWeight, SAGrade, SAWeight, TES, VSPBand, VSPWord } from "../types/types.ts";

import type { Storage } from "./storage.ts";

export class MockStorage implements Storage {

  saveSession(sessionId: string, session: DialangSession) { }

  async getSession(sessionId: string): Promise<DialangSession> {
    return undefined;
  }

  deleteSession(sessionId: string): Promise<void> {
    return Promise.resolve(void);
  }

  async getTES(sessionId: string): Promise<TES> {
    return null;
  }

  saveTES(sessionId: string, tes: TES) { }

  getVSPWords(tl: string): Promise<Array<VSPWord>> {
    return null;
  }

  async getVSPBands(tl: string): Promise<Array<VSPBand>> {
    return null;
  }

  async getSAGrade(skill: string, rsc: number): Promise<SAGrade> {
    return null;
  }

  async getSAWeights(skill: string): Promise<Record<string, number>> {
    return null;
  }

  async getPreestWeight(key: string): Promise<PreestWeight> {
    return null;
  }

  async getPreestAssignments(key: string): Promise<Array<PreestAssignment>> {
    return null;
  }

  async getBookletLength(bookletId: number): Promise<number> {
    return null;
  }

  async getBaskets(bookletId: number): Promise<Array<number>> {
    return null;
  }

  async getItem(id: number): Promise<Item> {
    return null;
  }

  async getAnswer(id: number): Promise<Answer> {
    return null;
  }

  async getItemAnswers(itemId: number): Promise<Array<Answer>> {
    return null;
  }

  async getItemGrade(key: string, rawScore: number): Promise<Record<string, any>> {
    return null;
  }

  async getPunctuationList(): Promise<Array<string>> {
    return null;
  }

  async getTestResults(): Promise<any> {
    return {};
  }

  logTestStart(session: DialangSession): Promise<boolean> {
    return false;
  }

  logVsptScores(session: DialangSession): Promise<boolean> {
    return false;
  }

  logSaScores(session: DialangSession): Promise<boolean> {
    return false;
  }

  logTestResult(session: DialangSession): Promise<boolean> {
    return false;
  }

  storeQuestionnaire(sessionId: string, body: any) { }
}
