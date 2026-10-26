import { Context } from "@hono/hono";
import { getSession, getSessionId } from "../utils/utils.ts";
import { SessionDO } from "../session-do.ts";

import type { Storage } from "../storage/storage.ts";
import type { DialangSession, PreestAssignment, PreestWeight } from "../types.ts";

export async function startTest(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const session: SessionDO | null = getSession(c);
  if (!session) {
    console.error("Failed to get session");
		c.status(500);
		return c.html("");
  }

  const startTestRequirements: StartTestRequirements = await session.getStartTestRequirements();

	if (startTestRequirements.scoredItems?.length) {
		console.error("The scored item list should be empty at this point. Returning 500 ...")
		c.status(500);
		return c.html("");
	}

	const bookletId = await calculateBookletId(startTestRequirements, storage);

  if (!bookletId) {
		console.error("Failed to calculate booklet id. Returning 500 ...");
		c.status(500);
		return c.html("");
  }

	console.debug(`BOOKLET ID: ${bookletId}`);

	const bookletLength: number | null = await storage.getBookletLength(bookletId);
  if (!bookletLength) {
		console.error(`Failed to get booklet length for id ${bookletId}. Returning 500 ...`);
		c.status(500);
		return c.html("");
  }
	console.debug(`BOOKLET LENGTH: ${bookletLength}`);

	const baskets: Array<number> | null = await storage.getBaskets(bookletId);
  if (!baskets) {
		console.error(`No baskets for booklet id ${bookletId}. Returning 500 ...`);
		c.status(500);
		return c.html("");
  }
	const currentBasketId = baskets[0];
	console.debug(`First Basket Id: ${currentBasketId}`);
  const currentBasketNumber = 0;

  /*
	if (!session.id) {
		// No session yet. This could happen in an LTI launch
		session.id = crypto.randomUUID();
	}
  */

  const startTestData: StartTestData = {
    bookletId,
    currentBasketId,
    currentBasketNumber,
  };

  await session.saveStartTestData(startTestData);

  return c.json({ startBasket: currentBasketId, totalItems: bookletLength });
}

/**
 * Calculates the booklet id.
 *
 * If neither the VSPT nor the SA have been submitted, requests the midmost booklet assignment
 * from the the PreestAssign member. Gets the grade achieved for SA together with the
 * Z score for the VSPT, if submitted. Calls getPreestWeights to get a
 * PreestWeights object. Uses this object to get the SA and VSPT weights
 * and 'Coefficient of Mystery' for the current TLS SKILL and vspt/sa
 * submitted states. Uses the VSPT and SA weights  and coefficient to
 * calculate a theta estimate (ppe). Passes the TLS, SKILL and coefficient
 * in the PreestAssign.
 */
async function calculateBookletId(startTestRequirements: StartTestRequirements, storage: Storage): Promise<number> {

  const tl: string = startTestRequirements.tl;
  const skill: string = startTestRequirements.skill;
	const key: string = `${tl}#${skill}`;

  const vsptSubmitted: boolean = startTestRequirements.vsptSubmitted;
  const saSubmitted: boolean = startTestRequirements.saSubmitted;

	if (!vsptSubmitted && !saSubmitted) {
		console.debug("No vsp or sa submitted. Returning the default booklet ...");
		// No sa or vspt, request the default assignment.
		const assignments: Array<PreestAssignment> | null = await storage.getPreestAssignments(key);
    if (!assignments) {
      console.error(`No preest assignment for key ${key}`);
      return -1;
    }
		return assignments[1].bookletId;
	} else {
		console.debug("vsp or sa submitted");
		// if either test is done, then we need to get the grade
		// associated with that test:

		const sessionVsptZScore: number = startTestRequirements.vsptZScore;
		let vsptZScore: number = 0;
		if (vsptSubmitted && sessionVsptZScore) {
			vsptZScore = sessionVsptZScore;
			console.debug(`VSPT SUBMITTED. vsptZScore: ${vsptZScore}`);
		}
		const sessionSaPPE: number = startTestRequirements.saPPE;
    let saPPE: number = 0;
		if (saSubmitted && sessionSaPPE) {
			saPPE = sessionSaPPE
			console.debug(`SA SUBMITTED. saPPE: ${saPPE}`);
		}
		const weightKey: string = `${key}#${saSubmitted ? 1 : 0}#${vsptSubmitted ? 1 : 0}`;
		const weight: PreestWeight | null = await storage.getPreestWeight(weightKey);
    if (!weight) {
      console.error(`No preest weight for key ${weightKey}`);
      return -1;
    }
		const pe: number = (saPPE * weight.sa) + (vsptZScore * weight.vspt) + weight.coe;
		console.debug(`PE: ${pe}`);

		const assignments: Array<PreestAssignment> | null = await storage.getPreestAssignments(key);

    if (!assignments) {
      console.error(`No preest assignments for key ${key}`);
      return -1;
    }

		let bookletId: number = -1;
    for (let i = 0; i < assignments.length; i++) {
      const ass: PreestAssignment = assignments[i];
			if (pe <= ass.pe) {
				bookletId = ass.bookletId;
				break
			}
		}
		return bookletId;
	}
}
