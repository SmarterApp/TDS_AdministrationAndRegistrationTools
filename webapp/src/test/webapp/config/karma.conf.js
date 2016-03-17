var srcHome = '../../main/webapp/resources/';

module.exports = function(config) {
	config.set({

		basePath : '../',

		frameworks : [ 'jasmine' ],

		files : [ srcHome + 'vendor/JSON/json2.js',
				srcHome + 'vendor/image_upload/jquery-1.10.1.min.js',
				srcHome + 'vendor/angular/*.js',

				srcHome + 'vendor/image_upload/jquery.ui.widget.js',
				srcHome + 'vendor/image_upload/jquery.iframe-transport.js',
				srcHome + 'vendor/image_upload/jquery.fileupload.js',
				srcHome + 'vendor/image_upload/jquery.fileupload-process.js',

				srcHome + 'vendor/image_upload/blueimp/*.js',
				srcHome + 'vendor/image_upload/addons/*.js',

				srcHome + 'progman/js/progman.js',
				srcHome + 'progman/js/controllers/*.js',
				srcHome + 'progman/js/directives/*.js',
				srcHome + 'progman/js/services/*.js',
				srcHome + 'jasmine/spec/*.js' ],

		singleRun : true,
		autoWatch : false,
		// browsers = ['PhantomJS','Chrome','IE'];
		browsers : [ 'PhantomJS' ],
		reporters : [ 'dots', 'junit', 'coverage' ],

		junitReporter : {
			outputFile : 'karma-test-results.xml'
		},

		coverageReporter : {
			type : 'html',
			dir : 'coverage/'
		},

	});
};