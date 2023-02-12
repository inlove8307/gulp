'use strict';

const del = require('del');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const babel = require('gulp-babel');
const includeHTML = require('gulp-html-tag-include');
const spritesmith = require('gulp.spritesmith.3x');
const browserSync = require('browser-sync').create();

function include(done) {
  del.sync('./dist/html');
  gulp.src(['./src/html/**/*.html', '!./src/html/include/**'])
  .pipe(includeHTML())
  .pipe(gulp.dest('./dist/html'));
  done();
}

function styles(done) {
  del.sync('./dist/css');
  gulp.src('./src/sass/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./dist/css'));
  done();
}

function scripts(done) {
  del.sync('./dist/js');
  gulp.src('./src/js/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('./dist/js'));
  done();
}

function images(done) {
  del.sync('./dist/image');
  gulp.src(['./src/image/**/*.*', '!./src/image/origin/**'])
  .pipe(gulp.dest('./dist/image'));
  done();
}

const spriteFolder = function(spritePath) {
  return fs.readdirSync(spritePath).filter(function(){
    return fs.statSync(path.join(spritePath)).isDirectory();
  });
};

function sprite(done) {
  let data = gulp.src('./src/image/origin/*.*').pipe(spritesmith({
    retinaSrcFilter: './src/image/origin/*@2x.png',
    retinaImgName: 'sprite@2x.png',
    retina3xSrcFilter: './src/image/origin/*@3x.png',
    retina3xImgName: 'sprite@3x.png',
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    padding: 5,
    cssTemplate: "sprite.scss.handlebars"
  }));

  data.img.pipe(gulp.dest('./src/image/sprite'));
  data.css.pipe(gulp.dest('./src/sass/common'));

  // spriteFolder('./src/image/origin/').forEach(function(folder){
  //   data = gulp.src(`./src/image/origin/${folder}/*.*`).pipe(spritesmith({
  //     retinaSrcFilter: './src/image/origin/*@2x.png',
  //     retinaImgName: `sprite${folder}@2x.png`,
  //     retina3xSrcFilter: './src/image/origin/*@3x.png',
  //     retina3xImgName: `sprite${folder}@3x.png`,
  //     imgName: `sprite${folder}.png`,
  //     cssName: `_sprite${folder}.scss`,
  //     padding: 5,
  //     cssTemplate: "sprite.scss.handlebars"
  //   }));

  //   data.img.pipe(gulp.dest('./src/image/sprite'));
  //   data.css.pipe(gulp.dest('./src/sass/common'));
  // });
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
  gulp.watch('./src/image/**/*.*', gulp.parallel(images, browserSyncReload));
}

exports.include = include;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.sprite = sprite;

exports.default = gulp.series(gulp.parallel(include, styles, scripts, images, browserSyncServe, watchTask));