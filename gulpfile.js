'use strict';

const gulp = require('gulp');
var gutil = require('gulp-util');
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cssBase64 = require('gulp-css-base64');
var rename = require('gulp-rename');
const path = require('path');
const notify = require('gulp-notify');
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const del = require('del');
const cache = require('gulp-cache');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const runSequence = require('run-sequence');
const htmlmin = require('gulp-htmlmin');
const merge = require('merge-stream');
var replace = require('gulp-replace');
require('dotenv').config();
var webserver = require('gulp-webserver');

var nodeEnv = process.env.NODE_ENV;

nodeEnv = (nodeEnv === 'prod' || nodeEnv === 'production') ? 'production' : nodeEnv;
nodeEnv = (nodeEnv === 'dev' || nodeEnv === 'development') ? 'development' : nodeEnv;
nodeEnv = (nodeEnv === 'stage' || nodeEnv === 'staging') ? 'staging' : nodeEnv;
nodeEnv = (nodeEnv === 'demo') ? 'demo' : nodeEnv;
nodeEnv = (nodeEnv === 'localhost') ? 'localhost' : nodeEnv;

nodeEnv = (nodeEnv === null || nodeEnv === undefined)
  ? 'development' : nodeEnv;


gulp.task('sass', function () {
  return gulp.src('./src/scss/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      errLogToConsole: false,
      paths: [ path.join(__dirname, 'scss', 'includes') ]
    })
    .on("error", notify.onError(function(error) {
      return "Failed to Compile SCSS: " + error.message;
    })))
    .pipe(cssBase64())
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./src/css/'))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(notify("SCSS Compiled Successfully :)"));
});


gulp.task('environment-setup', function (done) {
    gulp.src(`./src/js/util/config/${nodeEnv}.js`)
        .pipe(rename('environment.js'))
        .pipe(gulp.dest('./src/js/factories/'))
        .on('error', gutil.log)
        .on('end', done);
});

gulp.task('jsmin', function() {
    return gulp.src(['./src/js/**/*.js'])
        // .pipe(uglify())
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('jsonmin', function() {
  return gulp.src(['./src/js/**/*.json'])
      // .pipe(uglify())
      .pipe(gulp.dest('./dist/js/'));
});

gulp.task('htmlmin', function() {

    var indexOutput = gulp.src('./src/index.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist/'));

    var partialsOutput = gulp.src('./src/partials/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist/partials/'));

    var partialsInclude = gulp.src('./src/partials/**/*.html')
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('./dist/partials/'));

    return merge(indexOutput, partialsOutput, partialsInclude);

});

gulp.task('imagemin', function (){
    return gulp.src('./src/img/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(cache(imagemin({
          interlaced: true,
          verbose: true,
        })))
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('browserSync', function() {
  browserSync({
      server: {
          baseDir: './src/'
      },
      port: 5000,
      ui: {
          port: 5001
      }
  })
});

gulp.task('vendor', function() {

    var graphOutput = gulp.src('./src/js/vendor/**/*')
        .pipe(gulp.dest('./dist/js/vendor'));

    return merge(graphOutput);

});

gulp.task('graph', function() {

  var graphOutput = gulp.src('./src/graph/**/*')
      .pipe(gulp.dest('./dist/graph'));

  return merge(graphOutput);

});

gulp.task('watch', ['environment-setup', 'browserSync'], function () {
    gulp.watch('./src/scss/**/*', ['sass']);
    gulp.watch('./src/js/controllers/*.js').on('change', browserSync.reload);
    gulp.watch('./src/**/*.html').on('change', browserSync.reload);
});

gulp.task('clean', function() {
    del('dist');
});

gulp.task('replaceGtmKey', function() {
    gulp.src(['./dist/index.html'])
      .pipe(replace('gtmKey', process.env.GTM_KEY))
      .pipe(gulp.dest('./dist/'))
});

gulp.task('serve', function () {
  return gulp.src(['./dist/'])
  .pipe(webserver({
      host: 'localhost',
      port: 3000,
      open: true,
      fallback: './dist/index.html'
  }));
});

gulp.task('default', ['sass', 'watch']);

gulp.task('build', function() {
    runSequence('clean', 'sass', 'imagemin', 'htmlmin', 'replaceGtmKey', 'environment-setup', 'jsmin', 'jsonmin', 'vendor', 'graph');
});
