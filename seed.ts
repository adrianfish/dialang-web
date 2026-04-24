import { createHash } from "./src/utils/utils.ts";
import { parseArgs } from "@std/cli/parse-args";

const loadSecret = Deno.env.get("DATA_SECRET");
if (!loadSecret) {
  console.error("DATA_SECRET environment variable not set");
  Deno.exit();
}

const hash = await createHash(loadSecret);

const url = "https://dialang.net"
//const url = "http://localhost:3001"
const loadOne = async (filepath, name, type)   => {
  const blob = new Blob([ await Deno.readFile(filepath) ]);
  const form = new FormData();
  form.append("file", blob, name);
  form.append("type", type);
  form.append("hash", hash);
  return fetch(`${url}/api/loaddata`, { method: "POST", body: form })
  .then(r => {
    
    if (r.ok) {
      console.debug(`Successfully uploaded ${name}`);
    } else {
      console.debug(`Failed to upload ${name}: ${r.status}`);
    }
  });
};

const flags = parseArgs(Deno.args, {
  string: [ "type" ],
  boolean: [ "clear" ],
  default: { clear: false },
});

if (!flags.type) {
  console.error("No type specified");
  Deno.exit();
}

console.log(flags.clear);

if (flags.clear) {
  const form = new FormData();
  form.append("clear", "true");
  form.append("type", flags.type);
  form.append("hash", hash);
  await fetch(`${url}/api/loaddata`, { method: "POST", body: form })
  .then(r => {
    console.log(r.status);
  });
  Deno.exit();
}

if (flags.type !== "all") {
  await loadOne(`./data-files/${flags.type}.csv`, `${flags.type}.csv`, flags.type);
} else {
  await Promise.all([
    loadOne("./data-files/vspt-words.csv", "vspt-words.csv", "vspt-words"),
    loadOne("./data-files/vspt-bands.csv", "vspt-bands.csv", "vspt-bands"),
    loadOne("./data-files/sa-grading.csv", "sa-grading.csv", "sa-grades"),
    loadOne("./data-files/sa-weights.csv", "sa-weights.csv", "sa-weights"),
    loadOne("./data-files/preest-assignments.csv", "preest-assignments.csv", "preest-assignments"),
    loadOne("./data-files/preest-weights.csv", "preest-weights.csv", "preest-weights"),
    loadOne("./data-files/booklet-lengths.csv", "booklet-lengths.csv", "booklet-lengths"),
    loadOne("./data-files/booklet-baskets.csv", "booklet-baskets.csv", "booklet-baskets"),
    loadOne("./data-files/items.json", "items.json", "items"),
    loadOne("./data-files/answers.json", "answers.json", "answers"),
    loadOne("./data-files/item-answers.json", "item-answers.json", "item-answers"),
    loadOne("./data-files/punctuation.json", "punctuation.json", "punctuation"),
    loadOne("./data-files/item-grades.json", "item-grades.json", "item-grades"),
  ]);
}
