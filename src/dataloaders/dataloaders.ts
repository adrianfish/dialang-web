import { parse } from "@std/csv";

export async function loadVsptWords(file, kv) {
  const allWords = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {
    const converted = { ...w, valid: parseInt(w.valid), weight: parseInt(w.weight) };
    const tlWords = allWords[w.test_language];
    if (tlWords) {
      tlWords.push(converted);
    } else {
      allWords[w.test_language] = [ converted ];
    }
  });
  Object.entries(allWords).forEach(([tl, words]) => kv.set([ "data", "vspt-words", tl ], words));
}

export async function loadVsptBands(file, kv) {
  const allBands = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(b => {

    const converted = { ...b, low: parseInt(b.low), high: parseInt(b.high) };
    const tlBands = allBands[b.test_language];
    if (tlBands) {
      tlBands.push(converted);
    } else {
      allBands[b.test_language] = [ converted ];
    }
  });
  Object.entries(allBands).forEach(([tl, bands]) => kv.set([ "data", "vspt-bands", tl ], bands));
}

export async function loadSaGrades(file, kv) {
  const saGrades = [];
  parse((await file.text()), { skipFirstRow: true }).forEach(g => {

    const converted = { skill: g.skill, rsc: parseInt(g.rsc), ppe: parseFloat(g.ppe).toFixed(2), se: parseFloat(g.se).toFixed(), grade: parseInt(g.grade) };
    saGrades.push(converted);
  });
  saGrades.forEach(g  => kv.set([ "data", "sa-grades", g.skill, g.rsc ], g));
}

export async function loadSaWeights(file, kv) {
  const allSaWeights = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {

    if (allSaWeights[w.skill]) {
      allSaWeights[w.skill][w.wid] = parseInt(w.weight);
    } else {
      allSaWeights[w.skill] = { [w.wid]: parseInt(w.weight) };
    }
  });
  Object.entries(allSaWeights).forEach(([skill, weights])  => kv.set([ "data", "sa-weights", skill ], weights));
}

export async function loadPreestAssignments(file, kv) {
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

export async function loadPreestWeights(file, kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {
    const weight = { sa: parseFloat(w.sa), vspt: parseFloat(w.vspt), coe: parseFloat(w.coe) };
    kv.set([ "data", "preest-weights", w.key ], weight);
  });
}

export async function loadBookletLengths(file, kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(l => {
    kv.set([ "data", "booklet-lengths", parseInt(l.booklet_id) ], parseInt(l.length));
  });
}

export async function loadBookletBaskets(file, kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(bb => {
    const bookletId = parseInt(bb.booklet_id);
    const basketIds: Array<number> = bb.basket_ids.split(",").map(id => parseInt(id));
    kv.set([ "data", "booklet-baskets", bookletId ], basketIds);
  });
} 

export async function loadItems(file, kv) {
  const items = JSON.parse(await file.text());
  Object.entries(items).forEach(([id, item]) => kv.set([ "data", "items", parseInt(id) ], item));
}

export async function loadAnswers(file, kv) {
  const answers = JSON.parse(await file.text());
  Object.entries(answers).forEach(([id, answer]) => kv.set([ "data", "answers", parseInt(id) ], answer));
}

export async function loadItemAnswers(file, kv) {
  const itemAnswers = JSON.parse(await file.text());
  Object.entries(itemAnswers).forEach(([itemId, answers]) => kv.set([ "data", "item-answers", parseInt(itemId) ], answers));
}

export async function loadPunctuation(file, kv) {
  const punctuation = JSON.parse(await file.text());
  kv.set([ "data", "punctuation" ], punctuation);
}

export async function loadItemGrades(file, kv) {
  const itemGrades = JSON.parse(await file.text());
  Object.entries(itemGrades).forEach(([compoundKey, gradeMap]) => {
    Object.entries(gradeMap).forEach(([rawScore, grades]) => {
      kv.set([ "data", "item-grades", compoundKey, parseInt(rawScore) ], grades);
    });
  });
}
