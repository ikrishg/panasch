<!-- markdownlint-disable-next-line -->
<div align="center"><img height="100px" width="100px" src="https://github.com/krshkun/trevenant/raw/main/.github/assets/trevenant.png"><br><h1>Trevenant</h1><h5>Beautiful Opinionated Logging for Node.js ✍️</h5></div>

## 🤓 Benefits

- [x] **Beautiful** - Beautifully formatted logs with colors and symbols
- [x] **Error Handling** - Error handling with stack traces
- [x] **Readable** - Readable logs with proper indentation

## ❓ Why do I use a logger?

Default logging is not very readable. It's hard to distinguish between different log levels and it's hard to read the stack trace. Trevenant fixes this by providing a beautiful and readable logging experience.

`console.log` just dumps the data to the console. Trevenant provides a structured logging experience by providing a consistent format for all the logs.

## 🌟 Installation

There are various ways to install trevenant. Like package managers, content delivery networks, local copies...

### 📦 Package Managers

#### 💝 **NPM** ![Npm Downloads](https://img.shields.io/npm/dt/trevenant?style=flat-square)

```bash
npm install trevenant
```

#### 🐱**Yarn** ![Yarn Downloads](https://img.shields.io/npm/dt/trevenant?style=flat-square)

```bash
yarn add trevenant
```

## ✨ Usage

Trevenant is a simple logger. It provides a simple API to log messages.

```js
const { Trevenant } = require('trevenant')

const logger = new Trevenant()

logger.info('Hello World!')

// Other log levels

logger.debug('Hello World!')
logger.success('Hello World!')
logger.warn('Hello World!')
logger.error('Hello World!')
logger.fatal(new Error('Errrorrilla'))
```

## 📞 We're Ready To Support

* [ ] Discord server (Coming Soon)
* [x] [GitHub discussions](https://github.com/krshkun/trevenant/discussions)
* [x] [Bug handler](https://github.com/krshkun/trevenant/issues)

## ❤ Thanks to our supporters

[![GitHub Stargazers](https://reporoster.com/stars/krshkun/trevenant)](https://github.com/krshkun/trevenant/stargazers)
