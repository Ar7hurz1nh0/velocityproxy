#!/usr/bin/env bash
echo "Starting proxy"

deno run --allow-net --allow-write --allow-read getUpdates.ts
cd cache || exit
cp -rf -v -u * ..
cd ..
rm cache/plugins/*
echo "Everything is up to date"

echo "Starting proxy"
java \
  -XX:+UseG1GC \
  -XX:+UnlockExperimentalVMOptions \
  -XX:InitiatingHeapOccupancyPercent=24 \
  -XX:ConcGCThreads=16 \
  -XX:G1HeapRegionSize=128M \
  -XX:G1HeapWastePercent=1 \
  -XX:G1MixedGCLiveThresholdPercent=65 \
  -XX:G1RSetUpdatingPauseTimePercent=4 \
  -XX:G1ConcRefinementThreads=16 \
  -Xmx1G \
  -jar velocity.jar
