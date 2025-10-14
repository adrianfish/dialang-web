#!/bin/bash

docker compose down -v

make build
cd ../content && make build
cd ../database  && make build
cd ../datacapture  && make build
cd ../proxy  && make build

cd ../web && docker compose up -d
