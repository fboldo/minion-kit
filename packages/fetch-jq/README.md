# fetch-jq

Internal plugin for [fetch-that](../fetch-that/README.md) — applies jq filters to JSON responses.

Requires `jq` installed on the system.

## Usage via fetch-that

```bash
npx fetch-that --jq <URL> --apply '.data | map(select(.active == true))'
```
