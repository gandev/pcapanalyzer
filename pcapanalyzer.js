if (Meteor.isClient) {
  Template.capturing.helpers({
    packets: function () {
      return PCAP._packets.find();
    },
    capturingClass: function() {
      return PCAP.capturing.get() ? {'style':'background-color: red;'}: '';
    }
  });

  Template.capturing.events({
    'click #start_capturing': function (evt, tmpl) {
      var iface = tmpl.$('#pcap_interface').val();
      var filter = tmpl.$('#pcap_filter').val() || '';

      Meteor.call('pcap/startCapturing', iface, filter);
    },
    'click #stop_capturing': function() {
      Meteor.call('pcap/stopCapturing');
    },
    'click .captured-packet': function() {
      console.log(this);
    }
  });
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
