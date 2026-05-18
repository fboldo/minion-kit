---
name: "minion-fetch"
description: "Fetch a URL with minion-fetch and optionally apply jq, JSON Schema, or Markdown transforms."
user-invocable: true
---

# minion-fetch

Fetch a URL with minion-fetch and optionally apply jq, JSON Schema, or Markdown transforms.

# minion-fetch command

Use this command when the user wants to fetch a URL or transform the fetched
content.

- Prefer `minion-fetch` if it is already available on `PATH`.
- Otherwise use `npx minion-fetch`.
- If neither is available, tell the user that `minion-fetch` is not installed.

Build the command from the user's request:

- Start with `<executable> <url>`.
- Add `--method <method>` only when the user asks for something other than the
  default `GET`.
- Add repeated `--headers "Name: Value"` arguments for custom headers.
- Add `--attempts <number>` only when the user explicitly wants retries.
- Add `--jq --apply '<filter>'` to filter JSON responses. The `jq` binary must
  already be installed on the machine.
- Add `--json-schema` to infer a schema from a JSON response.
- Add `--md` to convert an HTML response to Markdown.

Operating rules:

- Ask for the URL if the request does not include one.
- Do not invent headers, jq filters, request bodies, or retry counts.
- Run the fetch once per request unless the user asks for another variation.
- Report HTTP failures, missing tools, or malformed headers directly.
- When the output is long, return a concise summary and offer the full body.

- /minion-fetch https://example.com

- /minion-fetch https://api.example.com/users --jq --apply '.users[] | select(.active)'