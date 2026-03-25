/** Describes the HTTP request to be executed, including plugin-specific options. */
export interface AgentFetchRequest {
	url: string;
	method: string;
	headers: Record<string, string>;
	body?: string;
	attempts: number;
	pluginOptions: Record<string, unknown>;
}

/** The response returned after fetching and optional post-processing by plugins. */
export interface AgentFetchResult {
	status: number;
	headers: Record<string, string>;
	contentType: string;
	body: string;
}

/** Defines an extra CLI option that a plugin contributes to `minion-fetch --help`. */
export interface PluginOptionDef {
	flags: string;
	description: string;
	defaultValue?: unknown;
}

/** Contract every composable plugin must implement to participate in the pipeline. */
export interface AgentFetchPlugin {
	/** Unique identifier, e.g. "jq" */
	id: string;
	/** Human-readable name shown in --help */
	name: string;
	/** One-line description for the --help plugin section */
	description: string;
	/** CLI flag that enables the plugin, e.g. "--jq" */
	enableFlag: string;
	/** Extra CLI options this plugin introduces */
	options: PluginOptionDef[];
	/** Mutate the request before fetch (e.g. set headers) */
	preProcess?: (
		request: AgentFetchRequest,
		opts: Record<string, unknown>,
	) => Promise<AgentFetchRequest>;
	/** Transform the result after fetch */
	postProcess?: (
		result: AgentFetchResult,
		opts: Record<string, unknown>,
	) => Promise<AgentFetchResult>;
}

/** Identity factory that returns the plugin definition unchanged — gives a single place to validate or enrich plugins in the future. */
export function createPlugin(def: AgentFetchPlugin): AgentFetchPlugin {
	return def;
}

/** Performs the HTTP fetch with automatic retry and exponential back-off. */
export async function executeFetch(
	request: AgentFetchRequest,
): Promise<AgentFetchResult> {
	for (let attempt = 1; attempt <= request.attempts; attempt++) {
		try {
			const init: RequestInit = {
				method: request.method,
				headers: request.headers,
			};
			if (request.body) {
				init.body = request.body;
			}
			const response = await fetch(request.url, init);
			const body = await response.text();
			const contentType = response.headers.get("content-type") ?? "";
			const headers: Record<string, string> = {};
			response.headers.forEach((value, key) => {
				headers[key] = value;
			});
			return { status: response.status, headers, contentType, body };
		} catch (error) {
			if (attempt >= request.attempts) {
				throw error;
			}
			await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
		}
	}

	throw new Error("unreachable");
}

/** Runs the full plugin pipeline: pre-process hooks → fetch → post-process hooks. */
export async function runPipeline(
	request: AgentFetchRequest,
	plugins: AgentFetchPlugin[],
	enabledPluginIds: Set<string>,
): Promise<AgentFetchResult> {
	const active = plugins.filter((p) => enabledPluginIds.has(p.id));

	const req = await active.reduce(
		async (acc, plugin) =>
			plugin.preProcess
				? plugin.preProcess(await acc, (await acc).pluginOptions)
				: acc,
		Promise.resolve(request),
	);

	const initialResult = await executeFetch(req);

	const result = await active.reduce(
		async (acc, plugin) =>
			plugin.postProcess
				? plugin.postProcess(await acc, req.pluginOptions)
				: acc,
		Promise.resolve(initialResult),
	);

	return result;
}
