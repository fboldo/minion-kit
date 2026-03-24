import { createPlugin, type FetchThatResult } from "fetch-that";

export const jsonSchemaPlugin = createPlugin({
	id: "json-schema",
	name: "json-schema",
	description: "Infer a JSON Schema from the JSON response",
	enableFlag: "--json-schema",
	options: [],
	async postProcess(result: FetchThatResult): Promise<FetchThatResult> {
		const data = parseJson(result.body);
		const schema = infer(data);
		return {
			...result,
			body: JSON.stringify(schema, null, 2),
			contentType: "application/schema+json",
		};
	},
});

/** Parses raw body text as JSON, throwing a user-friendly error on invalid input. */
function parseJson(body: string): unknown {
	try {
		return JSON.parse(body);
	} catch {
		throw new Error("json-schema plugin requires a valid JSON response");
	}
}

/** Recursively infers a minimal JSON Schema from an arbitrary value. */
function infer(value: unknown): Record<string, unknown> {
	if (value === null) {
		return { type: "null" };
	}
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return { type: "array", items: {} };
		}
		return { type: "array", items: infer(value[0]) };
	}
	switch (typeof value) {
		case "string":
			return { type: "string" };
		case "number":
			return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
		case "boolean":
			return { type: "boolean" };
		case "object": {
			const obj = value as Record<string, unknown>;
			const properties: Record<string, unknown> = {};
			const required: string[] = [];
			for (const [key, val] of Object.entries(obj)) {
				properties[key] = infer(val);
				required.push(key);
			}
			return { type: "object", properties, required };
		}
		default:
			return {};
	}
}
