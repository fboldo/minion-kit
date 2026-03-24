import { execFile } from "node:child_process";
import { type AgentFetchResult, createPlugin } from "agent-fetch";

/** Runs jq as a child process, piping input via stdin. */
function runJq(
	filter: string,
	input: string,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
	return new Promise((resolve) => {
		const child = execFile("jq", [filter], (error, stdout, stderr) => {
			resolve({
				stdout,
				stderr,
				exitCode: error?.code ? 1 : (child.exitCode ?? 0),
			});
		});
		child.stdin?.end(input);
	});
}

export const jqPlugin = createPlugin({
	id: "jq",
	name: "jq",
	description: "Apply a jq filter to the JSON response",
	enableFlag: "--jq",
	options: [
		{
			flags: "--apply <filter>",
			description: "jq filter expression to apply",
		},
	],
	async postProcess(
		result: AgentFetchResult,
		opts: Record<string, unknown>,
	): Promise<AgentFetchResult> {
		const filter = opts.apply as string | undefined;
		if (!filter) {
			throw new Error("jq plugin requires --apply <filter>");
		}

		const { stdout, stderr, exitCode } = await runJq(filter, result.body);

		if (exitCode !== 0) {
			throw new Error(`jq failed (exit ${exitCode}): ${stderr.trim()}`);
		}

		return { ...result, body: stdout, contentType: "application/json" };
	},
});
