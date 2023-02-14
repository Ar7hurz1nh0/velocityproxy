#!/usr/bin/env bash
echo "Starting proxy"

mkdir -p cache/plugins
if [ ! -f cache.json ]
then
  touch cache.json
  echo '{"velocity":{"name":"velocity.jar","sha256":""},"updatedAt":0,"plugins":[]}' > cache.json
fi

deno run --allow-net --allow-write --allow-read getUpdates.ts
cp -rf -v -u cache/* .
rm cache/*
echo "Everything is up to date"

echo "Starting proxy"
java \
  -XX:+AlwaysPreTouch \
  -Xmx700M \
  -jar velocity.jar