import { parse } from "@std/csv";
import { PreestAssignment, SAGrade, VSPBand, VSPWord } from "../src/types.ts";

async function writeInBatches<T>(
  items: T[],
  kv: Deno.Kv,
  writeFn: (op: Deno.AtomicOperation, item: T) => Deno.AtomicOperation,
) {

  const BATCH_SIZE = 200;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch: T[] = items.slice(i, i + BATCH_SIZE);
    let op: Deno.AtomicOperation = kv.atomic();
    for (const item of batch) op = writeFn(op, item);
    await op.commit();
  }
}

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

  await writeInBatches(
    Object.entries(allWords),
    kv,
    (op, [tl, words]) => op.set(["data", "vspt-words", tl], words),
  );
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

  await writeInBatches(
    Object.entries(allBands),
    kv,
    (op, [tl, bands]) => op.set(["data", "vspt-bands", tl], bands),
  );
}

export async function loadSaGrades(text: string, kv: Deno.Kv) {

  const saGrades: Array<SAGrade> = [];
  parse(text, { skipFirstRow: true }).forEach(g => {

    const converted: SAGrade = { skill: g.skill, rsc: parseInt(g.rsc), ppe: parseFloat(g.ppe), se: parseFloat(g.se), grade: parseInt(g.grade) };
    saGrades.push(converted);
  });
  await writeInBatches(
    saGrades,
    kv,
    (op, g) => op.set([ "data", "sa-grades", g.skill, g.rsc ], g),
  );
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

  await writeInBatches(
    Object.entries(allSaWeights),
    kv,
    (op, [skill, weights]) => op.set([ "data", "sa-weights", skill ], weights),
  );
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

  await writeInBatches(
    Object.entries(allAssignments),
    kv,
    (op, [key, assignments]) => op.set([ "data", "preest-assignments", key ], assignments),
  );
}

export async function loadPreestWeights(text: string, kv: Deno.Kv) {
  const records: Array<object> = parse(text, { skipFirstRow: true });
  await writeInBatches(
    records,
    kv,
    (op, w) => {
      const weight = { sa: parseFloat(w.sa), vspt: parseFloat(w.vspt), coe: parseFloat(w.coe) };
      return op.set([ "data", "preest-weights", w.key ], weight);
    },
  );
}

export async function loadBookletLengths(text: string, kv: Deno.Kv) {
  const records: Array<object> = parse(text, { skipFirstRow: true });
  await writeInBatches(
    records,
    kv,
    (op, l) => op.set([ "data", "booklet-lengths", parseInt(l.booklet_id) ], parseInt(l.length)),
  );
}

export async function loadBookletBaskets(text: string, kv: Deno.Kv) {
  const records: Array<object> = parse(text, { skipFirstRow: true });
  await writeInBatches(
    records,
    kv,
    (op, bb) => {
      const bookletId = parseInt(bb.booklet_id);
      const basketIds: Array<number> = bb.basket_ids.split(",").map(id => parseInt(id));
      return op.set([ "data", "booklet-baskets", bookletId ], basketIds);
    },
  );
} 

export async function loadItems(text: string, kv: Deno.Kv) {
  const items = JSON.parse(text);
  await writeInBatches(
    Object.entries(items),
    kv,
    (op, [id, item]) => op.set([ "data", "items", parseInt(id) ], item),
  );
}

export async function loadAnswers(text: string, kv: Deno.Kv) {
  const answers = JSON.parse(text);
  await writeInBatches(
    Object.entries(answers),
    kv,
    (op, [id, answer]) => op.set([ "data", "answers", parseInt(id) ], answer),
  );
}

export async function loadItemAnswers(text: string, kv: Deno.Kv) {
  const itemAnswers = JSON.parse(text);
  await writeInBatches(
    Object.entries(itemAnswers),
    kv,
    (op, [itemId, answers]) => op.set([ "data", "item-answers", parseInt(itemId) ], answers),
  );
}

export async function loadPunctuation(text: string, kv: Deno.Kv) {
  const punctuation = JSON.parse(text);
  await kv.set([ "data", "punctuation" ], punctuation);
}

export async function loadItemGrades(text: string, kv: Deno.Kv) {
  const itemGrades = JSON.parse(text);
  for (const [compoundKey, gradeMap] of Object.entries(itemGrades)) {
    await writeInBatches(
      Object.entries(gradeMap as object),
      kv,
      (op, [rawScore, grades]) => op.set([ "data", "item-grades", compoundKey, parseInt(rawScore) ], grades),
    );
  }
}

export async function loadLanguageNames(text: string, kv: Deno.Kv) {
  const languageNames = JSON.parse(text);
  let op: Deno.AtomicOperation = kv.atomic();
  for (const [locale, languages] of Object.entries(languageNames)) {
    op = op.set([ "data", "language-names", locale ], languages);
  }
  await op.commit();
}

export async function loadSkillNames(text: string, kv: Deno.Kv) {
  const skillNames = JSON.parse(text);
  let op: Deno.AtomicOperation = kv.atomic();
  for (const [locale, skills] of Object.entries(skillNames)) {
    op = op.set([ "data", "skill-names", locale ], skills);
  }
  await op.commit();
}
