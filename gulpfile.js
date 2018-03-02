const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const scp = require('gulp-scp2');
const fs = require('fs');
const SSH = require('gulp-ssh');
const path = require('path');

const webpackStream = require('webpack-stream');
const named = require('vinyl-named');

const webpack = webpackStream.webpack;
// const pug = require('gulp-pug');

gulp.task('deploy', () =>
  gulp
    .src(['{backend,frontend,public}/**/*.*', 'package.json', 'run.sh'])
    .pipe(
      scp({
        host: 'antler24.ru',
        port: 20531,
        username: 'git',
        // password: 'git205317',
        publicKey: fs.readFileSync('../../.ssh/id_rsa.pub', 'UTF-8'),
        privateKey: fs.readFileSync('../../.ssh/id_rsa', 'UTF-8'),
        dest: 'ovpn-stat'
      })
    )
    .on('error', err => {
      console.log(err);
    })
);

gulp.task('sass', () =>
  gulp
    .src('./frontend/scss/**/*.scss')
    .pipe(
      sass({
        includePaths: ['./node_modules/bootstrap/scss', 'frontend/scss']
      }).on('error', sass.logError)
    )
    .pipe(gulp.dest('./public/css'))
);

gulp.task('clean', () => del(['public']));

gulp.task('webpack', () => {
  const options = {
    watch: true,
    devtool: 'cheap-module-inline-source-map',
    module: {
      loaders: [
        {
          test: /\.js&/,
          include: path.join(__dirname, 'frontend'),
          loader: 'babel?presets[]=es2015'
        }
      ]
    },
    plugins: [new webpack.NoErrorsPlugin()]
  };
  return gulp
    .src('frontend/js/**/*.js')
    .pipe(named())
    .pipe(webpackStream(options))
    .pipe(gulp.dest('public/js'));
});

gulp.task('build', gulp.series('clean', 'sass'));

gulp.task('browser-sync', () => {
  browserSync.init(null, {
    proxy: 'http://localhost:80',
    port: 7000
  });
  browserSync.watch('public/**/*.*').on('change', browserSync.reload);
  // browserSync.watch('backend/views/**/*.pug').on('change', browserSync.reload);
  // browserSync.watch('backend/**/*.js').on('change', () => {
  //   ndstream.emit('restart');
  // });
});
gulp.task('nodemon', () => {
  nodemon({ script: 'backend/app.js', watch: '/backend/', ext: 'js json pug' }).on(
    'restart',
    browserSync.reload
  );
});
gulp.task('dev', gulp.parallel('nodemon', 'browser-sync'));

// gulp.task('views', () =>
//   gulp
//     .src('backend/views/partial/*.pug')
//     .pipe(pug())
//     .pipe(gulp.dest('public')),
// );
