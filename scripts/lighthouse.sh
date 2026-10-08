#!/usr/bin/env bash
# Lighthouse (mobile profile: mid-range phone, throttled 4G) for Home, Article and People
# against a production server. Reports the median of RUNS runs per page, like Lighthouse CI.
# Usage: BASE_URL=http://localhost:3100 bash scripts/lighthouse.sh
# Needs Chrome; set CHROME_PATH to use Playwright's Chromium.
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
OUT="${OUT:-.lighthouseci}"
RUNS="${RUNS:-3}"
mkdir -p "$OUT"
article=$(curl -s "$BASE_URL/rss.xml" | grep -o '<link>[^<]*/news/[^<]*</link>' | head -1 | sed -E 's#<link>[^/]*//[^/]*##; s#</link>##')

for path in "/" "$article" "/people"; do
  name=$(echo "$path" | tr -c 'a-z0-9\n' '_' | cut -c1-40)
  for run in $(seq 1 "$RUNS"); do
    npx --yes lighthouse@12 "$BASE_URL$path" --quiet --chrome-flags="--headless=new" \
      --output=json --output=html --output-path="$OUT/lh$name-$run" >/dev/null 2>&1
  done
  node -e "
    const runs = Array.from({ length: $RUNS }, (_, i) => require('./$OUT/lh$name-' + (i + 1) + '.report.json'));
    runs.sort((x, y) => x.categories.performance.score - y.categories.performance.score);
    const d = runs[Math.floor(runs.length / 2)];
    const s = Object.fromEntries(Object.entries(d.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
    const a = d.audits;
    console.log('$path'.slice(0, 50).padEnd(52), JSON.stringify(s),
      'LCP', a['largest-contentful-paint'].displayValue, 'CLS', a['cumulative-layout-shift'].displayValue,
      'TBT', a['total-blocking-time'].displayValue,
      '| all runs:', runs.map((r) => Math.round(r.categories.performance.score * 100)).join(','));
  "
done
