import { parse } from "@std/csv";
import { PreestAssignment, SAGrade, VSPBand, VSPWord } from "../src/types.ts";

export async function loadVsptWords(text: string, kv: Deno.Kv) {

  const allWords: Record<string, Array<VSPWord>> = {};
  parse(text, { skipFirstRow: true }).forEach(w => {
    const converted: VSPWord = { word_id: w.word_id, word: w.word, valid: parseInt(w.valid), weight: parseInt(w.weight) };
    const tlWords = allWords[w.test_language];
    if (tlWords) {
      tlWords.push(converted);
    } else {
      allWords[w.test_language] = [ converted ];
    }
  });
  Object.entries(allWords).forEach(async ([tl, words]) => await kv.set([ "data", "vspt-words", tl ], words));
}

export async function loadVsptBands(text: string, kv: Deno.Kv) {
  const allBands: Record<string, Array<VSPBand>> = {};
  parse(text, { skipFirstRow: true }).forEach(b => {

    const converted: VSPBand = { locale: b.test_language, level: b.level, low: parseInt(b.low), high: parseInt(b.high) };
    const tlBands = allBands[b.test_language];
    if (tlBands) {
      tlBands.push(converted);
    } else {
      allBands[b.test_language] = [ converted ];
    }
  });
  Object.entries(allBands).forEach(async ([tl, bands]) => await kv.set([ "data", "vspt-bands", tl ], bands));
}

export async function loadSaGrades(text: string, kv: Deno.Kv) {

  const saGrades: Array<SAGrade> = [];
  parse(text, { skipFirstRow: true }).forEach(g => {

    const converted: SAGrade = { skill: g.skill, rsc: parseInt(g.rsc), ppe: parseFloat(g.ppe), se: parseFloat(g.se), grade: parseInt(g.grade) };
    saGrades.push(converted);
  });
  saGrades.forEach(async g  => await kv.set([ "data", "sa-grades", g.skill, g.rsc ], g));
}

export async function loadSaWeights(text: string, kv: Deno.Kv) {
  const allSaWeights: Record<string, Record<string, number>> = {};
  parse(text, { skipFirstRow: true }).forEach(w => {

    if (allSaWeights[w.skill]) {
      allSaWeights[w.skill][w.wid] = parseInt(w.weight);
    } else {
      allSaWeights[w.skill] = { [w.wid]: parseInt(w.weight) };
    }
  });
  Object.entries(allSaWeights).forEach(async ([skill, weights])  => await kv.set([ "data", "sa-weights", skill ], weights));
}

export async function loadPreestAssignments(text: string, kv: Deno.Kv) {
  const allAssignments: Record<string, Array<PreestAssignment>> = {};
  parse(text, { skipFirstRow: true }).forEach(a => {

    const converted = { key: a.key, pe: parseFloat(a.pe), bookletId: parseInt(a.booklet_id) };

    const keyAssignments = allAssignments[a.key];
    if (keyAssignments) {
      keyAssignments.push(converted);
    } else {
      allAssignments[a.key] = [ converted ];
    }
  });
  Object.entries(allAssignments).forEach(async ([key, assignments])  => await kv.set([ "data", "preest-assignments", key ], assignments));
}

export async function loadPreestWeights(text: string, kv: Deno.Kv) {
  parse(text, { skipFirstRow: true }).forEach(async w => {
    const weight = { sa: parseFloat(w.sa), vspt: parseFloat(w.vspt), coe: parseFloat(w.coe) };
    await kv.set([ "data", "preest-weights", w.key ], weight);
  });
}

export async function loadBookletLengths(text: string, kv: Deno.Kv) {
  parse(text, { skipFirstRow: true }).forEach(async l => {
    await kv.set([ "data", "booklet-lengths", parseInt(l.booklet_id) ], parseInt(l.length));
  });
}

export async function loadBookletBaskets(text: string, kv: Deno.Kv) {
  parse(text, { skipFirstRow: true }).forEach(async bb => {
    const bookletId = parseInt(bb.booklet_id);
    const basketIds: Array<number> = bb.basket_ids.split(",").map(id => parseInt(id));
    await kv.set([ "data", "booklet-baskets", bookletId ], basketIds);
  });
} 

export async function loadItems(text: string, kv: Deno.Kv) {
  const items = JSON.parse(text);
  Object.entries(items).forEach(async ([id, item]) => await kv.set([ "data", "items", parseInt(id) ], item));
}

export async function loadAnswers(text: string, kv: Deno.Kv) {
  const answers = JSON.parse(text);
  Object.entries(answers).forEach(async ([id, answer]) => await kv.set([ "data", "answers", parseInt(id) ], answer));
}

export async function loadItemAnswers(text: string, kv: Deno.Kv) {
  const itemAnswers = JSON.parse(text);
  Object.entries(itemAnswers).forEach(async ([itemId, answers]) => await kv.set([ "data", "item-answers", parseInt(itemId) ], answers));
}

export async function loadPunctuation(text: string, kv: Deno.Kv) {
  const punctuation = JSON.parse(text);
  await kv.set([ "data", "punctuation" ], punctuation);
}

export async function loadItemGrades(text: string, kv: Deno.Kv) {
  const itemGrades = JSON.parse(text);
  Object.entries(itemGrades).forEach(([compoundKey, gradeMap]) => {
    Object.entries(gradeMap as object).forEach(async ([rawScore, grades]) => {
      await kv.set([ "data", "item-grades", compoundKey, parseInt(rawScore) ], grades);
    });
  });
}

export async function loadLanguageNames(text: string, kv: Deno.Kv) {
  const languageNames = JSON.parse(text);
  Object.entries(languageNames).forEach(async ([locale, languages]) => {
    await kv.set([ "data", "language-names", locale ], languages);
  });
}

export async function loadSkillNames(text: string, kv: Deno.Kv) {
  const skillNames = JSON.parse(text);
  Object.entries(skillNames).forEach(async ([locale, skills]) => {
    await kv.set([ "data", "skill-names", locale ], skills);
  });
}
