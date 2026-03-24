import { createPlugin, type FetchThatResult } from "fetch-that";

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
		result: FetchThatResult,
		opts: Record<string, unknown>,
	): Promise<FetchThatResult> {
		const filter = opts.apply as string | undefined;
		if (!filter) {
			throw new Error("jq plugin requires --apply <filter>");
		}

		const proc = Bun.spawn(["jq", filter], {
			stdin: new Blob([result.body]),
			stdout: "pipe",
			stderr: "pipe",
		});

		const [stdout, stderr, exitCode] = await Promise.all([
			new Response(proc.stdout).text(),
			new Response(proc.stderr).text(),
			proc.exited,
		]);

		if (exitCode !== 0) {
			throw new Error(`jq failed (exit ${exitCode}): ${stderr.trim()}`);
		}

		return { ...result, body: stdout, contentType: "application/json" };
	},
});
