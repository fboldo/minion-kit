import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

const toolDescriptors = [];

export default definePluginEntry({
	id: "minion-fetch",
	name: "minion-fetch",
	description: "Adds a portable minion-fetch command for URL fetching and response transforms.",
	register(api) {
		for (const tool of toolDescriptors) {
			const registration = {
				name: tool.name,
				description: tool.description,
				parameters: tool.parameters,
				async execute(_id, params) {
					return createPendingToolResult(tool.name, params);
				},
			};

			if (tool.optional) {
				api.registerTool(registration, { optional: true });
			} else {
				api.registerTool(registration);
			}
		}
	},
});

function createPendingToolResult(toolName, params) {
	return {
		content: [
			{
				type: "text",
				text: `OIAP tool ${toolName} is declared for this OpenClaw plugin, but the native runtime handler has not been generated yet.`,
			},
		],
		details: {
			oiap: {
				pluginId: "minion-fetch",
				status: "pending-runtime",
				toolName,
				params,
			},
		},
	};
}
