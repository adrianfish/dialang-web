#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <prefix>"
  exit 1
fi

npx wrangler kv key list --binding=DIALANG_KV --prefix=$1
