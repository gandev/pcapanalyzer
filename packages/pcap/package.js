Package.describe({
  summary: "pcap",
  version: "0.1.0"
});

Npm.depends({
	'pcap': '1.2.0'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3-rc5');

  api.use('mongo');
  api.use('tracker');
  api.use('session');
  api.use('reactive-var');

  api.addFiles('pcap.js');

  api.export('PCAP');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('pcap');
  api.addFiles('pcap-tests.js');
});
