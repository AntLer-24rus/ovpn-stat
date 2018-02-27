const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
// const pug = require('gulp-pug');

let ndstream;
gulp.task('browser-sync', () => {
  browserSync.init(null, {
    proxy: 'http://localhost:80',
    port: 7000,
  });
  browserSync.watch('backend/views/**/*.pug').on('change', browserSync.reload);
  browserSync.watch('backend/**/*.js').on('change', () => {
    ndstream.emit('restart');
  });
});
gulp.task('nodemon', () => {
  ndstream = nodemon({ script: 'backend/app.js', watch: '/backend/', ext: 'js json' });
  ndstream.on('restart', browserSync.reload);
});
gulp.task('dev', gulp.parallel('nodemon', 'browser-sync'));

// gulp.task('views', () =>
//   gulp
//     .src('backend/views/partial/*.pug')
//     .pipe(pug())
//     .pipe(gulp.dest('public')),
// );
