'use strict';

const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const babel = require('gulp-babel');
const includeHTML = require('gulp-html-tag-include');
const browserSync = require('browser-sync').create();

function clean(done) {
  del.sync('./dist');
  done();
}

function include(done) {
  gulp.src('./src/html/*.html')
  .pipe(includeHTML())
  .pipe(gulp.dest('./dist/html'));
  done();
}

function styles(done) {
  gulp.src('./src/sass/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./dist/css'));
  done();
}

function scripts(done) {
  gulp.src('./src/js/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('./dist/js'));
  done();
}

function browserSyncServe(done) {
  browserSync.init({
    server: {
      baseDir: './dist',
      directory: true
    }
  });
  done();
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function watchTask() {
  gulp.watch('./src/html/**/*.html', gulp.parallel(include, browserSyncReload));
  gulp.watch('./src/sass/**/*.scss', gulp.parallel(styles, browserSyncReload));
  gulp.watch('./src/js/**/*.js', gulp.parallel(scripts, browserSyncReload));
}

exports.default = gulp.series(clean, gulp.parallel(include, styles, scripts, browserSyncServe, watchTask));