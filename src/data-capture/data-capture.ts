import { env } from "cloudflare:workers";

import type { ALData, VSPTData } from "../types.ts";

export async function storeAdminLanguage(sessionId: string, alData: ALData): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare(
    `INSERT INTO sessions (session_id, al, started, ip_address, referrer)
      VALUES(?, ?, ?, ?, ?)`
  )
  .bind(alData.sessionId, alData.al, Date.now(), alData.ipAddress, alData.referrer || "")
  .run()).success;
}

export async function storeTestLanguageAndSkill(passId: string, sessionId: string, tl: string, skill: string): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare(
    `INSERT INTO passes (pass_id, session_id, tl, skill, started)
      VALUES(?, ?, ?, ?, ?)`
  )
  .bind(passId, sessionId, tl, skill, Date.now())
  .run()).success;
}

export async function storeVSPTResult(passId: string, vsptData: VSPTData): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare(
    `UPDATE passes SET
      vspt_zscore = ?,
      vspt_mearascore = ?,
      vspt_level = ?
        WHERE pass_id = ?`
  )
  .bind(vsptData.vsptZScore, vsptData.vsptMearaScore, vsptData.vsptLevel, passId)
  .run()).success;
}

export async function storeSAResult(passId: string, saData: SAData): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare(
    `UPDATE passes SET
      sa_ppe = ?,
      sa_level = ?
        WHERE pass_id = ?`
  )
  .bind(saData.saPPE, saData.saLevel, passId)
  .run()).success;
}

export async function storeTestResult(passId: string, testResult: TestResult): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare(
    `UPDATE passes SET
      item_raw_score = ?,
      item_grade = ?,
      item_level = ?
      ended = ?
        WHERE pass_id = ?`
  )
  .bind(testResult.itemRawScore, testResult.itemGrade, testResult.itemLevel, Date.now(), passId)
  .run()).success;
}
