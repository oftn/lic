"use strict";

var HubConfig      = require ("./HubConfig.js");
var Server         = require ("./Server.js");
var LicProvider    = require ("./LicProvider.js");
var EventManager   = require ("./EventManager.js");
var CommandManager = require ("./CommandManager.js");

var Hub = function () {
	this.managers        = [];
	this.event_manager   = new EventManager ();
	this.command_manager = new CommandManager ();
	this.lic_provider    = new LicProvider (this);
};

/**
 * Hub.prototype.init():
 * This is the main entry-point for the hub.
 *
 * It starts by loading the config file.
 **/
Hub.prototype.init = function () {

	var self = this;

	this.config = new HubConfig (this.event_manager);

	this.config.load (function () {
		self.start_server ()
		self.command_manager.providers["lic"] = this.lic_provider.respond;
	});

};

/**
 * Hub.prototype.start_server():
 * This opens up a local socket and applies listeners.
 **/
Hub.prototype.start_server = function () {
	/*
	console.log ("Starting up hub server");

	this.server = new Server (this.config);
	this.server.listen ();
	*/
};

Hub.prototype.shutdown = function () {

	console.log ("Shutting down");

	// Tell each petal to disconnect
	var num = this.managers.length;
	this.petals.forEach (function (petal) {
		petal.disconnect (function() {
			num--;
			if (!num) {
				exit();
			}
		});
	});

	setTimeout (function () { exit () }, 5000); // Exit forcefully if 5 s pass.

	// Final termination code
	function exit () {
		//this.server.close ();
		process.exit ();
	}
};

module.exports = Hub;
