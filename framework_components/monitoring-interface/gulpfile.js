var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var react = require('gulp-react');
var htmlreplace = require('gulp-html-replace');
var plumber = require('gulp-plumber');

var path = {
  HTML: 'index.html',
  ALL: ['js/react/src/*.js', 'index.html'],
  JS: ['js/react/src/*.js'],
  MINIFIED_OUT: 'build.min.js',
  DEST_SRC: 'js/react/dist',
  DEST_BUILD: 'js/react/dist',
  DEST: 'dist'
};

gulp.task('transform', function(){
  gulp.src(path.JS)
      .pipe(plumber())
      .pipe(react())
      .pipe(gulp.dest(path.DEST_SRC));
});

gulp.task('watch', function(){
  gulp.watch(path.ALL, ['transform']);
});

gulp.task('default', ['transform','watch']);