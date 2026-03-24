import { describe, expect, test } from "bun:test";
import type { FetchThatPlugin, FetchThatRequest } from "./index.ts";
import { createPlugin, executeFetch, runPipeline } from "./index.ts";

describe("createPlugin", () => {
	test("returns the same definition object", () => {
		const def: FetchThatPlugin = {
			id: "test",
			name: "test",
			description: "A test plugin",
			enableFlag: "--test",
			options: [],
		};
		expect(createPlugin(def)).toBe(def);
	});
});

describe("executeFetch", () => {
	test("fetches a URL and returns status, body, headers", async () => {
		const request: FetchThatRequest = {
			url: "https://httpbin.org/get",
			method: "GET",
			headers: {},
			attempts: 1,
			pluginOptions: {},
		};
		const result = await executeFetch(request);
		expect(result.status).toBe(200);
		expect(result.contentType).toContain("application/json");
		expect(result.body).toBeTruthy();
	});

	test("passes custom headers", async () => {
		const request: FetchThatRequest = {
			url: "https://httpbin.org/headers",
			method: "GET",
			headers: { "X-Custom": "test-value" },
			attempts: 1,
			pluginOptions: {},
		};
		const result = await executeFetch(request);
		const body = JSON.parse(result.body);
		expect(body.headers["X-Custom"]).toBe("test-value");
	});

	test("retries on failure", async () => {
		const counter = { value: 0 };
		const originalFetch = globalThis.fetch;
		// @ts-expect-error: simplified mock without Bun-specific preconnect
		globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
			counter.value++;
			if (counter.value < 2) {
				throw new Error("simulated failure");
			}
			return originalFetch(...args);
		};
		try {
			const request: FetchThatRequest = {
				url: "https://httpbin.org/get",
				method: "GET",
				headers: {},
				attempts: 3,
				pluginOptions: {},
			};
			const result = await executeFetch(request);
			expect(result.status).toBe(200);
			expect(counter.value).toBe(2);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

describe("runPipeline", () => {
	test("runs pre and post hooks in order", async () => {
		const order: string[] = [];

		const pluginA = createPlugin({
			id: "a",
			name: "A",
			description: "",
			enableFlag: "--a",
			options: [],
			async preProcess(req) {
				order.push("a-pre");
				return req;
			},
			async postProcess(res) {
				order.push("a-post");
				return res;
			},
		});

		const pluginB = createPlugin({
			id: "b",
			name: "B",
			description: "",
			enableFlag: "--b",
			options: [],
			async preProcess(req) {
				order.push("b-pre");
				return req;
			},
			async postProcess(res) {
				order.push("b-post");
				return res;
			},
		});

		const request: FetchThatRequest = {
			url: "https://httpbin.org/get",
			method: "GET",
			headers: {},
			attempts: 1,
			pluginOptions: {},
		};

		await runPipeline(request, [pluginA, pluginB], new Set(["a", "b"]));
		expect(order).toEqual(["a-pre", "b-pre", "a-post", "b-post"]);
	});

	test("skips disabled plugins", async () => {
		const called: string[] = [];

		const plugin = createPlugin({
			id: "skip-me",
			name: "SkipMe",
			description: "",
			enableFlag: "--skip",
			options: [],
			async postProcess(res) {
				called.push("skip");
				return res;
			},
		});

		const request: FetchThatRequest = {
			url: "https://httpbin.org/get",
			method: "GET",
			headers: {},
			attempts: 1,
			pluginOptions: {},
		};

		await runPipeline(request, [plugin], new Set());
		expect(called).toEqual([]);
	});

	test("plugin can mutate request headers", async () => {
		const plugin = createPlugin({
			id: "header-setter",
			name: "HeaderSetter",
			description: "",
			enableFlag: "--hs",
			options: [],
			async preProcess(req) {
				return {
					...req,
					headers: { ...req.headers, "X-Plugin": "injected" },
				};
			},
		});

		const request: FetchThatRequest = {
			url: "https://httpbin.org/headers",
			method: "GET",
			headers: {},
			attempts: 1,
			pluginOptions: {},
		};

		const result = await runPipeline(
			request,
			[plugin],
			new Set(["header-setter"]),
		);
		const body = JSON.parse(result.body);
		expect(body.headers["X-Plugin"]).toBe("injected");
	});
});
