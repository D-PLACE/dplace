// Karma configuration
// Generated on Wed Jan 27 2016 22:21:49 GMT+0000 (UTC)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'dplace_app',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
        'static/bower_components/angular/angular.min.js',
        'static/bower_components/angular-resource/angular-resource.min.js',
        'static/bower_components/angular-route/angular-route.min.js',
        'static/bower_components/angular-mocks/angular-mocks.js',
        'static/bower_components/d3/d3.js',
        'static/bower_components/jquery/dist/jquery.js',
        'static/js/app.js',
        'static/js/controllers/app.js',
        'static/js/controllers/*.js',
        'static/js/models.js',
        'static/js/colorMapService.js',
        'static/js/searchModelService.js',
        'static/js/services.js',
        'static/js/filters.js',
        'static/js/directives.js',
        'static/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.min.js',
        'static/js/controllers/search/*.js',
        'tests/data/js/*.json',
        'tests/*.js'
		
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     preprocessors: { 'static/js/*.js': ['coverage'], 'static/js/controllers/*.js': ['coverage'], 'static/js/controllers/search/*.js': ['coverage'], 'tests/data/js/*.json': ['json_fixtures'] },
	jsonFixturesPreprocessor: {
		stripPrefix: 'tests/data/js/',
		camelizeFilenames: true
	},
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],
    
    coverageReporter: {
        reporters: [
            {type: 'lcovonly', subdir: '.'},
        ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: false,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
