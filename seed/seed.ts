import * as loaders from "./dataloaders.ts";

const kv: Deno.Kv = await Deno.openKv();

for await (const entry of kv.list({ prefix: [ "data" ] })) {
  await kv.delete(entry.key);
}

let text: string = (await Deno.readTextFile("../data-files/vspt-words.csv"));
loaders.loadVsptWords(text, kv);

text = (await Deno.readTextFile("../data-files/vspt-bands.csv"));
loaders.loadVsptBands(text, kv);

text = (await Deno.readTextFile("../data-files/sa-grading.csv"));
loaders.loadSaGrades(text, kv);

text = (await Deno.readTextFile("../data-files/sa-weights.csv"));
loaders.loadSaWeights(text, kv);

text = (await Deno.readTextFile("../data-files/preest-assignments.csv"));
loaders.loadPreestAssignments(text, kv);

text = (await Deno.readTextFile("../data-files/preest-weights.csv"));
loaders.loadPreestWeights(text, kv);

text = (await Deno.readTextFile("../data-files/booklet-lengths.csv"));
loaders.loadBookletLengths(text, kv);

text = (await Deno.readTextFile("../data-files/booklet-baskets.csv"));
loaders.loadBookletBaskets(text, kv);

text = (await Deno.readTextFile("../data-files/items.json"));
loaders.loadItems(text, kv);

text = (await Deno.readTextFile("../data-files/answers.json"));
loaders.loadAnswers(text, kv);

text = (await Deno.readTextFile("../data-files/item-answers.json"));
loaders.loadItemAnswers(text, kv);

text = (await Deno.readTextFile("../data-files/punctuation.json"));
loaders.loadPunctuation(text, kv);

text = (await Deno.readTextFile("../data-files/item-grades.json"));
loaders.loadItemGrades(text, kv);

text = (await Deno.readTextFile("../data-files/language-names.json"));
loaders.loadLanguageNames(text, kv);

text = (await Deno.readTextFile("../data-files/skill-names.json"));
loaders.loadSkillNames(text, kv);

const memory = Deno.memoryUsage();
console.log(`Heap Used: ${Math.round(memory.heapUsed / 1024 / 1024)} MB`);
console.log(`Heap Total: ${Math.round(memory.heapTotal / 1024 / 1024)} MB`);
console.log(`External: ${Math.round(memory.external / 1024 / 1024)} MB`);
