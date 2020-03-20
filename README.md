# FreeDNS

[![NPM version][npm-version-image]][npm-url]
[![Build Status][build-status-image]][build-status-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Known Vulnerabilities][vulnerabilities-image]][vulnerabilities-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![Downloads][npm-downloads-image]][npm-url]
[![Install Size][install-size-image]][install-size-url]
[![Contributors][contributors-image]][contributors-url]
[![Pull Requests Welcome][pull-requests-image]][pull-requests-url]

A wrapper for the FreeDNS API.

This module is unofficial and is in no way associated with [FreeDNS](https://freedns.afraid.org).

## Server-Side Usage

```javascript
const freeDNS = require("free-dns");

freeDNS.setup({
	userName: "nitro404",
	password: "p4ssw0rd"
});

freeDNS.updateHosts(
	{
		host: "nitro404.freedns.org",
		ipAddress: "64.230.32.69"
	},
	function(error, hosts) {
		if(error) {
			return console.error(error);
		}

		return console.log(hosts);
	}
);
```

## Installation

To install this module:
```bash
npm install free-dns
```

## Building

To build the distribution files for this module:
```bash
npm run build
```
or
```bash
gulp build
```

[npm-url]: https://www.npmjs.com/package/free-dns
[npm-version-image]: https://img.shields.io/npm/v/free-dns.svg
[npm-downloads-image]: http://img.shields.io/npm/dm/free-dns.svg

[build-status-url]: https://travis-ci.org/nitro404/free-dns
[build-status-image]: https://travis-ci.org/nitro404/free-dns.svg?branch=master

[coverage-url]: https://coveralls.io/github/nitro404/free-dns?branch=master
[coverage-image]: https://coveralls.io/repos/github/nitro404/free-dns/badge.svg?branch=master

[vulnerabilities-url]: https://snyk.io/test/github/nitro404/free-dns?targetFile=package.json
[vulnerabilities-image]: https://snyk.io/test/github/nitro404/free-dns/badge.svg?targetFile=package.json

[dependencies-url]: https://david-dm.org/nitro404/free-dns
[dependencies-image]: https://img.shields.io/david/nitro404/free-dns.svg

[install-size-url]: https://packagephobia.now.sh/result?p=free-dns
[install-size-image]: https://badgen.net/packagephobia/install/free-dns

[contributors-url]: https://github.com/nitro404/free-dns/graphs/contributors
[contributors-image]: https://img.shields.io/github/contributors/nitro404/free-dns.svg

[pull-requests-url]: https://github.com/nitro404/free-dns/pulls
[pull-requests-image]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
