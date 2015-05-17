var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var react = require('gulp-react');
var htmlreplace = require('gulp-html-replace');
var plumber = require('gulp-plumber');

var path = {
  REACT_SRC: ['js/react/src/*.js'],
  REACT_DEST: 'js/react/dist'
};

gulp.task('transform', function(){
  gulp.src(path.REACT_SRC)
      .pipe(plumber())
      .pipe(react())
      .pipe(gulp.dest(path.REACT_DEST));
});

gulp.task('watch', function(){
  gulp.watch(path.REACT_SRC, ['transform']);
});

gulp.task('default', ['transform', 'watch']);