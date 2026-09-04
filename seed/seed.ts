import * as loaders from "./dataloaders.ts";


async function writeInChunks<T>(
  items: T[],
  chunkSize: number,
  writeFn: (item: T) => Promise<void>,
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(writeFn));
  }
}

if (Deno.env.get("DENO_TIMELINE") === "production") {

  const kv: Deno.Kv = await Deno.openKv();

  for await (const entry of kv.list({ prefix: [ "data" ] })) {
    await kv.delete(entry.key);
  }

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

  const memory = Deno.memoryUsage();
  console.log(`Heap Used: ${Math.round(memory.heapUsed / 1024 / 1024)} MB`);
  console.log(`Heap Total: ${Math.round(memory.heapTotal / 1024 / 1024)} MB`);
  console.log(`External: ${Math.round(memory.external / 1024 / 1024)} MB`);

  kv.close();
}

Deno.exit(0);
