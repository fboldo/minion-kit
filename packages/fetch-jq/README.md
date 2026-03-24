# fetch-jq

Internal plugin for [agent-fetch](../agent-fetch/README.md) — applies jq filters to JSON responses.

Requires `jq` installed on the system.

## Usage via agent-fetch

```bash
npx agent-fetch --jq <URL> --apply '.data | map(select(.active == true))'
```
