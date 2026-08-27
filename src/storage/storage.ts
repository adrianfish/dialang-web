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
  VSPWord } from "../types.ts";

export interface Storage {

  saveSession(sessionId: string, session: DialangSession): Promise<boolean>;

  getSession(sessionId: string): Promise<DialangSession | null>;

  deleteSession(sessionId: string): Promise<void>;

  getTES(sessionId: string): Promise<TES | null>;

  saveTES(sessionId: string, tes: TES): Promise<boolean>;

  getVSPWords(tl: string): Promise<Array<VSPWord> | null>;

  getVSPBands(tl: string): Promise<Array<VSPBand> | null>;

  getSAGrade(skill: string, rsc: number): Promise<SAGrade | null>;

  getSAWeights(skill: string): Promise<Record<string, number> | null>;

  getPreestWeight(key: string): Promise<PreestWeight | null>;

  getPreestAssignments(key: string): Promise<Array<PreestAssignment> | null>;

  getBookletLength(bookletId: number): Promise<number | null>;

  getBaskets(bookletId: number): Promise<Array<number> | null>;

  getItem(id: number): Promise<Item | null>;

  getAnswer(id: number): Promise<Answer | null>;

  getItemAnswers(itemId: number): Promise<Array<Answer> | null>;

  getItemGrade(key: string, rawScore: number): Promise<Record<string, any> | null>;

  getPunctuationList(): Promise<Array<string> | null>;

  getTestResults(): Promise<any>;

  logTestStart(session: DialangSession): Promise<boolean>;

  logVsptScores(session: DialangSession): Promise<boolean>;

  logSaScores(session: DialangSession): Promise<boolean>;

  logTestResult(session: DialangSession): Promise<boolean>;

  storeQuestionnaire(sessionId: string, body: any): Promise<boolean>;

  getLanguageName(al: string, skill: string): Promise<string | null>;

  getSkillName(al: string, skill: string): Promise<string | null>;
}
