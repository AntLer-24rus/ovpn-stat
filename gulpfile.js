const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const scp = require('gulp-scp2');
const fs = require('fs');

const path = require('path');

const webpackStream = require('webpack-stream');
const named = require('vinyl-named');

gulp.task(
    'deploy',
    () =>
        gulp.src(['{backend,frontend,public}/**/*.*', 'package.json', 'run.sh'])
            .pipe(scp({
              host: 'antler24.ru',
              port: 20531,
              username: 'git',
              // password: 'git205317',
              publicKey: fs.readFileSync('../../.ssh/id_rsa.pub', 'UTF-8'),
              privateKey: fs.readFileSync('../../.ssh/id_rsa', 'UTF-8'),
              dest: 'ovpn-stat'
            }))
            .on('error', err => {
              global.console.log(err);
            }));

gulp.task(
    'pug',
    () => gulp.src('./backend/views/**/*.pug')
              .pipe(pug({pretty: true}))
              .pipe(gulp.dest('./public/html')));

gulp.task(
    'sass',
    () => gulp.src('./frontend/scss/**/*.scss')
              .pipe(sass({
                      includePaths: [
                        './node_modules/bootstrap/scss',
                        './node_modules/font-awesome/scss', 'frontend/scss'
                      ]
                    }).on('error', sass.logError))
              .pipe(gulp.dest('./public/css')));

gulp.task('clean', () => del(['public']));

gulp.task(
    'fonts',
    () => gulp.src('./node_modules/font-awesome/fonts/*')
              .pipe(gulp.dest('public/fonts')))

gulp.task(
    'images',
    ()=> gulp.src('./frontend/images/*.*')
    .pipe(gulp.dest('public/images'))
)

gulp.task('webpack', () => {
  const options = {
    // watch: true,
    devtool: 'cheap-module-inline-source-map',
    module: {
      rules: [{
        test: /\.js$/,
        include: path.join(__dirname, 'frontend'),
        loader: 'babel-loader?presets[]=babel-preset-env'
      }]
    },
    plugins: [
      new webpackStream.webpack.NoEmitOnErrorsPlugin(),
      // new webpackStream.webpack.ProvidePlugin({
      //   $: 'jquery/dist/jquery.min.js',
      //   'window.$': 'jquery/dist/jquery.min.js'
      // })
    ]
  };
  return gulp.src('frontend/js/**/*.js')
      .pipe(named())
      .pipe(webpackStream(options))
      .pipe(gulp.dest('public/js'));
});

gulp.task(
    'build', gulp.series('clean', 'fonts', 'images', gulp.parallel('sass', 'webpack')));



gulp.task('browser-sync', () => {
  browserSync.init(null, {proxy: 'http://localhost:80', port: 7000});
  browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});
gulp.task('nodemon', () => {
  nodemon({
    script: 'backend/app.js',
    watch: '/backend/',
    ext: 'js json pug',
    env: {NODE_ENV: 'development'}
  }).on('restart', browserSync.reload);
});
gulp.task(
    'dev', gulp.series('build', gulp.parallel('nodemon', 'browser-sync', () => {
      gulp.watch('./frontend/scss/**/*.scss', gulp.series('sass'));
      gulp.watch('./frontend/js/**/*.js', gulp.series('webpack'));
    })));
