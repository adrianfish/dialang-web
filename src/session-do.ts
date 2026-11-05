import { DurableObject } from "cloudflare:workers";
import { DialangSession } from "./types.ts";

import type {
  ALData,
  CurrentBasketData,
  ItemScore,
  ScoredBasket,
  ScoredItem,
  StartTestData,
  StartTestRequirements,
  SubmitBasketRequirements,
  TestResult,
  VSPTData,
  SAData
} from "./types.ts";

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

  async setAdminLanguage(alData: ALData): Promise<void> {

    await this.start();

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(alData);
  }

  async setTestLanguageAndSkill(passId: string, tl: string, skill: string): Promise<void> {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put({ passId, tl, skill });
  }

  async getPassId(): Promise<string | undefined> {
    return this.ctx.storage.get("passId");
  }

  async getTL(): Promise<string | undefined> {
    return this.ctx.storage.get("tl");
  }

  async getSkill(): Promise<string | undefined> {
    return this.ctx.storage.get("skill");
  }

  async getStartTestRequirements(): Promise<StartTestRequirements> {

    const keys: Array<string> = ["tl", "skill", "vsptSubmitted", "saSubmitted", "vsptZScore", "saPPE", "scoredItems"];
    const data = await this.ctx.storage.get(keys);
    return {
      tl: data.get("tl") as string,
      skill: data.get("skill") as string,
      vsptSubmitted: data.get("vsptSubmitted") as boolean,
      saSubmitted: data.get("saSubmitted") as boolean,
      vsptZScore: data.get("vsptZScore") as number,
      saPPE: data.get("saPPE") as number,
      scoredItems: data.get("scoredItems") as Array<ScoredItem>,
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
      tl: data.get("tl") as string,
      skill: data.get("skill") as string,
      currentBasketId: data.get("currentBasketId") as number,
      bookletId: data.get("bookletId") as number,
      currentBasketNumber: data.get("currentBasketNumber") as number,
      scoredItems: data.get("scoredItems") as Array<ScoredItem>,
      itemScores: data.get("itemScores") as Array<ItemScore>,
      scoredBaskets: data.get("scoredBaskets") as Array<ScoredBasket>,
      itemRawScore: data.get("itemRawScore") as number,
      itemGrade: data.get("itemGrade") as number,
      itemLevel: data.get("itemLevel") as string,
      resultUrl: data.get("resultUrl") as string,
    };
  }

  async saveVSPT(vsptData: VSPTData): Promise<void> {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(vsptData);
  }

  async getVSPTLevel(): Promise<string | undefined> {
    return this.ctx.storage.get("vsptLevel");
  }

  async saveSA(saData: SAData): Promise<void> {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(saData);
  }

  async getSALevel(): Promise<string | undefined> {
    return this.ctx.storage.get("saLevel");
  }

  async saveStartTestData(testData: StartTestData): Promise<void> {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(testData);
  }

  async saveCurrentBasketData(currentBasketData: CurrentBasketData): Promise<void> {

    await this.ctx.storage.put("lastModified", Date.now());
    return this.ctx.storage.put(currentBasketData as unknown as Record<string, unknown>);
  }

  async saveTestResult(testResult: TestResult): Promise<void> {

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

    /* @ts-ignore */
    return Object.fromEntries(await this.ctx.storage.get(keys));
  }

  async saveSession(sessionData: DialangSession): Promise<void> {

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

  async delete(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
  
  async alarm() {

    const lastModified: number | undefined  = await this.ctx.storage.get("lastModified");
    if (lastModified && lastModified < (Date.now() - ttl)) {
      // Session was modifed more than ttl milliseconds ago. Clear out the DO.
      console.debug("Session expired. Clearing out DO ...");
      await this.ctx.storage.deleteAll();
    } else {
      // Re set the alarm to ttl millis after the last modified stamp.
      console.debug("Session not expired. Resetting alarm  ...");
      await this.ctx.storage.setAlarm((lastModified || Date.now())+ ttl);
    }
  }
}
