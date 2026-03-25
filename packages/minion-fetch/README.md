# minion-fetch

Cross-OS URL fetcher for AI agents with a composable plugin architecture.

## CLI Usage

```bash
# Basic fetch
npx minion-fetch <URL> --headers "Header-Name: Header-Value" --method GET --attempts 3

# With jq filter
npx minion-fetch --jq <URL> --apply '.data | map(select(.active == true))'

# Infer JSON Schema from response
npx minion-fetch --json-schema <URL>

# Convert HTML to Markdown
npx minion-fetch --md <URL>
```

Run `npx minion-fetch --help` to see all options — each plugin contributes its own section.

## Library API

```ts
import { executeFetch, runPipeline, createPlugin } from "minion-fetch";
import type { AgentFetchRequest, AgentFetchResult, AgentFetchPlugin } from "minion-fetch";
```

### `executeFetch(request: AgentFetchRequest): Promise<AgentFetchResult>`

Performs an HTTP fetch with retry support. The request object controls URL, method, headers, body, and number of attempts.

### `runPipeline(request, plugins, enabledPluginIds): Promise<AgentFetchResult>`

Orchestrates the full lifecycle: pre-process hooks → fetch → post-process hooks, running only the plugins whose IDs are in the enabled set.

### `createPlugin(def: AgentFetchPlugin): AgentFetchPlugin`

Factory helper for defining plugins with a consistent shape — id, name, CLI flags, help text, and optional pre/post hooks.

## Plugin Architecture

Plugins are composable extensions that hook into the fetch lifecycle:

- **Pre-process**: mutate the request before fetch (e.g. inject headers)
- **Post-process**: transform the result after fetch (e.g. filter JSON, convert HTML)

Each plugin declares its own CLI flags and help description, which are registered automatically in `minion-fetch --help`.

### Built-in Plugins

| Plugin | Flag | Description |
|--------|------|-------------|
| `fetch-jq` | `--jq` | Apply a jq filter to the JSON response |
| `fetch-json-schema` | `--json-schema` | Infer a JSON Schema from the response |
| `fetch-md` | `--md` | Convert an HTML response to Markdown |
