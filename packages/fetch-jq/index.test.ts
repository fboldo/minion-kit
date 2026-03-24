import { describe, expect, test } from "bun:test";
import type { AgentFetchResult } from "agent-fetch";
import { jqPlugin } from "./index.ts";

const jsonResult: AgentFetchResult = {
	status: 200,
	headers: {},
	contentType: "application/json",
	body: JSON.stringify({
		data: [
			{ name: "a", active: true },
			{ name: "b", active: false },
			{ name: "c", active: true },
		],
	}),
};

describe("fetch-jq plugin", () => {
	test("applies a jq filter", async () => {
		const result = await jqPlugin.postProcess!(jsonResult, {
			apply: ".data[] | select(.active == true) | .name",
		});
		const lines = result.body.trim().split("\n");
		expect(lines).toEqual(['"a"', '"c"']);
	});

	test("throws when --apply is missing", async () => {
		expect(jqPlugin.postProcess!(jsonResult, {})).rejects.toThrow("--apply");
	});

	test("throws on invalid jq expression", async () => {
		expect(
			jqPlugin.postProcess!(jsonResult, { apply: ".[[invalid" }),
		).rejects.toThrow("jq failed");
	});
});
