var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    jshint     = require('gulp-jshint'),
    concat     = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),

    input  = {
      'javascript': 'source/javascript/*.js'
    },

    output = {
      'javascript': 'public/javascript'
    };

/* run the watch task when gulp is called without arguments */
gulp.task('default', ['watch']);

/* run javascript through jshint */
gulp.task('jshint', function() {
  return gulp.src(input.javascript)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

/* concat javascript files, minify if --type production */
gulp.task('build-js', function() {
  return gulp.src(input.javascript)
    .pipe(sourcemaps.init())
      .pipe(concat('bundle.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(gutil.env.type === 'production' ? uglify() : uglify()/*gutil.noop()*/)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output.javascript));
});

/* Watch these files for changes and run the task on update */
gulp.task('watch', function() {
  gulp.watch(input.javascript, ['jshint', 'build-js']);
  gulp.watch(input.sass, ['build-css']);
});
