# fetch-that

Cross-OS URL fetcher for AI agents with a composable plugin architecture.

## CLI Usage

```bash
# Basic fetch
npx fetch-that <URL> --headers "Header-Name: Header-Value" --method GET --attempts 3

# With jq filter
npx fetch-that --jq <URL> --apply '.data | map(select(.active == true))'

# Infer JSON Schema from response
npx fetch-that --json-schema <URL>

# Convert HTML to Markdown
npx fetch-that --md <URL>
```

Run `npx fetch-that --help` to see all options — each plugin contributes its own section.

## Library API

```ts
import { executeFetch, runPipeline, createPlugin } from "fetch-that";
import type { FetchThatRequest, FetchThatResult, FetchThatPlugin } from "fetch-that";
```

### `executeFetch(request: FetchThatRequest): Promise<FetchThatResult>`

Performs an HTTP fetch with retry support. The request object controls URL, method, headers, body, and number of attempts.

### `runPipeline(request, plugins, enabledPluginIds): Promise<FetchThatResult>`

Orchestrates the full lifecycle: pre-process hooks → fetch → post-process hooks, running only the plugins whose IDs are in the enabled set.

### `createPlugin(def: FetchThatPlugin): FetchThatPlugin`

Factory helper for defining plugins with a consistent shape — id, name, CLI flags, help text, and optional pre/post hooks.

## Plugin Architecture

Plugins are composable extensions that hook into the fetch lifecycle:

- **Pre-process**: mutate the request before fetch (e.g. inject headers)
- **Post-process**: transform the result after fetch (e.g. filter JSON, convert HTML)

Each plugin declares its own CLI flags and help description, which are registered automatically in `fetch-that --help`.

### Built-in Plugins

| Plugin | Flag | Description |
|--------|------|-------------|
| `fetch-jq` | `--jq` | Apply a jq filter to the JSON response |
| `fetch-json-schema` | `--json-schema` | Infer a JSON Schema from the response |
| `fetch-md` | `--md` | Convert an HTML response to Markdown |
