import { parse } from "@std/csv";
import { PreestAssignment, SAGrade, VSPBand, VSPWord } from "../types.ts";

export async function loadVsptWords(file: File, kv: Deno.Kv) {

  const allWords: Record<string, Array<VSPWord>> = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {
    const converted: VSPWord = { word_id: w.word_id, word: w.word, valid: parseInt(w.valid), weight: parseInt(w.weight) };
    const tlWords = allWords[w.test_language];
    if (tlWords) {
      tlWords.push(converted);
    } else {
      allWords[w.test_language] = [ converted ];
    }
  });
  Object.entries(allWords).forEach(([tl, words]) => kv.set([ "data", "vspt-words", tl ], words));
}

export async function loadVsptBands(file: File, kv: Deno.Kv) {
  const allBands: Record<string, Array<VSPBand>> = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(b => {

    const converted: VSPBand = { locale: b.test_language, level: b.level, low: parseInt(b.low), high: parseInt(b.high) };
    const tlBands = allBands[b.test_language];
    if (tlBands) {
      tlBands.push(converted);
    } else {
      allBands[b.test_language] = [ converted ];
    }
  });
  Object.entries(allBands).forEach(([tl, bands]) => kv.set([ "data", "vspt-bands", tl ], bands));
}

export async function loadSaGrades(file: File, kv: Deno.Kv) {

  const saGrades: Array<SAGrade> = [];
  parse((await file.text()), { skipFirstRow: true }).forEach(g => {

    const converted: SAGrade = { skill: g.skill, rsc: parseInt(g.rsc), ppe: parseFloat(g.ppe), se: parseFloat(g.se), grade: parseInt(g.grade) };
    saGrades.push(converted);
  });
  saGrades.forEach(g  => kv.set([ "data", "sa-grades", g.skill, g.rsc ], g));
}

export async function loadSaWeights(file: File, kv: Deno.Kv) {
  const allSaWeights: Record<string, Record<string, number>> = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {

    if (allSaWeights[w.skill]) {
      allSaWeights[w.skill][w.wid] = parseInt(w.weight);
    } else {
      allSaWeights[w.skill] = { [w.wid]: parseInt(w.weight) };
    }
  });
  Object.entries(allSaWeights).forEach(([skill, weights])  => kv.set([ "data", "sa-weights", skill ], weights));
}

export async function loadPreestAssignments(file: File, kv: Deno.Kv) {
  const allAssignments: Record<string, Array<PreestAssignment>> = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(a => {

    const converted = { key: a.key, pe: parseFloat(a.pe), bookletId: parseInt(a.booklet_id) };

    const keyAssignments = allAssignments[a.key];
    if (keyAssignments) {
      keyAssignments.push(converted);
    } else {
      allAssignments[a.key] = [ converted ];
    }
  });
  Object.entries(allAssignments).forEach(([key, assignments])  => kv.set([ "data", "preest-assignments", key ], assignments));
}

export async function loadPreestWeights(file: File, kv: Deno.Kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {
    const weight = { sa: parseFloat(w.sa), vspt: parseFloat(w.vspt), coe: parseFloat(w.coe) };
    kv.set([ "data", "preest-weights", w.key ], weight);
  });
}

export async function loadBookletLengths(file: File, kv: Deno.Kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(l => {
    kv.set([ "data", "booklet-lengths", parseInt(l.booklet_id) ], parseInt(l.length));
  });
}

export async function loadBookletBaskets(file: File, kv: Deno.Kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(bb => {
    const bookletId = parseInt(bb.booklet_id);
    const basketIds: Array<number> = bb.basket_ids.split(",").map(id => parseInt(id));
    kv.set([ "data", "booklet-baskets", bookletId ], basketIds);
  });
} 

export async function loadItems(file: File, kv: Deno.Kv) {
  const items = JSON.parse(await file.text());
  Object.entries(items).forEach(([id, item]) => kv.set([ "data", "items", parseInt(id) ], item));
}

export async function loadAnswers(file: File, kv: Deno.Kv) {
  const answers = JSON.parse(await file.text());
  Object.entries(answers).forEach(([id, answer]) => kv.set([ "data", "answers", parseInt(id) ], answer));
}

export async function loadItemAnswers(file: File, kv: Deno.Kv) {
  const itemAnswers = JSON.parse(await file.text());
  Object.entries(itemAnswers).forEach(([itemId, answers]) => kv.set([ "data", "item-answers", parseInt(itemId) ], answers));
}

export async function loadPunctuation(file: File, kv: Deno.Kv) {
  const punctuation = JSON.parse(await file.text());
  kv.set([ "data", "punctuation" ], punctuation);
}

export async function loadItemGrades(file: File, kv: Deno.Kv) {
  const itemGrades = JSON.parse(await file.text());
  Object.entries(itemGrades).forEach(([compoundKey, gradeMap]) => {
    Object.entries(gradeMap as object).forEach(([rawScore, grades]) => {
      kv.set([ "data", "item-grades", compoundKey, parseInt(rawScore) ], grades);
    });
  });
}

export async function loadLanguageNames(file: File, kv: Deno.Kv) {
  const languageNames = JSON.parse(await file.text());
  Object.entries(languageNames).forEach(([locale, languages]) => {
    kv.set([ "data", "language-names", locale ], languages);
  });
}

export async function loadSkillNames(file: File, kv: Deno.Kv) {
  const skillNames = JSON.parse(await file.text());
  Object.entries(skillNames).forEach(([locale, skills]) => {
    kv.set([ "data", "skill-names", locale ], skills);
  });
}
