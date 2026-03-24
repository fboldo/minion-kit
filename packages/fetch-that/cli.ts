#!/usr/bin/env bun

import { Command } from "commander";
import { type FetchThatRequest, runPipeline } from "./index.ts";
import { builtinPlugins } from "./plugins.ts";

const program = new Command();

program
	.name("fetch-that")
	.description("Cross-OS URL fetcher for AI agents with composable plugins")
	.version("0.1.0")
	.argument("<url>", "URL to fetch")
	.option("-X, --method <method>", "HTTP method", "GET")
	.option("-H, --headers <header...>", 'Headers in "Name: Value" format')
	.option("-a, --attempts <number>", "Number of retry attempts", "1");

for (const plugin of builtinPlugins) {
	program.option(plugin.enableFlag, `[${plugin.name}] ${plugin.description}`);
	for (const opt of plugin.options) {
		program.option(
			opt.flags,
			`[${plugin.name}] ${opt.description}`,
			opt.defaultValue as string | undefined,
		);
	}
}

program.action(async (url: string, opts: Record<string, unknown>) => {
	const headers: Record<string, string> = {};
	if (opts.headers) {
		for (const h of opts.headers as string[]) {
			const idx = h.indexOf(":");
			if (idx === -1) {
				console.error(`Invalid header format: ${h}`);
				process.exit(1);
			}
			const key = h.slice(0, idx).trim();
			const value = h.slice(idx + 1).trim();
			headers[key] = value;
		}
	}

	const enabledPluginIds = new Set<string>();
	const pluginOptions: Record<string, unknown> = {};

	for (const plugin of builtinPlugins) {
		// enableFlag looks like "--jq", extract camelCase key "jq"
		const flagKey = plugin.enableFlag
			.replace(/^--/, "")
			.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
		if (opts[flagKey]) {
			enabledPluginIds.add(plugin.id);
		}
		for (const opt of plugin.options) {
			// Extract the long flag name from flags like "--apply <filter>"
			const match = opt.flags.match(/--([a-z-]+)/);
			if (match?.[1]) {
				const optKey = match[1].replace(/-([a-z])/g, (_, c: string) =>
					c.toUpperCase(),
				);
				if (opts[optKey] !== undefined) {
					pluginOptions[optKey] = opts[optKey];
				}
			}
		}
	}

	const request: FetchThatRequest = {
		url,
		method: (opts.method as string) ?? "GET",
		headers,
		attempts: Number.parseInt(opts.attempts as string, 10) || 1,
		pluginOptions,
	};

	try {
		const result = await runPipeline(request, builtinPlugins, enabledPluginIds);

		if (result.status >= 400) {
			console.error(`HTTP ${result.status}`);
			process.stdout.write(result.body);
			process.exit(1);
		}

		process.stdout.write(result.body);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`fetch-that: ${message}`);
		process.exit(1);
	}
});

program.parse();
