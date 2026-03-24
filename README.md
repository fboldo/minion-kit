# minion-kit

A toolkit with different skills and tools to be used by AI agents.

## Packages

Packages exported by this monorepo are CLI tools that can be used directly with `npx`. Each package has its own README with usage instructions.

| Package | Description |
|---------|-------------|
| [`agent-fetch`](./packages/agent-fetch/README.md) | Cross-OS URL fetcher CLI with composable plugin architecture |


## Skills

| Skill | Description |
|-------|-------------|
| [`agent-fetch`](./skills/agent-fetch/SKILL.md) | Cross-OS URL fetcher CLI with composable plugin architecture |

## Development

```bash
bun install          # Install all workspace dependencies
bun test             # Run tests across all packages
bun run format       # Format with Biome
bun run lint         # Lint with Biome
bun run check        # Full Biome check
```
