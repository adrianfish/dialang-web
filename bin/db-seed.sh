#!/bin/sh

if [ -z "$1" ]; then
  type="--local"
else
  type=$1
fi

npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/answers.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/booklet-baskets.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/booklet-lengths.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/item-answers.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/item-grades.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/items.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/language-names.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/preest-assignments.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/preest-weights.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/punctuation.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/sa-grading.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/sa-weights.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/skill-names.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/vspt-bands.json
npx wrangler kv bulk put ${type} --binding=DIALANG_KV db-seed-data-files/vspt-words.json
