import { env } from "cloudflare:workers";

import type { ALData,
  Questionnaire,
  SAData,
  SavedDialangSession,
  ScoredItem,
  TestResult,
  TestSession,
  VSPTData } from "../types.ts";

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

export async function storeVSPTResponses(passId: string, responses: Record<string, boolean>): Promise<void> {

  const statement = env.DIALANG_DATA_CAPTURE.prepare("INSERT INTO vspt_responses VALUES(?, ?, ?)");

  const statements = Object.entries(responses).map(([ wordId, response ]) => {
    return statement.bind(passId, wordId, response);
  });

  await env.DIALANG_DATA_CAPTURE.batch(statements);
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

export async function storeSAResponses(passId: string, responses: Record<string, boolean>): Promise<void> {

  const statement = env.DIALANG_DATA_CAPTURE.prepare("INSERT INTO sa_responses VALUES(?, ?, ?)");

  const statements = Object.entries(responses).map(([ statementId, response ]) => {
    return statement.bind(passId, statementId, response);
  });

  await env.DIALANG_DATA_CAPTURE.batch(statements);
}

export async function storeSingleIdResponse(passId: string, item: ScoredItem): Promise<void> {

  await env.DIALANG_DATA_CAPTURE.prepare(`
    INSERT INTO item_responses 
      (pass_id, basket_id, item_id, answer_id, score, correct, pass_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  .bind(passId,
    item.basketId,
    item.id,
    item.responseId,
    item.score,
    item.correct,
    item.positionInTest)
  .run();
}

export async function storeMultipleIdResponses(passId: string, items: Array<ScoredItem>): Promise<void> {

  const statement = env.DIALANG_DATA_CAPTURE.prepare(`
    INSERT INTO item_responses 
      (pass_id, basket_id, item_id, answer_id, score, correct, pass_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const statements = items.map(item => {

    return statement.bind(passId,
                          item.basketId,
                          item.id,
                          item.responseId,
                          item.score,
                          item.correct,
                          item.positionInTest);
  });

  await env.DIALANG_DATA_CAPTURE.batch(statements);
}

export async function storeMultipleTextualResponses(passId: string, items: Array<ScoredItem>): Promise<void> {

  const statement = env.DIALANG_DATA_CAPTURE.prepare(`
    INSERT INTO item_responses 
      (pass_id, basket_id, item_id, answer_text, score, correct, pass_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const statements = items.map(item => {

    return statement.bind(passId,
                          item.basketId,
                          item.id,
                          item.responseText,
                          item.score,
                          item.correct,
                          item.positionInTest);
  });

  await env.DIALANG_DATA_CAPTURE.batch(statements);
}

export async function storeTestResult(passId: string, testResult: TestResult): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare(
    `UPDATE passes SET
      item_raw_score = ?,
      item_grade = ?,
      item_level = ?,
      ended = ?
        WHERE pass_id = ?`
  )
    .bind(testResult.itemRawScore, testResult.itemGrade, testResult.itemLevel, Date.now(), passId)
    .run()).success;
}

export async function storeSavedSession(savedSession: SavedDialangSession): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare("INSERT INTO saved_sessions VALUES (?, ?)")
    .bind(savedSession.saveToken, JSON.stringify(savedSession))
    .run()).success;
}

export async function getSavedSession(token: string): Promise<SavedDialangSession | null> {

  const result = await env.DIALANG_DATA_CAPTURE.prepare(`
    SELECT saved_json
      FROM saved_sessions
        WHERE token = ?`)
    .bind(token).run();

    console.log(result);

  if (result.meta.rows_read !== 1) {
    console.warn(`No saved session for token ${token}`);
    return null;
  }

  return JSON.parse(result.results[0].saved_json as string);
}

export async function deleteSavedSession(token: string): Promise<boolean> {

  return (await env.DIALANG_DATA_CAPTURE.prepare("DELETE FROM saved_sessions WHERE token = ?")
    .bind(token).run()).success;
}

export async function getAllTestSessions(): Promise<Array<TestSession>> {
  return await getTestSessions(0, Date.now(), false);
}

export async function getTestSession(sessionId: string): Promise<TestSession | null> {

  const passes = await env.DIALANG_DATA_CAPTURE.prepare(`
    SELECT * FROM passes WHERE session_id = ?
  `).bind(sessionId)
  .run();

  if (passes.results.length !== 1) {
    return null;
  }

  const pass = passes.results[0];

  const sessions = await env.DIALANG_DATA_CAPTURE.prepare("SELECT * FROM sessions WHERE session_id = ?")
  .bind(pass.session_id)
  .run();

  if (sessions.results.length !== 1) {
    return null;
  }

  return buildTestSession(sessions.results[0], pass);
}

export async function getTestSessions(fromMillis: number, toMillis: number, completedOnly: boolean): Promise<Array<TestSession>> {

  const passes = await env.DIALANG_DATA_CAPTURE.prepare(`
    SELECT * FROM passes WHERE started >= ? AND started <= ?
    ${completedOnly ? "AND item_grade IS NOT NULL" : ""}
      ORDER BY started DESC
  `).bind(fromMillis, toMillis)
  .run();

  if (!passes.results.length) {
    return [];
  }

  const testSessions: Array<TestSession> = [];

  for (const pass of passes.results) {
    const sessions = await env.DIALANG_DATA_CAPTURE.prepare("SELECT * FROM sessions WHERE session_id = ?")
    .bind(pass.session_id)
    .run();

    if (!sessions.success || !sessions.results.length) {
      console.warn(`No session for pass.session_id = ${pass.session_id}. Skipping this pass ...`);
      continue;
    }

    testSessions.push(buildTestSession(sessions.results[0], pass));
  }

  return testSessions;
}

function buildTestSession(session: any, pass: any): TestSession {

  return {
    sessionId: pass.session_id,
    ipAddress: session.ip_address,
    referrer: session.referrer,
    al: session.al,
    tl: pass.tl,
    skill: pass.skill,
    started: pass.started,
    vsptZScore: pass.vspt_zscore,
    vsptMearaScore: pass.vspt_mearascore,
    vsptLevel: pass.vspt_level,
    saPPE: pass.sa_ppe,
    saLevel: pass.sa_level,
    itemRawScore: pass.item_rawscore,
    itemGrade: pass.item_grade,
    itemLevel: pass.item_level,
  };
}

async function isValidSession(sessionId: string): Promise<boolean> {

  const result = await env.DIALANG_DATA_CAPTURE.prepare(`
    SELECT count(*) AS total FROM sessions
      WHERE session_id = ?
  `)
  .bind(sessionId)
  .run();

  if (result.meta.rows_read === 1 && result.results[0].total === 1) {
    return true;
  }

  return false;
}

export async function storeQuestionnaire(sessionId: string, body: Questionnaire): Promise<boolean> {

  if (! await isValidSession(sessionId)) {
    console.warn(`No test session for sessionId ${sessionId}`);
    return false;
  }

  const q = {
    ...body,
    gender: body.gender === "-1" ? "n/a" : body.gender === "other" ? body.othergender : body.gender,
  };

  const result = await env.DIALANG_DATA_CAPTURE.prepare(`
    INSERT INTO questionnaire VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  .bind(sessionId, q.agegroup, q.gender, q.othergender, q.firstlanguage, q.nationality, q.institution, q.reason, q.accuracy, q.comments)
  .run();

  if (!result.success || result.meta.rows_written !== 1) {
    console.warn("Failed to store questionnaire");
    return false;
  }

  return true;
}
