import { HTTPException } from "hono/http-exception";
import { getSession } from "../utils/utils.ts";
import { SessionDO } from "../session-do.ts";
import { getBaskets, getBookletLength, getPreestAssignments, getPreestWeight } from "../data/data.ts";
import { storeBookletId } from "../data-capture/data-capture.ts";

import type { Context } from "hono";
import type { PreestAssignment, PreestWeight, StartTestRequirements, StartTestData } from "../types.ts";

export async function startTest(
  c: Context,
): Promise<Response> {

  const session: SessionDO | null = getSession(c);
  if (!session) {
    throw new HTTPException(500, { message: "Failed to get session" });
  }

  const startTestRequirements: StartTestRequirements = await session.getStartTestRequirements();

	if (startTestRequirements.scoredItems?.length) {
    throw new HTTPException(500, { message: "The scored item list should be empty at this point." });
	}

	const bookletId = await calculateBookletId(startTestRequirements);

  await storeBookletId((await session.getPassId()) as string, bookletId);

	const bookletLength: number | null = await getBookletLength(bookletId);
  if (!bookletLength) {
    throw new HTTPException(500, { message: `Failed to get booklet length for id ${bookletId}.` });
  }

	const baskets: Array<number> | null = await getBaskets(bookletId);
  if (!baskets) {
    throw new HTTPException(500, { message: `No baskets for booklet id ${bookletId}.` });
  }
	const currentBasketId = baskets[0];
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
async function calculateBookletId(startTestRequirements: StartTestRequirements): Promise<number> {

  const tl: string = startTestRequirements.tl;
  const skill: string = startTestRequirements.skill;
	const key: string = `${tl}#${skill}`;

  const vsptSubmitted: boolean = startTestRequirements.vsptSubmitted;
  const saSubmitted: boolean = startTestRequirements.saSubmitted;

  let bookletId: number = -1;

	if (!vsptSubmitted && !saSubmitted) {
		// No sa or vspt, request the default assignment.
		const assignments: Array<PreestAssignment> | null = await getPreestAssignments(key);
    if (!assignments) {
      throw new HTTPException(500, { message: `No preest assignment for key ${key}` });
    }
		bookletId = assignments[1].bookletId;
	} else {
		// if either test is done, then we need to get the grade
		// associated with that test:

		const sessionVsptZScore: number = startTestRequirements.vsptZScore;
		let vsptZScore: number = 0;
		if (vsptSubmitted && sessionVsptZScore) {
			vsptZScore = sessionVsptZScore;
		}
		const sessionSaPPE: number = startTestRequirements.saPPE;
    let saPPE: number = 0;
		if (saSubmitted && sessionSaPPE) {
			saPPE = sessionSaPPE
		}
		const weightKey: string = `${key}#${saSubmitted ? 1 : 0}#${vsptSubmitted ? 1 : 0}`;
		const weight: PreestWeight | null = await getPreestWeight(weightKey);
    if (!weight) {
      throw new HTTPException(500, { message: `No preest weight for key ${weightKey}` });
    }
		const pe: number = (saPPE * weight.sa) + (vsptZScore * weight.vspt) + weight.coe;

		const assignments: Array<PreestAssignment> | null = await getPreestAssignments(key);

    if (!assignments) {
      throw new HTTPException(500, { message: `No preest assignments for key ${key}` });
    }

    for (let i = 0; i < assignments.length; i++) {
      const ass: PreestAssignment = assignments[i];
			if (pe <= ass.pe) {
				bookletId = ass.bookletId;
				break
			}
		}

    if (bookletId === -1) {
      throw new HTTPException(500, { message: `Failed to select booklet for pe  ${pe}` });
    }
	}

  if (bookletId === -1) {
    throw new HTTPException(500, { message: "Failed to select booklet" });
  }

  return bookletId;
}
