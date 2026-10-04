# Panasch

Small structured logger for Node.js. It wraps [pino](https://getpino.io/) for JSON log lines by default, with optional pretty printing and OpenTelemetry trace fields.

## Install (local package)

This repo is not published under the Panasch name yet. Install from a checkout:

```bash
git clone https://github.com/ikrishg/panasch.git
cd panasch
yarn install && yarn build
```

In another project:

```bash
yarn add file:/path/to/panasch
# or
npm install /path/to/panasch
```

The npm package name in `package.json` is still `trevenant` until a release is published.

## Usage

```js
const { Panasch } = require('trevenant')

const log = new Panasch()

log.info('server started')
log.success('job finished')
log.warn({ userId: 'abc' }, 'rate limited')
log.error(new Error('connection reset'))
```

### Options

```js
const log = new Panasch({
  level: 'debug',
  pretty: true, // human-readable instead of JSON
  otel: true,   // add trace_id / span_id when @opentelemetry/api is installed
})
```

`otel` stays off unless you set it to `true`. When enabled, install `@opentelemetry/api` in your app and run your usual OpenTelemetry SDK setup; Panasch only adds span context to each log line.

## API

| Method    | Level  | Notes                          |
| --------- | ------ | ------------------------------ |
| `debug`   | debug  |                                |
| `info`    | info   |                                |
| `success` | info   | adds `"success": true` in JSON |
| `warn`    | warn   |                                |
| `error`   | error  | accepts `Error` objects        |
| `fatal`   | fatal  | accepts `Error` objects        |

All methods return the logger instance for chaining.

`Trevenant` is exported as an alias of `Panasch` for older imports.

## License

MIT
