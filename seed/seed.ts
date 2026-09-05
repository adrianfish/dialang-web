import * as loaders from "./dataloaders.ts";
import { delay } from "@std/async/delay";

//const kv: Deno.Kv = await Deno.openKv();

let kv = await Deno.openKv(
  "https://api.deno.com/v2/databases/6a76457b-2585-4f01-bc86-af2675de912f/connect",
);

console.log("Got connection.");

console.log("Clearing out existing data ...");

let batch: Deno.KvKey[] = [];

const BATCH_SIZE = 500;
async function flushBatch(kv: Deno.Kv, keys: Deno.KvKey[]) {
  if (keys.length === 0) return;
  let op = kv.atomic();
  for (const key of keys) op = op.delete(key);
  await op.commit();
}

for await (const entry of kv.list({ prefix: [ "data" ] })) {
  batch.push(entry.key);
  if (batch.length >= BATCH_SIZE) {
    await flushBatch(kv, batch);
    batch = [];
  }
}

await flushBatch(kv, batch); // flush any remainder

console.log("Cleared out existing data.");

console.log("Loading vspt words ...");
let text: string = (await Deno.readTextFile("./data-files/vspt-words.csv"));
try {
  await loaders.loadVsptWords(text, kv);
  console.log("Loaded vspt words.");
} catch (error) {
  await loaders.loadVsptWords(text, kv);
  console.error(`Failed to load vspt words. Reason: ${error}`);
}

console.log("Loading vspt bands ...");
text = (await Deno.readTextFile("./data-files/vspt-bands.csv"));
try {
  await loaders.loadVsptBands(text, kv);
  console.log("Loaded vspt bands ...");
} catch (error) {
  await loaders.loadVsptBands(text, kv);
  console.error(`Failed to load vspt bands. Reason: ${error}`);
}

console.log("Loading sa grading ...");
text = (await Deno.readTextFile("./data-files/sa-grading.csv"));
try {
  await loaders.loadSaGrades(text, kv);
  console.log("Loaded sa grading.");
} catch (error) {
  await loaders.loadSaGrades(text, kv);
  console.error(`Failed to load sa grading. Reason: ${error}`);
}

console.log("Loading sa weights ...");
text = (await Deno.readTextFile("./data-files/sa-weights.csv"));
try {
  await loaders.loadSaWeights(text, kv);
  console.log("Loaded sa weights.");
} catch (error) {
  await loaders.loadSaWeights(text, kv);
  console.error(`Failed to load sa weights. Reason: ${error}`);
}

console.log("Loading preest assignments ...");
text = (await Deno.readTextFile("./data-files/preest-assignments.csv"));
try {
  await loaders.loadPreestAssignments(text, kv);
  console.log("Loaded preest assignments.");
} catch (error) {
  await loaders.loadPreestAssignments(text, kv);
  console.error(`Failed to load preest assignments. Reason: ${error}`);
}

console.log("Loading preest weights ...");
text = (await Deno.readTextFile("./data-files/preest-weights.csv"));
try {
  await loaders.loadPreestWeights(text, kv);
  console.log("Loaded preest weights.");
} catch (error) {
  await loaders.loadPreestWeights(text, kv);
  console.error(`Failed to load preest weights. Reason: ${error}`);
}

console.log("Loading booklet lengths ...");
text = (await Deno.readTextFile("./data-files/booklet-lengths.csv"));
try {
  await loaders.loadBookletLengths(text, kv);
  console.log("Loaded booklet lengths.");
} catch (error) {
  await loaders.loadBookletLengths(text, kv);
  console.error(`Failed to load booklet lengths. Reason: ${error}`);
}

console.log("Loading booklet baskets ...");
text = (await Deno.readTextFile("./data-files/booklet-baskets.csv"));
try {
  await loaders.loadBookletBaskets(text, kv);
  console.log("Loaded booklet baskets.");
} catch (error) {
  await loaders.loadBookletBaskets(text, kv);
  console.error(`Failed to load booklet baskets. Reason: ${error}`);
}

console.log("Loading items ...");
text = (await Deno.readTextFile("./data-files/items.json"));
try {
  await loaders.loadItems(text, kv);
  console.log("Loaded items.");
} catch (error) {
  await loaders.loadItems(text, kv);
  console.error(`Failed to load items. Reason: ${error}`);
}

console.log("Loading answers ...");
text = (await Deno.readTextFile("./data-files/answers.json"));
try {
  await loaders.loadAnswers(text, kv);
  console.log("Loaded answers.");
} catch (error) {
  await loaders.loadAnswers(text, kv);
  console.error(`Failed to load answers. Reason: ${error}`);
}

console.log("Loading item answers ...");
text = (await Deno.readTextFile("./data-files/item-answers.json"));
try {
  await loaders.loadItemAnswers(text, kv);
  console.log("Loaded item answers ...");
} catch (error) {
  await loaders.loadItemAnswers(text, kv);
  console.error(`Failed to load item answers. Reason: ${error}`);
}

console.log("Loading punctuation ...");
text = (await Deno.readTextFile("./data-files/punctuation.json"));
try {
  await loaders.loadPunctuation(text, kv);
  console.log("Loaded punctuation.");
} catch (error) {
  await loaders.loadPunctuation(text, kv);
  console.error(`Failed to load punctuation. Reason: ${error}`);
}

console.log("Loading item grades ...");
text = (await Deno.readTextFile("./data-files/item-grades.json"));
try {
  await loaders.loadItemGrades(text, kv);
  console.log("Loaded item grades ...");
} catch (error) {
  await loaders.loadItemGrades(text, kv);
  console.error(`Failed to load item grades. Reason: ${error}`);
}

console.log("Loading language names ...");
text = (await Deno.readTextFile("./data-files/language-names.json"));
try {
  await loaders.loadLanguageNames(text, kv);
  console.log("Loaded language names.");
} catch (error) {
  await loaders.loadLanguageNames(text, kv);
  console.error(`Failed to load language names. Reason: ${error}`);
}

console.log("Loading skill names ...");
text = (await Deno.readTextFile("./data-files/skill-names.json"));
try {
  await loaders.loadSkillNames(text, kv);
  console.log("Loaded skill names ...");
} catch (error) {
  await loaders.loadSkillNames(text, kv);
  console.error(`Failed to load skill names. Reason: ${error}`);
}

/*
const memory = Deno.memoryUsage();
console.log(`Heap Used: ${Math.round(memory.heapUsed / 1024 / 1024)} MB`);
console.log(`Heap Total: ${Math.round(memory.heapTotal / 1024 / 1024)} MB`);
console.log(`External: ${Math.round(memory.external / 1024 / 1024)} MB`);
*/
kv.close();

