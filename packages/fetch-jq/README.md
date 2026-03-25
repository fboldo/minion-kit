# fetch-jq

Internal plugin for [minion-fetch](../minion-fetch/README.md) — applies jq filters to JSON responses.

Requires `jq` installed on the system.

## Usage via minion-fetch

```bash
npx minion-fetch --jq <URL> --apply '.data | map(select(.active == true))'
```
