import { jqPlugin } from "fetch-jq";
import { jsonSchemaPlugin } from "fetch-json-schema";
import { mdPlugin } from "fetch-md";
import type { FetchThatPlugin } from "./index.ts";

export const builtinPlugins: FetchThatPlugin[] = [
	jqPlugin,
	jsonSchemaPlugin,
	mdPlugin,
];
