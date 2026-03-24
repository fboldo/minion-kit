import { type AgentFetchResult, createPlugin } from "agent-fetch";
import { NodeHtmlMarkdown } from "node-html-markdown";

export const mdPlugin = createPlugin({
	id: "md",
	name: "md",
	description: "Convert an HTML response to Markdown",
	enableFlag: "--md",
	options: [],
	async postProcess(result: AgentFetchResult): Promise<AgentFetchResult> {
		const isHtml =
			result.contentType.includes("text/html") ||
			result.body.trimStart().startsWith("<");
		if (!isHtml) {
			throw new Error(
				"md plugin requires an HTML response (got content-type: " +
					`${result.contentType || "unknown"})`,
			);
		}
		const markdown = NodeHtmlMarkdown.translate(result.body);
		return { ...result, body: markdown, contentType: "text/markdown" };
	},
});
