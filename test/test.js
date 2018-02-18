global.utilities = undefined;

var freeDNS = require("../dist/free-dns.js");
var utilities = require("extra-utilities");
var chai = require("chai");
var expect = chai.expect;

describe("Free DNS", function() {
	describe("setup", function() {
		it("should be a function", function() {
			expect(freeDNS.setup instanceof Function).to.equal(true);
		});
	});

	describe("getHosts", function() {
		it("should be a function", function() {
			expect(freeDNS.getHosts instanceof Function).to.equal(true);
		});
	});

	describe("updateHosts", function() {
		it("should be a function", function() {
			expect(freeDNS.updateHosts instanceof Function).to.equal(true);
		});
	});
});
