import * as loaders from "./dataloaders.ts";

const kv: Deno.Kv = await Deno.openKv();

let text: string = (await Deno.readTextFile("../data-files/vspt-words.csv"));
await loaders.loadVsptWords(text, kv);

text = (await Deno.readTextFile("../data-files/vspt-bands.csv"));
await loaders.loadVsptBands(text, kv);

text = (await Deno.readTextFile("../data-files/sa-grading.csv"));
await loaders.loadSaGrades(text, kv);

text = (await Deno.readTextFile("../data-files/sa-weights.csv"));
await loaders.loadSaWeights(text, kv);

text = (await Deno.readTextFile("../data-files/preest-assignments.csv"));
await loaders.loadPreestAssignments(text, kv);

text = (await Deno.readTextFile("../data-files/preest-weights.csv"));
await loaders.loadPreestWeights(text, kv);

text = (await Deno.readTextFile("../data-files/booklet-lengths.csv"));
await loaders.loadBookletLengths(text, kv);

text = (await Deno.readTextFile("../data-files/booklet-baskets.csv"));
await loaders.loadBookletBaskets(text, kv);

text = (await Deno.readTextFile("../data-files/items.json"));
await loaders.loadItems(text, kv);

text = (await Deno.readTextFile("../data-files/answers.json"));
await loaders.loadAnswers(text, kv);

text = (await Deno.readTextFile("../data-files/item-answers.json"));
await loaders.loadItemAnswers(text, kv);

text = (await Deno.readTextFile("../data-files/punctuation.json"));
await loaders.loadPunctuation(text, kv);

text = (await Deno.readTextFile("../data-files/item-grades.json"));
await loaders.loadItemGrades(text, kv);

text = (await Deno.readTextFile("../data-files/language-names.json"));
await loaders.loadLanguageNames(text, kv);

text = (await Deno.readTextFile("../data-files/skill-names.json"));
await loaders.loadSkillNames(text, kv);

//kv.close();
