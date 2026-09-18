import type { Answer, DialangSession, Item, PreestAssignment, PreestWeight, SAGrade, TestSession, VSPBand, VSPWord } from "../types.ts";

import type { Storage } from "./storage.ts";

export class MockStorage implements Storage {

  saveSession(_sessionId: string, _session: DialangSession): Promise<boolean> {
    return Promise.resolve(false);
  }

  getSession(_sessionId: string): Promise<DialangSession | null> {
    return Promise.resolve(null);
  }

  deleteSession(_sessionId: string): Promise<void> {
    return Promise.resolve();
  }

  getVSPWords(_tl: string): Promise<Array<VSPWord> | null> {
    return Promise.resolve(null);
  }

  getVSPBands(_tl: string): Promise<Array<VSPBand> | null> {
    return Promise.resolve(null);
  }

  getSAGrade(_skill: string, _rsc: number): Promise<SAGrade | null> {
    return Promise.resolve(null);
  }

  getSAWeights(_skill: string): Promise<Record<string, number> | null> {
    return Promise.resolve(null);
  }

  getPreestWeight(_key: string): Promise<PreestWeight | null> {
    return Promise.resolve(null);
  }

  getPreestAssignments(_key: string): Promise<Array<PreestAssignment> | null> {
    return Promise.resolve(null);
  }

  getBookletLength(_bookletId: number): Promise<number | null> {
    return Promise.resolve(null);
  }

  getBaskets(_bookletId: number): Promise<Array<number> | null> {
    return Promise.resolve(null);
  }

  getItem(_id: number): Promise<Item | null> {
    return Promise.resolve(null);
  }

  getAnswer(_id: number): Promise<Answer | null> {
    return Promise.resolve(null);
  }

  getItemAnswers(_itemId: number): Promise<Array<Answer> | null> {
    return Promise.resolve(null)
  }

  getItemGrade(_key: string, _rawScore: number): Promise<Record<string, string | number> | null> {
    return Promise.resolve({});
  }

  getPunctuationList(): Promise<Array<string> | null> {
    return Promise.resolve([]);
  }

  getTestSessions(_completed: boolean): Promise<Array<TestSession>> {
    return Promise.resolve([]);
  }

  logTestStart(_session: DialangSession): Promise<boolean> {
    return Promise.resolve(false);
  }

  logVsptScores(_session: DialangSession): Promise<boolean> {
    return Promise.resolve(false);
  }

  logSaScores(_session: DialangSession): Promise<boolean> {
    return Promise.resolve(false);
  }

  logTestResult(_session: DialangSession): Promise<boolean> {
    return Promise.resolve(false);
  }

  storeQuestionnaire(_sessionId: string, _body: object): Promise<boolean> {
    return Promise.resolve(false);
  }

  getLanguageName(_al: string, _skill: string): Promise<string | null> {
    return Promise.resolve(null);
  }

  getSkillName(_al: string, _skill: string): Promise<string | null> {
    return Promise.resolve(null);
  }
}
