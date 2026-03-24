---
name: agent-fetch
description: Use when the user asks to fetch or retrieve information from a URL.
---

## Common interface

When the user asks to fetch or retrieve information from a URL, use this skill to perform the fetch operation. This can be used for various purposes, such as retrieving data, validating information, or exploring APIs.

```bash
npx agent-fetch <URL> --headers "Header-Name: Header-Value" --method GET --attempts 3
```

## Using plugins

### Fetching and applying jq

When the user asks to fetch or retrieve information from a URL and process it with `jq`, use this skill to perform the fetch operation and apply the `jq` filter to the response.

```bash
npx agent-fetch --jq <URL> --apply '.data | map(select(.active == true))'
```

### Fetching infered JSON Schema

When the user asks to fetch or retrieve information from a URL, use this skill to infer the JSON schema of the response. This can help in understanding the structure of the data and how to process it further.

```bash
npx agent-fetch --json-schema <URL>
```

### Fetching HTML converted to Markdown

When the user asks to fetch or retrieve information from a URL, use this skill to convert HTML content to Markdown format. This can be useful for better readability and integration with Markdown-based systems.

```bash
npx agent-fetch --md <URL>
```
