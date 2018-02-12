var validator = require("validator");
var async = require("async");
var sha1 = require("sha1");
var xml = require("xml");
var xml2js = require("xml2js");
var ip = require("ip");
var utilities = require("extra-utilities");
var envelope = require("node-envelope");

var freeDNS = { };

freeDNS.apiAddress = "https://freedns.afraid.org";
freeDNS.interface = "xml";

freeDNS.setup = function(options) {
	var formattedOptions = utilities.formatObject(
		options,
		{
			key: {
				type: "string",
				trim: true,
				nonEmpty: true,
				nullable: false
			},
			userName: {
				type: "string",
				case: "lower",
				trim: true,
				nonEmpty: true,
				nullable: false
			},
			password: {
				type: "string",
				trim: true,
				nonEmpty: true,
				nullable: false
			}
		},
		{
			throwErrors: true,
			removeExtra: true
		}
	);

	if(utilities.isNonEmptyString(formattedOptions.key)) {
		freeDNS.apiKey = formattedOptions.key;
	}
	else {
		if(utilities.isEmptyString(formattedOptions.userName) || utilities.isEmptyString(formattedOptions.password)) {
			throw new Error("Missing FreeDNS API Key and / or user name / password.");
		}
		else {
			freeDNS.apiKey = sha1(formattedOptions.userName + "|" + formattedOptions.password);
		}
	}
};

freeDNS.getValue = function(data) {
	return utilities.isNonEmptyArray(data) ? data[0] : data;
};

freeDNS.getToken = function(data) {
	var value = freeDNS.getValue(data);

	if(utilities.isEmptyString(value)) {
		return null;
	}

	var parts = value.match(/[^?]+/g);

	if(utilities.isEmptyArray(parts) || parts.length !== 2) {
		return null;
	}

	return parts[1];
}

freeDNS.formatResult = function(data) {
	if(typeof data !== "string") {
		return null;
	}

	return data.replace(/[\r\n]+$/, "");
};

freeDNS.isError = function(data) {
	var formattedData = freeDNS.formatResult(data);

	if(formattedData === null) {
		return null;
	}

	return !!formattedData.match(/^error/gi);
};

freeDNS.formatIPV4Address = function(ipAddress, throwErrors) {
	if(typeof ipAddress !== "string") {
		if(throwErrors) {
			throw new Error("IP address must be a string!");
		}

		return null;
	}

	var formattedIPAddress = ipAddress.trim();

	if(formattedIPAddress.length === 0) {
		if(throwErrors) {
			throw new Error("IP address cannot be empty!");
		}

		return null;
	}

	if(!validator.isIP(ipAddress, 4)) {
		if(throwErrors) {
			throw new Error("Invalid IP v4 address!");
		}

		return null;
	}

	return formattedIPAddress;
};

freeDNS.formatHostName = function(hostName, throwErrors) {
	if(typeof hostName !== "string") {
		if(throwErrors) {
			throw new Error("Host name must be a string!");
		}

		return null;
	}

	var formattedHostName = hostName.trim().toLowerCase();

	if(formattedHostName.length === 0) {
		if(throwErrors) {
			throw new Error("Host name cannot be empty!");
		}

		return null;
	}

	return formattedHostName;
};

freeDNS.formatHost = function(host, ipAddress, throwErrors) {
	if(typeof ipAddress === "boolean") {
		throwErrors = ipAddress;
		ipAddress = null;
	}

	if(typeof host === "string") {
		var formattedHostName = freeDNS.formatHostName(host, throwErrors);
		var formattedIPAddress = freeDNS.formatIPV4Address(ipAddress, throwErrors);

		if(formattedHostName === null) {
			if(throwErrors) {
				throw new Error("Missing host name.");
			}

			return null;
		}

		if(formattedIPAddress === null) {
			if(throwErrors) {
				throw new Error("Missing IP address.");
			}

			return null;
		}

		return {
			name: formattedHostName,
			ipAddress: formattedIPAddress
		};
	}
	else if(utilities.isObject(host)) {
		var formattedHostName = freeDNS.formatHostName(host.name, throwErrors);
		var formattedIPAddress = null;

		if(utilities.isValid(host.ipAddress)) {
			formattedIPAddress = freeDNS.formatIPV4Address(host.ipAddress, throwErrors);
		}

		if(utilities.isValid(ipAddress) && (!utilities.isValid(formattedIPAddress) || ip.isPrivate(formattedIPAddress))) {
			formattedIPAddress = freeDNS.formatIPV4Address(ipAddress, throwErrors);
		}

		if(!utilities.isValid(formattedIPAddress)) {
			if(throwErrors) {
				throw new Error("Missing or invalid IP address.");
			}

			return null;
		}

		return {
			name: formattedHostName,
			ipAddress: formattedIPAddress
		};
	}

	if(throwErrors) {
		throw new Error("Invalid host datat type: " + typeof host + " - expected string or object.");
	}

	return null;
};

freeDNS.parseHosts = function(data, includeToken, callback) {
	if(utilities.isFunction(includeToken)) {
		callback = includeToken;
		includeToken = null;
	}

	if(!utilities.isFunction(callback)) {
		throw new Error("Missing callback function!");
	}

	var formattedIncludeToken = utilities.parseBoolean(includeToken);

	if(formattedIncludeToken === null) {
		formattedIncludeToken = false;
	}

	return async.waterfall(
		[
			function(callback) {
				new xml2js.Parser().parseString(
					data,
					function(error, jsonData) {
						if(error) {
							return callback(null, null);
						}

						if(!utilities.isObject(jsonData) || !utilities.isObject(jsonData.xml)) {
							return callback(new Error("Invalid XML host data."));
						}

						var host = null;
						var hosts = jsonData.xml.item;
						var formattedHost = null;
						var formattedHosts = [];

						if(Array.isArray) {
							for(var i=0;i<hosts.length;i++) {
								host = hosts[i];

								formattedHost = {
									name: freeDNS.getValue(host.host),
									ipAddress: freeDNS.getValue(host.address)
								}

								if(formattedIncludeToken) {
									formattedHost.url = freeDNS.getValue(host.url);
									formattedHost.token = freeDNS.getToken(host.url);
								}

								formattedHosts.push(formattedHost);
							}
						}

						return callback(null, formattedHosts);
					}
				);
			},
			function(jsonData, callback) {
				if(jsonData) {
					return callback(null, jsonData);
				}

				if(typeof data !== "string" || data.length === 0) {
					return callback(null, null);
				}

				var hosts = [];
				var line = null;
				var lines = data.split(/\r?\n/g);
				var parts = null;

				for(var i=0;i<lines.length;i++) {
					line = lines[i];

					parts = line.match(/([^|]+)/g);

					if(utilities.isEmptyArray(parts) || parts.length !== 3) {
						return callback(new Error("Invalid host data on line " + (i + 1) + "."));
					}

					hosts.push({
						name: parts[0],
						ipAddress: parts[1],
						url: parts[2]
					});
				}

				return callback(null, hosts);
			}
		],
		function(error, result) {
			if(error) {
				return callback(error);
			}

			return callback(null, result);
		}
	);
};

freeDNS.getHosts = function(includeToken, callback) {
	if(utilities.isFunction(includeToken)) {
		callback = includeToken;
		includeToken = null;
	}

	if(!utilities.isFunction(callback)) {
		throw new Error("Missing callback function!");
	}

	if(utilities.isEmptyString(freeDNS.apiKey)) {
		return callback(new Error("Missing FreeDNS API key."));
	}

	var formattedIncludeToken = utilities.parseBoolean(includeToken);

	if(formattedIncludeToken === null) {
		formattedIncludeToken = false;
	}

	var query = {
		action: "getdyndns",
		sha: freeDNS.apiKey
	};

	if(freeDNS.interface !== "ascii") {
		query.style = freeDNS.interface;
	}

	return envelope.get(
		"api",
		query,
		{
			baseUrl: freeDNS.apiAddress
		},
		function(error, result) {
			if(error) {
				return callback(error);
			}

			return freeDNS.parseHosts(
				result,
				formattedIncludeToken,
				function(error, result) {
					if(error) {
						return callback(error);
					}

					return callback(null, result);
				}
			)
		}
	);
};

freeDNS.updateHosts = function(data, ipAddress, callback) {
	if(utilities.isFunction(ipAddress)) {
		callback = ipAddress;
		ipAddress = null;
	}

	if(!utilities.isFunction(callback)) {
		throw new Error("Missing callback function!");
	}

	if(!utilities.isObject(data)) {
		var error = new Error("Missing or invalid data passed to FreeDNS update function.");
		error.status = 400;
		return callback(error);
	}

	if(utilities.isValid(data.host) && utilities.isValid(data.hosts)) {
		var error = new Error("Both host and host data attributes specified, please specify one or the other.");
		error.status = 400;
		return callback(error);
	}

	if(utilities.isValid(data.hosts) && utilities.isEmptyArray(data.hosts)) {
		var error = new Error("Hosts list cannot be empty.");
		error.status = 400;
		return callback(error);
	}

	if(utilities.isValid(data.ipAddress)) {
		ipAddress = data.ipAddress;
	}

	var host = null;
	var hosts = [];

	if(utilities.isValid(data.host)) {
		try {
			hosts.push(freeDNS.formatHost(data.host, ipAddress, true));
		}
		catch(error) {
			error.status = 400;
			return callback(error);
		}
	}

	if(utilities.isValid(data.hosts)) {
		try {
			for(var i=0;i<data.hosts.length;i++) {
				host = data.hosts[i];

				hosts.push(freeDNS.formatHost(host, ipAddress, true));
			}
		}
		catch(error) {
			error.status = 400;
			return callback(error);
		}
	}

	if(hosts.length === 0) {
		var error = new Error("No host(s) specified!");
		error.status = 400;
		return callback(error);
	}

	var hostData = [];

	for(var i=0;i<hosts.length;i++) {
		host = hosts[i];

		if(ip.isPrivate(host.ipAddress)) {
			var error = new Error("Cannot use private IP address " + host.ipAddress + " for host: " + host.name + ".");
			error.status = 400;
			return callback(error);
		}

		hostData.push({
			item: [
				{ host: host.name },
				{ address: host.ipAddress }
			]
		});
	}

	return async.waterfall(
		[
			function(callback) {
				return freeDNS.getHosts(
					true,
					function(error, currentHosts) {
						if(error) {
							return callback(error);
						}

						return callback(null, currentHosts);
					}
				);
			},
			function(currentHosts, callback) {
				var hostToUpdate = null;
				var currentHost = null;
				var validHostName = null;

				for(var i=0;i<hosts.length;i++) {
					hostToUpdate = hosts[i];
					validHostName = false;

					for(var j=0;j<currentHosts.length;j++) {
						currentHost = currentHosts[j];

						if(hostToUpdate.name === currentHost.name) {
							validHostName = true;

							hostToUpdate.previousIPAddress = currentHost.ipAddress;
							hostToUpdate.url = currentHost.url;
							hostToUpdate.token = currentHost.token;
							hostToUpdate.updated = false;
						}

						break;
					}

					if(!validHostName) {
						var error = new Error("Host name not found: \"" + hostToUpdate.name);
						error.status = 400;
						return callback(error);
					}
				}

				return async.eachSeries(
					hosts,
					function(host, callback) {
						if(host.ipAddress === host.previousIPAddress) {
							return callback();
						}

						return envelope.post(
							"dynamic/update.php?" + host.token,
							xml({
								xml: hostData
							}),
							null,
							{
								baseUrl: freeDNS.apiAddress,
								headers: {
									"Content-Type": "application/xml"
								}
							},
							function(error, result, response) {
								if(error) {
									return callback(error);
								}

								host.updated = response.statusCode === 200 && !freeDNS.isError(result);
								host.message = freeDNS.formatResult(result);

								return callback();
							}
						);
					},
					function(error) {
						if(error) {
							return callback(error);
						}

						return callback(null);
					}
				);
			}
		],
		function(error) {
			if(error) {
				return callback(error);
			}

			return callback(null, hosts);
		}
	);
};

module.exports = freeDNS;
