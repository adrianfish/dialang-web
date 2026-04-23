import { createHash } from "./src/utils/utils.ts";

const loadSecret = Deno.env.get("LOAD_SECRET");
if (!loadSecret) {
  console.error("LOAD_SECRET environment variable not set");
  Deno.exit();
}

const hash = await createHash(loadSecret);

const url = "https://dialang.net"
const postIt = async (filepath, name, type)   => {
  const blob = new Blob([ await Deno.readFile(filepath) ]);
  const form = new FormData();
  form.append("file", blob, name);
  form.append("type", type);
  form.append("hash", hash);
  fetch(`${url}/api/loaddata`, { method: "POST", body: form })
  .then(r => {
    console.log(r.status);
  });
};

postIt("./data-files/vspt-words.csv", "vspt-words.csv", "vspt_words");
postIt("./data-files/vspt-bands.csv", "vspt-bands.csv", "vspt_bands");
postIt("./data-files/sa-grading.csv", "sa-grading.csv", "sa_grades");
postIt("./data-files/sa-weights.csv", "sa-weights.csv", "sa_weights");
postIt("./data-files/preest-assignments.csv", "preest-assignments.csv", "preest_assignments");
postIt("./data-files/preest-weights.csv", "preest-weights.csv", "preest_weights");
postIt("./data-files/booklet-lengths.csv", "booklet-lengths.csv", "booklet_lengths");
postIt("./data-files/booklet-baskets.csv", "booklet-baskets.csv", "booklet_baskets");
postIt("./data-files/items.json", "items.json", "items");
postIt("./data-files/answers.json", "answers.json", "answers");
postIt("./data-files/item-answers.json", "item-answers.json", "item_answers");
postIt("./data-files/punctuation.json", "punctuation.json", "punctuation");
postIt("./data-files/item-grades.json", "item-grades.json", "item_grades");
