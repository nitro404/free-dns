# FreeDNS

[![NPM version][npm-version-image]][npm-url]
[![Build Status][build-status-image]][build-status-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Downloads][npm-downloads-image]][npm-url]

A wrapper for the FreeDNS API.

This module is unofficial and is in no way associated with [FreeDNS](https://freedns.afraid.org).

## Server-Side Usage

```javascript
var freeDNS = require("free-dns");

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

[npm-url]: https://www.npmjs.com/package/free-dns
[npm-version-image]: https://img.shields.io/npm/v/free-dns.svg
[npm-downloads-image]: http://img.shields.io/npm/dm/free-dns.svg

[build-status-url]: https://travis-ci.org/nitro404/free-dns
[build-status-image]: https://travis-ci.org/nitro404/free-dns.svg?branch=master

[coverage-url]: https://coveralls.io/github/nitro404/free-dns?branch=master
[coverage-image]: https://coveralls.io/repos/github/nitro404/free-dns/badge.svg?branch=master

[snyk-url]: https://snyk.io/test/github/nitro404/free-dns?targetFile=package.json
[snyk-image]: https://snyk.io/test/github/nitro404/free-dns/badge.svg?targetFile=package.json
