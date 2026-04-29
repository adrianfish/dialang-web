import type {
  Answer,
  DialangSession,
  Item,
  PreestAssignment,
  PreestWeight,
  SAGrade,
  SAWeight,
  TES,
  VSPBand,
  VSPWord } from "../types/types.ts";

export interface Storage {

  saveSession(sessionId: string, session: DialangSession): Promise<boolean>;

  getSession(sessionId: string): Promise<DialangSession>;

  deleteSession(sessionId: string): Promise<void>;

  getTES(sessionId: string): Promise<TES>;

  saveTES(sessionId: string, tes: TES): Promise<boolean>;

  getVSPWords(tl: string): Promise<Array<VSPWord>>;

  getVSPBands(tl: string): Promise<Array<VSPBand>>;

  getSAGrade(skill: string, rsc: number): Promise<SAGrade>;

  getSAWeights(skill: string): Promise<Record<string, number>>;

  getPreestWeight(key: string): Promise<PreestWeight>;

  getPreestAssignments(key: string): Promise<Array<PreestAssignment>>;

  getBookletLength(bookletId: number): Promise<number>;

  getBaskets(bookletId: number): Promise<Array<number>>;

  getItem(id: number): Promise<Item>;

  getAnswer(id: number): Promise<Answer>;

  getItemAnswers(itemId: number): Promise<Array<Answer>>;

  getItemGrade(key: string, rawScore: number): Promise<Record<string, any>>;

  getPunctuationList(): Promise<Array<string>>;

  getTestResults(): Promise<any>;

  logTestStart(session: DialangSession): Promise<boolean>;

  logVsptScores(session: DialangSession): Promise<boolean>;

  logSaScores(session: DialangSession): Promise<boolean>;

  logTestResult(session: DialangSession): Promise<boolean>;

  storeQuestionnaire(sessionId: string, body: any);
}
