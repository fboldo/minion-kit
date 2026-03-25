import { describe, expect, test } from "bun:test";
import type { AgentFetchResult } from "minion-fetch";
import { mdPlugin } from "./index.ts";

describe("fetch-md plugin", () => {
	test("converts HTML to Markdown", async () => {
		const result: AgentFetchResult = {
			status: 200,
			headers: {},
			contentType: "text/html",
			body: "<h1>Hello</h1><p>World</p>",
		};
		const out = await mdPlugin.postProcess!(result, {});
		expect(out.body).toContain("# Hello");
		expect(out.body).toContain("World");
		expect(out.contentType).toBe("text/markdown");
	});

	test("handles HTML without explicit content-type via tag detection", async () => {
		const result: AgentFetchResult = {
			status: 200,
			headers: {},
			contentType: "",
			body: "<div><strong>Bold</strong></div>",
		};
		const out = await mdPlugin.postProcess!(result, {});
		expect(out.body).toContain("**Bold**");
	});

	test("throws on non-HTML input", async () => {
		const result: AgentFetchResult = {
			status: 200,
			headers: {},
			contentType: "application/json",
			body: '{"key": "value"}',
		};
		expect(mdPlugin.postProcess!(result, {})).rejects.toThrow("HTML response");
	});
});
