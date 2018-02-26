const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('dev', () => {
  nodemon({
    script: 'backend/app.js',
    watch: '/backend/',
    ext: 'js json'
  });
});
