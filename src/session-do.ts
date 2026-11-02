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

//const ttl = 1000 * 60 * 2;
const ttl = 1000 * 60 * 60 * 4;

export class SessionDO extends DurableObject<Env> {

  async start() {

    // Only arm the alarm if one isn't already pending, so calling start() twice
    // doesn't push the deadline out.
    if ((await this.ctx.storage.getAlarm()) === null) {
      await this.ctx.storage.setAlarm(Date.now() + ttl);
    }
  }

  async setAdminLanguage(alData: ALData): Promise {

    await this.start();

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(alData);
  }

  async setTestLanguageAndSkill(passId: string, tl: string, skill: string): Promise {

    await this.ctx.storage.put("lastModified", Date.now());
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

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(vsptData);
  }

  async saveSA(saData: SAData): Promise {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(saData);
  }

  async saveStartTestData(testData: TestData): Promise {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(testData);
  }

  async saveCurrentBasketData(currentBasketData: CurrentBasketData): Promise {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(currentBasketData);
  }

  async saveTestResult(testResult: TestResult): Promise {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(testResult);
  }

  async getSessionData(): Promise<DialangSession> {

    const keys: Array<string> = [
      "sessionId",
      "passId",
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
      "bookletId",
      "itemScores",
      "scoredBaskets",
      "currentBasketId",
    ];

    return Object.fromEntries(await this.ctx.storage.get(keys));
  }

  async saveSession(sessionData: DialangSession): Promise {

    await this.ctx.storage.put("lastModified", Date.now());
    await this.ctx.storage.put(sessionData);
  }

  async clearTestData(): Promise<void> {

    await this.ctx.storage.put("lastModified", Date.now());

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

  async delete(): Promise {
    await this.ctx.storage.deleteAll();
  }
  
  async alarm() {

    const lastModified = await this.ctx.storage.get("lastModified");
    if (lastModified < (Date.now() - ttl)) {
      // Session was modifed more than ttl milliseconds ago. Clear out the DO.
      console.debug("Session expired. Clearing out DO ...");
      await this.ctx.storage.deleteAll();
    } else {
      // Re set the alarm to ttl millis after the last modified stamp.
      console.debug("Session not expired. Resetting alarm  ...");
      await this.ctx.storage.setAlarm(lastModified + ttl);
    }
  }
}
