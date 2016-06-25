var gulp = require('gulp');
var watchify = require('watchify');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gutil = require('gulp-util');
var path = require('path');
var livereload = require('gulp-livereload');

var root_dir = path.basename(path.join(__dirname, '/'));
var port = 35729;
var reload_delay = 0;
var livereload_started = false;

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
	'js-cookie',
	'underscore',
];

var sassTask = function (options) {
	if (options.development) {
		if (!livereload_started) {
			console.log("Livereload Port: %s", port);
			livereload_started = true;
			livereload({start: true, port: port});
		}

		var run = function (event) {
			var start = new Date();

			if (event)
				console.log("(Rebuilding SASS bundle) %s: %s", event.type, event.path);
			else
				console.log('Building SASS bundle');
			
			gulp.src(options.src)
				.pipe(sass().on('error', sass.logError))
				.pipe(gulp.dest(options.dest))
				.pipe(notify(function (event) {
					// Reload the site - give the server time to update
					setTimeout(function() {
						livereload.changed(event);
					}, reload_delay);

					console.log('SASS bundle built in ' + (Date.now() - start) + 'ms');
				}
			));
		};

		run();
	
		gulp.watch(options.src, run);
	} 
	else {
		gulp.src(options.src)
			.pipe(sass().on('error', sass.logError))
			.pipe(cssmin())
			.pipe(gulp.dest(options.dest));	 
	}
}


var viewsTask = function (options) {
	if (options.development) {
		var run = function (event) {
			var start = new Date();

			if (event)
				console.log("(Updating Views) %s: %s", event.type, event.path);
			else
				console.log('Watching Views');
			
			setTimeout(function() {
				livereload.changed(event);
				console.log('Views updated in ' + (Date.now() - start) + 'ms');
			}, reload_delay);
		};

		run();
	
		gulp.watch(options.src, run);
	} 
}


var jsTask = function (options) {
	if (options.development) {
		var run = function (event) {
			var start = new Date();

			if (event)
				console.log("(Rebuilding JS) %s: %s", event.type, event.path);
			else
				console.log('Building JS');
			
			gulp.src(options.src)
				.pipe(concat('main.js'))
				// .pipe(uglify())
				.pipe(gulp.dest(options.dest))
				.pipe(notify(function (event) {
					// Reload the site - give the server time to update
					setTimeout(function() {
						livereload.changed(event);
					}, reload_delay);

					console.log('JS built in ' + (Date.now() - start) + 'ms');
				}
			));
		};

		run();
	
		gulp.watch(options.src, run);
	} 
	else {
		gulp.src(options.src)
			.pipe(concat('main.js'))
			.pipe(uglify())
			.pipe(gulp.dest(options.dest));	 
	}
}

var allTask = function (dev) {
	if (!dev)
		process.env.NODE_ENV = 'production';
	
	return function() {
		viewsTask({
			development: dev,
			src: ['./**/*.html'],
		});

		jsTask({
			development: dev,
			src: './resources/js/**/*.js',
			dest: './public/js',
		});

		sassTask({
			development: dev,
			src: ['./resources/sass/**/*.scss'], 
			dest: './public/css'
		});
	}
};


// Starts our development workflow
gulp.task('default', allTask(true));
