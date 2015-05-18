var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');

// bundler used to run watchify and browserify
var bundler = watchify(browserify(watchify.args, {standalone: 'NUTELLA'}));
// add the lib file to bundle
bundler.add('./src/nutella_lib.js');


gulp.task('bundle', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
    return bundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('nutella_lib.js'))
        .pipe(gulp.dest('./dist'));
}


gulp.task('default', bundle);



