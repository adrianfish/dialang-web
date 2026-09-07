import type { Answer, DialangSession, Item, PreestAssignment, PreestWeight, SAGrade, TestSession, TES, VSPBand, VSPWord } from "../types.ts";

import type { Storage } from "./storage.ts";

export class MockStorage implements Storage {

  saveSession(_sessionId: string, _session: DialangSession): Promise<boolean> {
    return false;
  }

  getSession(_sessionId: string): Promise<DialangSession | null> {
    return null;
  }

  deleteSession(_sessionId: string): Promise<void> {
    return;
  }

  getTES(_sessionId: string): Promise<TES | null> {
    return null;
  }

  saveTES(_sessionId: string, _tes: TES): Promise<boolean> {
    return false;
  }

  getVSPWords(_tl: string): Promise<Array<VSPWord> | null> {
    return null;
  }

  getVSPBands(_tl: string): Promise<Array<VSPBand> | null> {
    return null;
  }

  getSAGrade(_skill: string, _rsc: number): Promise<SAGrade | null> {
    return null;
  }

  getSAWeights(_skill: string): Promise<Record<string, number> | null> {
    return null;
  }

  getPreestWeight(_key: string): Promise<PreestWeight | null> {
    return null;
  }

  getPreestAssignments(_key: string): Promise<Array<PreestAssignment> | null> {
    return null;
  }

  getBookletLength(_bookletId: number): Promise<number | null> {
    return null;
  }

  getBaskets(_bookletId: number): Promise<Array<number> | null> {
    return null;
  }

  getItem(_id: number): Promise<Item | null> {
    return null;
  }

  getAnswer(_id: number): Promise<Answer | null> {
    return null;
  }

  getItemAnswers(_itemId: number): Promise<Array<Answer> | null> {
    return null
  }

  getItemGrade(_key: string, _rawScore: number): Promise<Record<string, string | number> | null> {
    return {};
  }

  getPunctuationList(): Promise<Array<string> | null> {
    return [];
  }

  getTestResults(): Promise<Array<TestSession>> {
    return [];
  }

  logTestStart(_session: DialangSession): Promise<boolean> {
    return false;
  }

  logVsptScores(_session: DialangSession): Promise<boolean> {
    return false;
  }

  logSaScores(_session: DialangSession): Promise<boolean> {
    return false;
  }

  logTestResult(_session: DialangSession): Promise<boolean> {
    return false;
  }

  storeQuestionnaire(_sessionId: string, _body: object): Promise<boolean> {
    return false;
  }

  getLanguageName(_al: string, _skill: string): Promise<string | null> {
    return null;
  }

  getSkillName(_al: string, _skill: string): Promise<string | null> {
    return null;
  }
}
