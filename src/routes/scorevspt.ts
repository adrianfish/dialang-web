import { getCookie } from "@hono/cookie";
import { Storage } from "../storage/storage.ts";
import type { DialangSession } from "../types/types.ts";

export async function scoreVspt(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const body = await c.req.json();

  const responses = Object.fromEntries(
    Object.entries(body)
    .filter(([k, v]) => k.startsWith("word:"))
    .map(([k, v]) => [ k.split(":")[1], v === "valid"])
  );

  const sessionId = getCookie(c, "dialang");
  const session: DialangSession = await storage.getSession(sessionId);

  const [ zScore, mearaScore, level, error ] = await getBand(storage, session.tl, responses);
  if (error) {
  c.status(500);
  return c.text(error);
  }


  session.vsptZScore = zScore
  session.vsptMearaScore = mearaScore
  session.vsptLevel = level
  session.vsptSubmitted = true

  storage.saveSession(sessionId, session);

  /*
  datacapture.LogVSPTResponses(&dialangSession, responses)
  datacapture.LogVSPTScores(&dialangSession)
  */

  return c.json({ zScore, mearaScore, level });
}

async function getBand(storage: Storage, tl: string, responses: Record<string, boolean>): Array {

  const [zScore, mearaScore] = await getScore(storage, tl, responses);

  const bands = await storage.getVSPBands(tl);
  if (!bands) {
    return [ 0, 0, "", `No bands for test language '${tl}` ];
  }

  const match = bands.find(b => mearaScore >= b.low && mearaScore <= b.high);
  if (match) {
  return [ zScore, Math.round(mearaScore), match.level, null ];
  }

  return [ 0, 0, "", `No level for test language '${tl}' and meara score: ${mearaScore}.` ];
}

async function getScore(storage: Storage, tl: string, responses: Record<string, boolean>): Array {

  const Z = await getZScore(storage, tl, responses);

  if (Z <= 0) {
    return [ Z, 0 ];
  }

  return [Z, Z * 1000 ];
}

async function getZScore(storage: Storage, tl: string, responses: Record<string, boolean>): number {

  const words = await storage.getVSPWords(tl);
  if (!words) {
  c.status(500);
    return c.text(`No vspt words for language ${tl}`);
  }

  const yesResponses = [0, 0];
  const noResponses = [0, 0];

  words.forEach(word => {
  const wordType = word.valid == 1 ? 1 : 0;

    if (responses[word.word_id]) {
      yesResponses[wordType] += 1;
    } else {
      noResponses[wordType] += 1;
    }
  });

  const realWordsAnswered = yesResponses[1] + noResponses[1];

  const fakeWordsAnswered = yesResponses[0] + noResponses[0];

  // Hits. The number of yes responses to real words.
  const hits = yesResponses[1];

  // False alarms. The number of yes responses to fake words.
  const falseAlarms = yesResponses[0];

  if (hits == 0) {
    // No hits whatsoever results in a zero score
    return 0;
  } else {
    return getVersion10ZScore(hits, realWordsAnswered, falseAlarms, fakeWordsAnswered);
  }
}

function getVersion10ZScore(hits: number, realWordsAnswered: number, falseAlarms: number, fakeWordsAnswered: number): number {

  const h = hits / realWordsAnswered;

  // The false alarm rate. False alarms divided by the total number of fake words answered.
  const f = falseAlarms / fakeWordsAnswered;

  if (h == 1 && f == 1) {
    // This means the test taker has just clicked green for all the words
    return -1;
  } else {
    const rhs = ((4 * h * (1 - f)) - (2 * (h - f) * (1 + h - f))) / ((4 * h * (1 - f)) - ((h - f) * (1 + h - f)));
    return 1 - rhs;
  }
}
