var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');

gulp.task('scss', function(){
  return gulp.src('solution/scss/**/*.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(gulp.dest('solution/css'))
    .pipe(browserSync.stream())
});

gulp.task('browserSync', function() {
    browserSync.init({
      server: {
          baseDir: "solution/"
      }
  });
});

gulp.task('default', ['scss','browserSync'], function(){
  gulp.watch('solution/scss/**/*.scss', ['scss']);
  gulp.watch("solution/*.html").on('change', browserSync.reload);
  gulp.watch("solution/js/*.js").on('change', browserSync.reload);
  gulp.watch("solution/img/*.*").on('change', browserSync.reload);
});
