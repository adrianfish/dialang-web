import { getSessionId } from "../utils/utils.ts";
import type { Storage } from "../storage/storage.ts";
import type { DialangSession, VSPWord } from "../types.ts";
import type { Context } from "@hono";

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

  const sessionId = getSessionId(c);
  if (!sessionId) {
    console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }

  const session: DialangSession | null = await storage.getSession(sessionId);
  if (!session) {
		console.error(`No session for id ${sessionId}. Returning 500 ...`)
		c.status(500);
		return c.html("");
  }

  if (!session.tl) {
		console.error("Test language not set. Returning 500 ...")
		c.status(500);
		return c.html("");
  }

  const [ zScore, mearaScore, level, error ] = await getBand(storage, session.tl, responses);
  if (error) {
    c.status(500);
    return c.text(error as string);
  }

  session.vsptZScore = zScore as number;
  session.vsptMearaScore = mearaScore as number;
  session.vsptLevel = level as string
  session.vsptSubmitted = true

  storage.saveSession(sessionId, session);

  storage.logVsptScores(session);

  return c.json({ zScore, mearaScore, level });
}

async function getBand(storage: Storage, tl: string, responses: Record<string, boolean>): Promise<Array<number | string | null>> {

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

async function getScore(storage: Storage, tl: string, responses: Record<string, boolean>): Promise<Array<number>> {

  const Z = await getZScore(storage, tl, responses);

  if (Z <= 0) {
    return [ Z, 0 ];
  }

  return [Z, Z * 1000 ];
}

async function getZScore(storage: Storage, tl: string, responses: Record<string, boolean>): Promise<number> {

  const words: Array<VSPWord> | null = await storage.getVSPWords(tl);
  if (!words) {
    console.error(`No vspt words for test language ${tl}`);
    return -1;
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
