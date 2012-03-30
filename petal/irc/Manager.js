var util = require ("util");

var Petal = require ("../../hub/Petal.js");
var Connection = require ("./Connection.js");

var IRCManager = function (item_manager) {
	var self = this;

	Petal.call (this, item_manager);

	this.connections = [];

	item_manager.command (["lic", "config"], "get", ["IRC"], function(error, values) {
		if (error) {
			console.error ("Could not retrieve configuration");
			return;
		}
		self.config = values[0];
		self.connect ();
	});
};

util.inherits (IRCManager, Petal);

/* This function takes the server profile from the config and extends
 * it with the defaults from the config so that when the defaults
 * change or the server profile changes, it will updated as such
 */
IRCManager.prototype.create_profile = function (profile, defaults) {
	profile.__proto__ = defaults;
	return profile;
};

IRCManager.prototype.connect = function () {
	var connection, profile, servers, defaults;

	servers  = this.config.servers;
	defaults = this.config.default;

	for (var i = 0, len = servers.length; i < len; i++) {

		profile = this.create_profile (servers[i], defaults);
		connection = new Connection (profile, this.item_manager);

		///* The following section is a massive hack, used temporarily as a testing interface.
		connection.on("001", function (message) {
			this.raw ("JOIN #oftn");
			var rl = require("readline");
			var i = rl.createInterface(process.stdin, process.stdout, null);
			i.on("line", function(line) {
				connection.send ("PRIVMSG #oftn :" + line.trim());
				doprmpt();
			});
			doprmpt();
			function doprmpt() {
				i.setPrompt ("<"+connection.nickname+"> ", connection.nickname.length + 3);
				i.prompt ();
			}
		});
		//*/
	
		console.log ("Connecting to IRC server \"%s\"", connection.name);
		connection.connect ();

		this.connections.push (connection);
	}
};

IRCManager.prototype.shutdown = function(callback) {
	var connections, self = this;

	// First we clone the connections array to use as a queue
	connections = this.connections.slice ();
	console.log ("Waiting for servers to close connections...");

	(function next () {
		var c = connections.shift ();
		if (!c) {
			callback.call (self);
			return;
		}
		c.quit (next);
	}) ();
};

module.exports = IRCManager;
