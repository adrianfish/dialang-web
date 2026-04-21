import { parse } from "@std/csv";
import type { PreestAssignment } from "./src/types/types.ts";

const bytes = await Deno.readFile("./data-files/vspt-words.csv");
const blob = new Blob([ bytes ], { type: "text/csv" });
const form = new FormData();
form.append("file", blob, "vspt-words.csv");
form.append("type", "vspt-words");
fetch("http://localhost:3001/api/loaddata", { method: "POST", body: form });


/*
const kv = await Deno.openKv();

const keys = kv.list({ prefix: [] }); // If you want to list all keys without a specific prefix
for await (const entry of keys) {
  console.log(entry);
  await kv.delete(entry.key);
}
// VSP WORDS
const allWords = {};
parse(await Deno.readTextFile("./data-files/vspt-words.csv"), { skipFirstRow: true }).forEach(w => {
  const converted = { ...w, valid: parseInt(w.valid), weight: parseInt(w.weight) };
  const tlWords = allWords[w.test_language];
  if (tlWords) {
    tlWords.push(converted);
  } else {
    allWords[w.test_language] = [ converted ];
  }
});
Object.entries(allWords).forEach(([tl, words]) => kv.set(["vsp_words", tl], words));

// VSP BANDS
const allBands = {};
parse(await Deno.readTextFile("./data-files/vspt-bands.csv"), { skipFirstRow: true }).forEach(b => {

  const converted = { ...b, low: parseInt(b.low), high: parseInt(b.high) };
  const tlBands = allBands[b.test_language];
  if (tlBands) {
    tlBands.push(converted);
  } else {
    allBands[b.test_language] = [ converted ];
  }
});
Object.entries(allBands).forEach(([tl, bands]) => kv.set(["vsp_bands", tl], bands));

// SA GRADES
const saGrades = [];
parse(await Deno.readTextFile("./data-files/sa-grading.csv"), { skipFirstRow: true }).forEach(g => {

  const converted = { skill: g.skill, rsc: parseInt(g.rsc), ppe: parseFloat(g.ppe).toFixed(2), se: parseFloat(g.se).toFixed(), grade: parseInt(g.grade) };
  saGrades.push(converted);
});
saGrades.forEach(g  => kv.set(["sa_grades", g.skill, g.rsc], g));

// SA WEIGHTS
const allSaWeights = {};
parse(await Deno.readTextFile("./data-files/sa-weights.csv"), { skipFirstRow: true }).forEach(w => {

  if (allSaWeights[w.skill]) {
    allSaWeights[w.skill][w.wid] = parseInt(w.weight);
  } else {
    allSaWeights[w.skill] = { [w.wid]: parseInt(w.weight) };
  }
});
Object.entries(allSaWeights).forEach(([skill, weights])  => kv.set(["sa_weights", skill], weights));

// PREEST ASSIGNMENTS
const allAssignments: Record<string, Array<PreestAssignment>> = {};
parse(await Deno.readTextFile("./data-files/preest-assignments.csv"), { skipFirstRow: true }).forEach(a => {

  const converted = { key: a.key, pe: parseFloat(a.pe), bookletId: parseInt(a.booklet_id) };

  const keyAssignments = allAssignments[a.key];
  if (keyAssignments) {
    keyAssignments.push(converted);
  } else {
    allAssignments[a.key] = [ converted ];
  }
});
Object.entries(allAssignments).forEach(([key, assignments])  => kv.set(["preest_assignments", key], assignments));

// PREEST WEIGHTS
parse(await Deno.readTextFile("./data-files/preest-weights.csv"), { skipFirstRow: true }).forEach(w => {
  const weight = { sa: parseFloat(w.sa), vspt: parseFloat(w.vspt), coe: parseFloat(w.coe) };
  kv.set(["preest_weights", w.key], weight);
});

// BOOKLET_LENGTHS
parse(await Deno.readTextFile("./data-files/booklet-lengths.csv"), { skipFirstRow: true }).forEach(l => {
  kv.set(["booklet_lengths", parseInt(l.booklet_id)], parseInt(l.length));
});

// BOOKLET_BASKETS
parse(await Deno.readTextFile("./data-files/booklet-baskets.csv"), { skipFirstRow: true }).forEach(bb => {
  const bookletId = parseInt(bb.booklet_id);
  const basketIds: Array<number> = bb.basket_ids.split(",").map(id => parseInt(id));
  kv.set([ "booklet_baskets", bookletId ], basketIds);
});

// ITEMS
const items = JSON.parse(await Deno.readTextFile("./data-files/items.json"));
Object.entries(items).forEach(([id, item]) => kv.set([ "items", parseInt(id) ], item));

// ANSWERS
const answers = JSON.parse(await Deno.readTextFile("./data-files/answers.json"));
Object.entries(answers).forEach(([id, answer]) => kv.set([ "answers", parseInt(id) ], answer));

// ITEM ANSWERS
const itemAnswers = JSON.parse(await Deno.readTextFile("./data-files/item-answers.json"));
Object.entries(itemAnswers).forEach(([itemId, answers]) => kv.set([ "item_answers", parseInt(itemId) ], answers));

// PUNCTUATION
const punctuation = JSON.parse(await Deno.readTextFile("./data-files/punctuation.json"));
kv.set([ "punctuation" ], punctuation);

// ITEM GRADES
const itemGrades = JSON.parse(await Deno.readTextFile("./data-files/item-grades.json"));
Object.entries(itemGrades).forEach(([compoundKey, gradeMap]) => {
  Object.entries(gradeMap).forEach(([rawScore, grades]) => {
    kv.set([ "item_grades", compoundKey, parseInt(rawScore) ], grades);
  });
});
*/
