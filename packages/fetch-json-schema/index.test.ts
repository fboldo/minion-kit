import { describe, expect, test } from "bun:test";
import type { AgentFetchResult } from "minion-fetch";
import { jsonSchemaPlugin } from "./index.ts";

describe("fetch-json-schema plugin", () => {
	test("infers schema from a simple object", async () => {
		const result: AgentFetchResult = {
			status: 200,
			headers: {},
			contentType: "application/json",
			body: JSON.stringify({ name: "Alice", age: 30, active: true }),
		};
		const out = await jsonSchemaPlugin.postProcess!(result, {});
		const schema = JSON.parse(out.body);
		expect(schema.type).toBe("object");
		expect(schema.properties.name.type).toBe("string");
		expect(schema.properties.age.type).toBe("integer");
		expect(schema.properties.active.type).toBe("boolean");
		expect(schema.required).toContain("name");
	});

	test("infers schema from an array", async () => {
		const result: AgentFetchResult = {
			status: 200,
			headers: {},
			contentType: "application/json",
			body: JSON.stringify([{ id: 1 }, { id: 2 }]),
		};
		const out = await jsonSchemaPlugin.postProcess!(result, {});
		const schema = JSON.parse(out.body);
		expect(schema.type).toBe("array");
		expect(schema.items.type).toBe("object");
	});

	test("throws on non-JSON input", async () => {
		const result: AgentFetchResult = {
			status: 200,
			headers: {},
			contentType: "text/html",
			body: "<html></html>",
		};
		expect(jsonSchemaPlugin.postProcess!(result, {})).rejects.toThrow(
			"valid JSON",
		);
	});
});
