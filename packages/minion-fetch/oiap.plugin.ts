import type { PluginDefinition } from "@oiap/core";
import { definePlugin, markdownFile } from "@oiap/core";

const commandPrompt = markdownFile("prompts/command.md", {
	baseUrl: import.meta.url,
});

export default definePlugin({
	manifest: {
		id: "minion-fetch",
		name: "minion-fetch",
		version: "0.1.0",
		description:
			"Adds a portable minion-fetch command for URL fetching and response transforms.",
		license: "MIT",
		categories: ["web", "fetch", "commands"],
		supportedTargets: [
			"antigravity",
			"claude-code",
			"codex",
			"cursor",
			"openclaw",
			"vscode-copilot-chat",
		],
	},
	invocations: [
		{
			id: "minion-fetch-invocation",
			canonical: "minion-fetch",
			targetAliases: {
				antigravity: "minion-fetch",
				"claude-code": "minion-fetch",
				codex: "minion-fetch",
				cursor: "minion-fetch",
				openclaw: "minion-fetch",
				"vscode-copilot-chat": "minion-fetch",
			},
			helpText:
				"Fetch a URL with minion-fetch and optionally apply jq, JSON Schema, or Markdown transforms.",
			examples: [
				"/minion-fetch https://example.com",
				"/minion-fetch https://api.example.com/users --jq --apply '.users[] | select(.active)'",
			],
		},
	],
	instructions: [
		{
			id: "minion-fetch-command-prompt",
			purpose: "command",
			triggers: [
				"fetch a URL",
				"summarize a webpage",
				"infer JSON schema from a response",
				"convert fetched HTML to markdown",
				"filter fetched JSON with jq",
			],
			body: commandPrompt,
		},
	],
	commands: [
		{
			id: "minion-fetch-command",
			invocation: { id: "minion-fetch-invocation", kind: "invocation" },
			prompt: {
				id: "minion-fetch-command-prompt",
				kind: "instruction",
			},
		},
	],
} satisfies PluginDefinition);
