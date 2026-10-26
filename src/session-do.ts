import { Storage } from "@cloudflare/actors/storage";
import { DurableObject } from "cloudflare:workers";

export interface Env {
  SESSION: DurableObjectNamespace<SessionDO>;
}

export class SessionDO extends DurableObject<Env> {

  async setAdminLanguage(alData: ALData) {

    this.ctx.storage.put("sessionId", alData.sessionId);
    this.ctx.storage.put("al", alData.al);
    this.ctx.storage.put("started", alData.started);
    this.ctx.storage.put("ipAddress", alData.ipAddress);
    this.ctx.storage.put("referrer", alData.referrer);
  }

  async setTestLanguageAndSkill(tl: string, skill: string): Promise<boolean> {

    this.ctx.storage.put("tl", tl);
    this.ctx.storage.put("skill", skill);
  }

  async getTL(): Promise<string> {
    return this.ctx.storage.get("tl");
  }

  async getSkill(): Promise<string> {
    return this.ctx.storage.get("skill");
  }

  async getVsptSubmitted(): Promise<boolean> {
    return this.ctx.storage.get("vsptSubmitted");
  }

  async getScoredItems(): Promise<Array<ScoredItem> | null> {

    const scoredItemsJson: string | null = this.ctx.storage.get("scoredItems");
    if (!scoredItemsJson) {
      return null;
    }
    return JSON.parse(scoredItemsJson);
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

  async saveVSPT(vsptData: VSPTData) {

    this.ctx.storage.put("vsptZScore", vsptData.zScore);
    this.ctx.storage.put("vsptMearaScore", vsptData.mearaScore);
    this.ctx.storage.put("vsptLevel", vsptData.level);
    this.ctx.storage.put("vsptSubmitted", vsptData.submitted);
  }

  async saveSA(saData: SAData) {

    this.ctx.storage.put("saPPE", saData.ppe);
    this.ctx.storage.put("saLevel", saData.level);
    this.ctx.storage.put("saSubmitted", saData.submitted);
  }

  async saveStartTestData(testData: TestData) {

    this.ctx.storage.put("bookletId", testData.bookletId);
    this.ctx.storage.put("currentBasketId", testData.currentBasketId);
    this.ctx.storage.put("currentBasketNumber", testData.currentBasketNumber);
  }

  async saveCurrentBasketData(currentBasketData: CurrentBasketData) {

    this.ctx.storage.put("currentBasketId", currentBasketData.currentBasketId);
    this.ctx.storage.put("currentBasketNumber", currentBasketData.currentBasketNumber);
    this.ctx.storage.put("itemScores", currentBasketData.itemScores);
  }

  async saveTestResult(testResult: TestResult) {

    this.ctx.storage.put("itemRawScore", testResult.itemRawScore);
    this.ctx.storage.put("itemGrade", testResult.itemGrade);
    this.ctx.storage.put("itemLevel", testResult.itemLevel);
    this.ctx.storage.put("scoredBaskets", testResult.scoredBaskets);
  }
}
