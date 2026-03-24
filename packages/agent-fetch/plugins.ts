import { jqPlugin } from "fetch-jq";
import { jsonSchemaPlugin } from "fetch-json-schema";
import { mdPlugin } from "fetch-md";
import type { AgentFetchPlugin } from "./index.ts";

export const builtinPlugins: AgentFetchPlugin[] = [
	jqPlugin,
	jsonSchemaPlugin,
	mdPlugin,
];
