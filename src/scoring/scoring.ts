import { Storage } from "../storage/storage.ts";
import type { Answer, Item, ScoredItem } from "../types.ts";

export const CEFR_LEVELS: Record<number, string> = { 1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C2" };

/**
 * Returns the sum of the weights of the questions answered 'true'
 */
async function getSaRawScore(skill: string, responses: Record<string, boolean>, storage: Storage): Promise<number | null> {

	const wordMap: Record<string, number> | null = await storage.getSAWeights(skill);
  if (!wordMap) {
    return null;
  }
  return Object.entries(responses).reduce((acc, curr) => curr[1] ? acc + wordMap[curr[0]] : acc, 0);
}

export async function getSaPPEAndLevel(skill: string, responses: Record<string, boolean>, storage: Storage): Promise<Array<number | string | null>> {

	const rsc: number | null = await getSaRawScore(skill, responses, storage);
  if (!rsc) {
	  return [ 0, "", "Failed to get raw score" ];
  }

	const saGrade = await storage.getSAGrade(skill, rsc);

  if (saGrade) {
    return [ saGrade.ppe, CEFR_LEVELS[saGrade.grade], null ];
  }

	return [ 0, "", "Failed to match skill and raw score to an sa grade" ];
}

/**
 * Used for mcq and gap drop
 */
export async function getScoredIdResponseItem(itemId: number, responseId: number, storage: Storage): Promise<Array<any>> {

	const item: Item | null = await storage.getItem(itemId);
	if (!item) {
		return [ null, `Failed to get item for itemId: ${itemId}` ];
	}

	const answer: Answer | null = await storage.getAnswer(responseId)
	if (!answer) {
		return [ null, `Failed to get answer for responseId: ${responseId}` ];
	}

	const scoredItem: ScoredItem = { ...item, positionInBasket: 0, responseId, score: 0, correct: false };

	if (answer.correct == 1) {
		scoredItem.correct = true
		scoredItem.score = item.weight
	} else {
		// Score will remain 0
		scoredItem.correct = false
	}

	return [ scoredItem, null ];
}

export async function getScoredTextResponseItem(itemId: number, answerText: string, storage: Storage): Promise<Array<any>> {

	const item: Item | null = await storage.getItem(itemId)
	if (!item) {
		return [ null, `Failed to get item for itemId: ${itemId}` ];
	}

	const scoredItem: ScoredItem = { ...item, positionInBasket: 0, responseText: answerText, score: 0, correct: false };

	const answers: Array<Answer> | null = await storage.getItemAnswers(itemId);

  if (!answers) {
		return [ null, `Failed to get answers for itemId: ${itemId}` ];
  }

  scoredItem.answers = answers;
  const punctuationList: Array<string> | null = await storage.getPunctuationList();

	for (let i = 0; i < answers.length; i++ ) {
    const correctAnswer = answers[i];
		if (removeWhiteSpaceAndPunctuation(correctAnswer.text, punctuationList) == removeWhiteSpaceAndPunctuation(answerText, punctuationList)) {
			scoredItem.score = item.weight;
			scoredItem.correct = true;
			break;
		}
	}
	return [ scoredItem, null ];
}

export async function getItemGrade(tl: string, skill: string, bookletId: number, scoredItems: Array<ScoredItem>, storage: Storage): Promise<Array<any>> {

	const rawScore: number = scoredItems.reduce((acc, curr) => acc + curr.score, 0);

	const key = `${tl}#${skill}#${bookletId}`;
	const itemGrade: Record<string, string | number> | null = await storage.getItemGrade(key, rawScore);
	if (!itemGrade) {
		console.error(`Failed to get item grade for key ${key} and raw score ${rawScore}`);
		return [ rawScore, 0, CEFR_LEVELS[1] ];
	}

  return [ rawScore, itemGrade.grade, CEFR_LEVELS[itemGrade.grade as number] ];
}

/**
 *  Trim leading and trailing whitespace and then replace tab, newline,
 *  carriage return and form-feed characters with a whitespace.
 */
function removeWhiteSpaceAndPunctuation(inString: string, punctuationList: Array<string> | null): string {

  if (!inString) return "";

	if (!punctuationList?.length) {
		console.warn("No punctuation list found. Returning input unchanged ...")
		return inString;
	}

	// Trim the white space, tokenize and join around space
	let firstPass = inString.match(/\S+/g)?.join(" ");

  if (!firstPass) return inString;

  [...firstPass].forEach(testChar => {
    const hex = testChar.charCodeAt(0).toString(16).padStart(4);
		if (punctuationList.includes(hex)) {
      firstPass && (firstPass = firstPass.replace(testChar, ""));
		}
	});

	return firstPass.toLowerCase();
}
