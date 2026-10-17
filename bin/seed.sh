#!/bin/sh

npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/answers.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/booklet-baskets.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/booklet-lengths.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/item-answers.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/item-grades.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/items.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/language-names.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/preest-assignments.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/preest-weights.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/punctuation.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/sa-grading.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/sa-weights.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/skill-names.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/vspt-bands.json
npx wrangler kv bulk put --local --binding=DIALANG_KV data-files/vspt-words.json
