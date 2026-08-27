import { Context } from "@hono/hono";
import { getSessionId } from "../utils/utils.ts";

import type { Storage } from "../storage/storage.ts";
import type { DialangSession, PreestAssignment, PreestWeight } from "../types.ts";

export async function startTest(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const sessionId: string | undefined = getSessionId(c);
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

	if (!session.tl || !session.skill) {
		console.error("Neither the test language or skill were set in the session. Returning 500 ...")
		c.status(500);
		return c.html("");
	}

	if (session.scoredItems?.length) {
		console.error("The scored item list should be empty at this point. Returning 500 ...")
		c.status(500);
		return c.html("");
	}

	session.bookletId = await calculateBookletId(session, storage);

  if (!session.bookletId) {
		console.error("Failed to calculate booklet id. Returning 500 ...");
		c.status(500);
		return c.html("");
  }

	console.debug(`BOOKLET ID: ${session.bookletId}`);

	const bookletLength: number | null = await storage.getBookletLength(session.bookletId);
  if (!bookletLength) {
		console.error(`Failed to get booklet length for id ${session.bookletId}. Returning 500 ...`);
		c.status(500);
		return c.html("");
  }
	console.debug(`BOOKLET LENGTH: ${bookletLength}`);

	const baskets: Array<number> | null = await storage.getBaskets(session.bookletId);
  if (!baskets) {
		console.error(`No baskets for booklet id ${session.bookletId}. Returning 500 ...`);
		c.status(500);
		return c.html("");
  }
	session.currentBasketId = baskets[0];
	console.debug(`First Basket Id: ${session.currentBasketId}`);
  session.currentBasketNumber = 0;

	if (!session.id) {
		// No session yet. This could happen in an LTI launch
		session.id = crypto.randomUUID();
	}

  storage.saveSession(sessionId, session);

	//datacapture.LogTestStart(&dialangSession.PassId, &dialangSession.BookletId, &dialangSession.BookletLength)
	//
  return c.json({ startBasket: session.currentBasketId, totalItems: bookletLength });
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
async function calculateBookletId(session: DialangSession, storage: Storage): Promise<number> {

	const key: string = `${session.tl}#${session.skill}`;

	if (!session.vsptSubmitted && !session.saSubmitted) {
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

		let vsptZScore: number = 0;
    let saPPE: number = 0;
		if (session.vsptSubmitted && session.vsptZScore) {
			vsptZScore = session.vsptZScore
			console.debug(`VSPT SUBMITTED. vsptZScore: ${vsptZScore}`);
		}
		if (session.saSubmitted && session.saPPE) {
			saPPE = session.saPPE
			console.debug(`SA SUBMITTED. saPPE: ${saPPE}`);
		}
		const weightKey: string = `${key}#${session.vsptSubmitted ? 1 : 0}#${session.saSubmitted ? 1 : 0}`;
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
