#!/bin/sh

if [ -z "$1" ]; then
  type="--local"
else
  type=$1
fi

npx wrangler d1 migrations apply DIALANG_DATA_CAPTURE ${type}
