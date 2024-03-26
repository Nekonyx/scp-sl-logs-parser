# scp-sl-logs-parser

> #### The project is currently in the stage of active development. Extracting possible log types and processing them can be quite resource-intensive, as Northwood created these logs for both non-human and non-machine users.

### Notice

- Minimum supported game version: 11.0
- Node.js 18 or newer is required.
- Deno/bun/browser environments may be supported, but I doesn't target them.

## Installation

Node.js:

```sh
npm i scp-sl-logs-parser
```

Deno/Browser:

```js
import { parse, parseFile } from 'https://esm.sh/scp-sl-logs-parser'
```

## Usage

### Parse single line

```ts
import { parse } from 'scp-sl-logs-parser'

parse(
  '2021-11-15 14:34:14.981 +03:00 | Internal | Logger | Started logging. Game version: 11.0.0, private beta: NO.'
)
```

### Parse whole log file

```ts
import { readFileSync } from 'node:fs'
import { parseFile } from 'scp-sl-logs-parser'

parseFile(readFileSync('log.txt'))
```
