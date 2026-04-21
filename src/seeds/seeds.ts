import { parse } from "@std/csv";

export async function seedVsptWords(file, kv) {
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
  Object.entries(allWords).forEach(([tl, words]) => kv.set(["vsp_words", tl], words));
}

export async function seedVsptBands(file, kv) {
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
  Object.entries(allBands).forEach(([tl, bands]) => kv.set(["vsp_bands", tl], bands));
}

export async function seedSaGrades(file, kv) {
  const saGrades = [];
  parse((await file.text()), { skipFirstRow: true }).forEach(g => {

    const converted = { skill: g.skill, rsc: parseInt(g.rsc), ppe: parseFloat(g.ppe).toFixed(2), se: parseFloat(g.se).toFixed(), grade: parseInt(g.grade) };
    saGrades.push(converted);
  });
  saGrades.forEach(g  => kv.set(["sa_grades", g.skill, g.rsc], g));
}

export async function seedSaWeights(file, kv) {
  const allSaWeights = {};
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {

    if (allSaWeights[w.skill]) {
      allSaWeights[w.skill][w.wid] = parseInt(w.weight);
    } else {
      allSaWeights[w.skill] = { [w.wid]: parseInt(w.weight) };
    }
  });
  Object.entries(allSaWeights).forEach(([skill, weights])  => kv.set(["sa_weights", skill], weights));
}

export async function seedPreestAssignments(file, kv) {
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
  Object.entries(allAssignments).forEach(([key, assignments])  => kv.set(["preest_assignments", key], assignments));
}

export async function seedPreestWeights(file, kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(w => {
    const weight = { sa: parseFloat(w.sa), vspt: parseFloat(w.vspt), coe: parseFloat(w.coe) };
    kv.set(["preest_weights", w.key], weight);
  });
}

export async function seedBookletLengths(file, kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(l => {
    kv.set(["booklet_lengths", parseInt(l.booklet_id)], parseInt(l.length));
  });
}

export async function seedBookletBaskets(file, kv) {
  parse((await file.text()), { skipFirstRow: true }).forEach(bb => {
    const bookletId = parseInt(bb.booklet_id);
    const basketIds: Array<number> = bb.basket_ids.split(",").map(id => parseInt(id));
    kv.set([ "booklet_baskets", bookletId ], basketIds);
  });
} 

export async function seedItems(file, kv) {
  const items = JSON.parse(await file.text());
  Object.entries(items).forEach(([id, item]) => kv.set([ "items", parseInt(id) ], item));
}

export async function seedAnswers(file, kv) {
  const answers = JSON.parse(await file.text());
  Object.entries(answers).forEach(([id, answer]) => kv.set([ "answers", parseInt(id) ], answer));
}

export async function seedItemAnswers(file, kv) {
  const itemAnswers = JSON.parse(await file.text());
  Object.entries(itemAnswers).forEach(([itemId, answers]) => kv.set([ "item_answers", parseInt(itemId) ], answers));
}

export async function seedPunctuation(file, kv) {
  const punctuation = JSON.parse(await file.text());
  kv.set([ "punctuation" ], punctuation);
}

export async function seedItemGrades(file, kv) {
  const itemGrades = JSON.parse(await file.text());
  Object.entries(itemGrades).forEach(([compoundKey, gradeMap]) => {
    Object.entries(gradeMap).forEach(([rawScore, grades]) => {
      kv.set([ "item_grades", compoundKey, parseInt(rawScore) ], grades);
    });
  });
}
