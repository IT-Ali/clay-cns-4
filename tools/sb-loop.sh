#!/bin/sh
# keeps re-running the (resumable) storyboard render until every panel exists
cd "$(dirname "$0")/.."
for i in 1 2 3 4 5; do node tools/storyboard.mjs 16 960 540 2>&1 | grep -v "GL Driver"; [ "$(ls storyboard/img | wc -l)" -ge 25 ] && break; done
echo LOOP-END
