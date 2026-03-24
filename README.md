# minion-kit

A toolkit with different skills and tools to be used by AI agents.

## Packages

| Package | Published | Description |
|---------|-----------|-------------|
| `fetch-that` | Yes | Cross-OS URL fetcher CLI with composable plugin architecture |
| `fetch-jq` | No (internal) | Plugin: apply jq filters to JSON responses |
| `fetch-json-schema` | No (internal) | Plugin: infer JSON Schema from responses |
| `fetch-md` | No (internal) | Plugin: convert HTML responses to Markdown |

## Development

```bash
bun install          # Install all workspace dependencies
bun test             # Run tests across all packages
bun run format       # Format with Biome
bun run lint         # Lint with Biome
bun run check        # Full Biome check
```
