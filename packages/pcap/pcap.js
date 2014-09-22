PCAP = {};

PCAP._packets = new Mongo.Collection('pcap_captured_packets');

if(Meteor.isClient) {
	PCAP._stats = new Mongo.Collection('pcap_capturing_stats');

	PCAP.capturing = new ReactiveVar(false);

	Session.setDefault('pcap_captured_packets_limit', 10);

	Tracker.autorun(function() {
		Meteor.subscribe('pcap_captured_packets_with_limit', Session.get('pcap_captured_packets_limit'));
	});

	Meteor.subscribe('pcap_capturing_stats');

	PCAP._stats.find().observe({
		added: function(doc) {
			PCAP.capturing.set(doc.isCapturing);
		},
		changed: function(newDoc) {
			PCAP.capturing.set(newDoc.isCapturing);
		}
	});
}

if(Meteor.isServer) {
	var pcap = Npm.require('pcap');

	PCAP.limit = 10; //default limit

	PCAP.startCapturing = function(iface, filter) {
		PCAP.stopCapturing();

		PCAP._pcapSession = pcap.createSession(iface, filter);

		var newPacket = Meteor.bindEnvironment(function(raw_packet) {
			var packet = pcap.decode.packet(raw_packet);

			PCAP._packets.insert(packet);
		}, function(err) {
			console.log(err);
		});

		PCAP._pcapSession.on('packet', newPacket);	
	};

	PCAP.isCapturing = function() {
		return !!(PCAP._pcapSession && PCAP._pcapSession.opened)
	};

	PCAP.stopCapturing = function() {
		if(PCAP.isCapturing()) {
			PCAP._pcapSession.close();
		}
	};

	Meteor.methods({
		'pcap/startCapturing': function(iface, filter) {
			check(iface, String);
			check(filter, String);

			//TODO not here
			PCAP._packets.remove({});


			PCAP.startCapturing(iface, filter)
		},
		'pcap/stopCapturing': function() {
			PCAP.stopCapturing();
		}
	});

	Meteor.publish('pcap_captured_packets_with_limit', function(limit) {
		check(limit, Number);

		PCAP.limit = limit > 0 ? limit: PCAP.limit;

		return PCAP._packets.find({}, {sort: {'pcap_header.time_ms': -1}, limit: limit});
	});

	Meteor.publish('pcap_capturing_stats', function() {
		var self = this;

		Meteor.setInterval(function() {
			self.changed('pcap_capturing_stats', 'stats1', {isCapturing: PCAP.isCapturing()});
		}, 1000);

		self.added('pcap_capturing_stats', 'stats1', {isCapturing: PCAP.isCapturing()});
		self.ready();
	});

	//PCAP.startCapturing('eth0', 'ip proto \\tcp');
}


