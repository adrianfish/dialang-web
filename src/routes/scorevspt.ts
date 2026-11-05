import { getSession } from "../utils/utils.ts";
import { SessionDO } from "../session-do.ts";
import { storeVSPTResult } from "../data-capture/data-capture.ts";
import { storeVSPTResponses } from "../data-capture/data-capture.ts";
import { getVSPBands, getVSPWords } from "../data/data.ts";

import type { VSPTData, VSPWord } from "../types.ts";
import type { Context } from "hono";

export async function scoreVspt(
  c: Context,
): Promise<Response> {

  const body = await c.req.json();

  const responses: Record<string, boolean> = Object.fromEntries(
    Object.entries(body)
    .filter(([k, _]) => k.startsWith("word:"))
    .map(([k, v]) => [ k.split(":")[1], v === "valid"])
  );

  const session: SessionDO | null = await getSession(c);
  if (!session) {
    console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }

  const [ zScore, mearaScore, level, error ] = await getBand((await session.getTL()) as string, responses);
  if (error) {
    c.status(500);
    return c.text(error as string);
  }

  const vsptData: VSPTData = {
    vsptZScore: zScore as number,
    vsptMearaScore: mearaScore as number,
    vsptLevel: level as string,
    vsptSubmitted: true,
  };

  await session.saveVSPT(vsptData);

  await storeVSPTResult((await session.getPassId()) as string, vsptData);
  await storeVSPTResponses((await session.getPassId()) as string, responses);

  return c.json({ zScore, mearaScore, level });
}

async function getBand(tl: string, responses: Record<string, boolean>): Promise<Array<number | string | null>> {

  const [zScore, mearaScore] = await getScore(tl, responses);

  const bands = await getVSPBands(tl);
  if (!bands) {
    return [ 0, 0, "", `No bands for test language '${tl}` ];
  }

  const match = bands.find(b => mearaScore >= b.low && mearaScore <= b.high);
  if (match) {
  return [ zScore, Math.round(mearaScore), match.level, null ];
  }

  return [ 0, 0, "", `No level for test language '${tl}' and meara score: ${mearaScore}.` ];
}

async function getScore(tl: string, responses: Record<string, boolean>): Promise<Array<number>> {

  const Z = await getZScore(tl, responses);

  if (Z <= 0) {
    return [ Z, 0 ];
  }

  return [Z, Z * 1000 ];
}

async function getZScore(tl: string, responses: Record<string, boolean>): Promise<number> {

  const words: Array<VSPWord> | null = await getVSPWords(tl);
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
