#!/usr/bin/env bash
echo "Starting proxy"

deno run --allow-net --allow-write --allow-read getUpdates.ts
cp -rf -v -u cache/* .
rm cache/*
echo "Everything is up to date"

echo "Starting proxy"
java \
  -XX:+UseG1GC \
  -XX:+UnlockExperimentalVMOptions \
  -XX:InitiatingHeapOccupancyPercent=24 \
  -XX:G1HeapRegionSize=128M \
  -XX:G1HeapWastePercent=1 \
  -XX:G1MixedGCLiveThresholdPercent=65 \
  -XX:G1RSetUpdatingPauseTimePercent=4 \
  -XX:+AlwaysPreTouch \
  -Xmx1G \
  -jar velocity.jar
