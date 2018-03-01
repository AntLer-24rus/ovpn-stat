const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const scp = require('gulp-scp2');
const fs = require('fs');
const SSH = require('gulp-ssh');
// const pug = require('gulp-pug');

const ssh = new SSH({
  ignoreErrors: true,
  sshConfig: {
    host: 'antler24.ru',
    port: 20531,
    username: 'git',
    privateKey: fs.readFileSync('../../.ssh/id_rsa')
  }
});

gulp.task('ssh', () =>
  ssh.exec(['cd ovpn-stat && chmod +x run.sh && ./run.sh']).on('ssh2Data', arg => {
    console.log('result: ' + arg);
  })
);

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

let ndstream;
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
  ndstream = nodemon({ script: 'backend/app.js', watch: '/backend/', ext: 'js json pug' });
  ndstream.on('restart', browserSync.reload);
});
gulp.task('dev', gulp.parallel('nodemon', 'browser-sync'));

// gulp.task('views', () =>
//   gulp
//     .src('backend/views/partial/*.pug')
//     .pipe(pug())
//     .pipe(gulp.dest('public')),
// );
