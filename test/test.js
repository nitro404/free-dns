"use strict";

global.utilities = undefined;

const freeDNS = require("../src/free-dns.js");
const utilities = require("extra-utilities");
const chai = require("chai");
const expect = chai.expect;

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
