var Petal = function(item_manager, connection) {
	this.item_manager = item_manager;
	this.hub_connection = connection;
};

Petal.prototype.id = "petal";
Petal.prototype.name = "Unnamed";
Petal.prototype.item_manager = null;

/**
 * Petal#shutdown:
 * This function is called by the hub when it is requested
 * to shutdown. The hub will terminate once each petal calls
 * the callback.
 *
 * It's important not to access the ItemManager while petals
 * are shutting down because the hub freezes them before
 * calling the shutdown functions.
 *
 * Default behavior is to immediately call callback.
 **/
Petal.prototype.shutdown = function (callback) {
	if (callback) {
		callback.call (this);
	}
};

/**
 * Petal#local_quit:
 * This function can be called by the petal, to shut down cleanly, without killing the hub.
 **/
Petal.prototype.local_quit = function (callback) {
	var self = this;
	this.shutdown(function() {
		if (self.hub_connection) {
			self.hub_connection.end();
			// unregister? code on the other side will also do that
		}
		if (callback) {
			callback.apply(self, arguments);
		}
	});
};

/**
  * Petal#is_separate:
  * This function returns true when the petal is not running inside the hub.
  **/
Petal.prototype.is_separate = function () {
	return !!this.hub_connection;
};

/**
  * Petal.register:
  * for now, this function connects to the hub over the default interface, and registers with it.
  **/

Petal.register = function (Constructor) {
	var dnode = require("dnode");
	var conn = dnode.connect("/tmp/lic.sock");
	conn.on('remote', function(remote) {
		var p = new Constructor(remote.item_manager, conn);
		remote.register({shutdown: p.shutdown.bind(p)});
	});
};

module.exports = Petal;
