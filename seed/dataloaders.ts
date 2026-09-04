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
  for (const [tl, words] of Object.entries(allWords)) {
    await kv.set(["data", "vspt-words", tl], words);
  }
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
  for (const [tl, bands] of Object.entries(allBands)) {
    await kv.set(["data", "vspt-bands", tl], bands);
  }
}

export async function loadSaGrades(text: string, kv: Deno.Kv) {

  const saGrades: Array<SAGrade> = [];
  parse(text, { skipFirstRow: true }).forEach(g => {

    const converted: SAGrade = { skill: g.skill, rsc: parseInt(g.rsc), ppe: parseFloat(g.ppe), se: parseFloat(g.se), grade: parseInt(g.grade) };
    saGrades.push(converted);
  });
  for (const g of saGrades) {
    await kv.set([ "data", "sa-grades", g.skill, g.rsc ], g);
  }
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
  for (const [skill, weights] of Object.entries(allSaWeights)) {
    await kv.set([ "data", "sa-weights", skill ], weights);
  }

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
  for (const [key, assignments] of Object.entries(allAssignments)) {
    await kv.set([ "data", "preest-assignments", key ], assignments);
  }
}

export async function loadPreestWeights(text: string, kv: Deno.Kv) {
  const records: Array<object> = parse(text, { skipFirstRow: true });
  for (const w of records) {
    const weight = { sa: parseFloat(w.sa), vspt: parseFloat(w.vspt), coe: parseFloat(w.coe) };
    await kv.set([ "data", "preest-weights", w.key ], weight);
  }
}

export async function loadBookletLengths(text: string, kv: Deno.Kv) {
  const records: Array<object> = parse(text, { skipFirstRow: true });
  for (const l of records) {
    await kv.set([ "data", "booklet-lengths", parseInt(l.booklet_id) ], parseInt(l.length));
  }
}

export async function loadBookletBaskets(text: string, kv: Deno.Kv) {
  const records: Array<object> = parse(text, { skipFirstRow: true });
  for (const bb of records) {
    const bookletId = parseInt(bb.booklet_id);
    const basketIds: Array<number> = bb.basket_ids.split(",").map(id => parseInt(id));
    await kv.set([ "data", "booklet-baskets", bookletId ], basketIds);
  }
} 

export async function loadItems(text: string, kv: Deno.Kv) {
  const items = JSON.parse(text);
  for (const [id, item] of Object.entries(items)) {
    await kv.set([ "data", "items", parseInt(id) ], item);
  }
}

export async function loadAnswers(text: string, kv: Deno.Kv) {
  const answers = JSON.parse(text);
  for (const [id, answer] of Object.entries(answers)) {
    await kv.set([ "data", "answers", parseInt(id) ], answer);
  }
}

export async function loadItemAnswers(text: string, kv: Deno.Kv) {
  const itemAnswers = JSON.parse(text);
  for (const [itemId, answers] of Object.entries(itemAnswers)) {
    await kv.set([ "data", "item-answers", parseInt(itemId) ], answers);
  }
}

export async function loadPunctuation(text: string, kv: Deno.Kv) {
  const punctuation = JSON.parse(text);
  await kv.set([ "data", "punctuation" ], punctuation);
}

export async function loadItemGrades(text: string, kv: Deno.Kv) {
  const itemGrades = JSON.parse(text);
  for (const [compoundKey, gradeMap] of Object.entries(itemGrades)) {
    for (const [rawScore, grades] of Object.entries(gradeMap as object)) {
      await kv.set([ "data", "item-grades", compoundKey, parseInt(rawScore) ], grades);
    }
  }
}

export async function loadLanguageNames(text: string, kv: Deno.Kv) {
  const languageNames = JSON.parse(text);
  for (const [locale, languages] of Object.entries(languageNames)) {
    await kv.set([ "data", "language-names", locale ], languages);
  }
}

export async function loadSkillNames(text: string, kv: Deno.Kv) {
  const skillNames = JSON.parse(text);
  for (const [locale, skills] of Object.entries(skillNames)) {
    await kv.set([ "data", "skill-names", locale ], skills);
  }
}
