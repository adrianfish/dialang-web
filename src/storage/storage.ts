import type {
  Answer,
  DialangSession,
  Item,
  PreestAssignment,
  PreestWeight,
  SAGrade,
  SavedDialangSession,
  TestSession,
  VSPBand,
  VSPWord
} from "../types.ts";

export interface Storage {

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

  getItemGrade(key: string, rawScore: number): Promise<Record<string, string | number> | null>;

  getPunctuationList(): Promise<Array<string> | null>;

  getLanguageName(al: string, skill: string): Promise<string | null>;

  getSkillName(al: string, skill: string): Promise<string | null>;
}
