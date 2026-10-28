import { Storage } from "@cloudflare/actors/storage";
import { DurableObject } from "cloudflare:workers";

import type {
  ALData,
  CurrentBasketData,
  StartTestRequirements,
  SubmitBasketRequirements,
  TestData,
  TestResult,
  VSPTData,
  SAData
} from "../types.ts";

export interface Env {
  SESSION: DurableObjectNamespace<SessionDO>;
}

export class SessionDO extends DurableObject<Env> {

  async setAdminLanguage(alData: ALData): Promise {
    return this.ctx.storage.put(alData);
  }

  async setTestLanguageAndSkill(passId: string, tl: string, skill: string): Promise {
    return this.ctx.storage.put({ passId, tl, skill });
  }

  async getPassId(): Promise<string> {
    return this.ctx.storage.get("passId");
  }

  async getTL(): Promise<string> {
    return this.ctx.storage.get("tl");
  }

  async getSkill(): Promise<string> {
    return this.ctx.storage.get("skill");
  }

  async getStartTestRequirements(): Promise<StartTestRequirements> {

    const keys: Array<string> = ["tl", "skill", "vsptSubmitted", "saSubmitted", "vsptZScore", "saPPE", "scoredItems"];
    const data = await this.ctx.storage.get(keys);
    return {
      tl: data.get("tl"),
      skill: data.get("skill"),
      vsptSubmitted: data.get("vsptSubmitted"),
      saSubmitted: data.get("saSubmitted"),
      vsptZScore: data.get("vsptZScore"),
      saPPE: data.get("saPPE"),
      scoredItems: data.get("scoredItems"),
    };
  }

  async getSubmitBasketRequirements(): Promise<SubmitBasketRequirements> {

    const keys: Array<string> = [
      "tl",
      "skill",
      "currentBasketId",
      "bookletId",
      "currentBasketNumber",
      "scoredItems",
      "itemScores",
      "scoredBaskets",
      "resultUrl"
    ];
    const data = await this.ctx.storage.get(keys);
    return {
      tl: data.get("tl"),
      skill: data.get("skill"),
      currentBasketId: data.get("currentBasketId"),
      bookletId: data.get("bookletId"),
      currentBasketNumber: data.get("currentBasketNumber"),
      scoredItems: data.get("scoredItems"),
      itemScores: data.get("itemScores"),
      scoredBaskets: data.get("scoredBaskets"),
      itemRawScore: data.get("itemRawScore"),
      itemGrade: data.get("itemGrade"),
      itemLevel: data.get("itemLevel"),
      resultUrl: data.get("resultUrl"),
    };
  }

  async saveVSPT(vsptData: VSPTData): Promise {
    return this.ctx.storage.put(vsptData);
  }

  async saveSA(saData: SAData): Promise {
    return this.ctx.storage.put(saData);
  }

  async saveStartTestData(testData: TestData): Promise {
    return this.ctx.storage.put(testData);
  }

  async saveCurrentBasketData(currentBasketData: CurrentBasketData): Promise {
    return this.ctx.storage.put(currentBasketData);
  }

  async saveTestResult(testResult: TestResult): Promise {
    return this.ctx.storage.put(testResult);
  }

  async getTestSession(): Promise<TestSession> {

    const keys: Array<string> = [
      "sessionId",
      "ipAddress",
      "referrer",
      "al",
      "tl",
      "skill",
      "started",
      "vsptZScore",
      "vsptMearaScore",
      "vsptLevel",
      "saPPE",
      "saLevel",
      "itemRawScore",
      "itemGrade",
      "itemLevel",
    ];

    return Object.fromEntries(await this.ctx.storage.get(keys));
  }

  async clearTestData(): Promise<void> {

    const keys: Array<string> = [
      "passId",
      "bookletId",
      "currentBasketId",
      "currentBasketNumber",
      "itemScores",
      "saSubmitted",
      "vsptSubmitted",
      "tl",
      "skill",
      "vsptZScore",
      "vsptMearaScore",
      "vsptLevel",
      "saPPE",
      "saLevel",
      "itemRawScore",
      "itemGrade",
      "itemLevel",
    ];

    await this.ctx.storage.delete(keys);
  }
}
