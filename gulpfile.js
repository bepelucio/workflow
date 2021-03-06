var gulp = require('gulp'),
	gutil = require('gulp-util'),
	coffee = require('gulp-coffee'),
	browserify = require('gulp-browserify'),
	compass = require('gulp-compass'),
	connect = require('gulp-connect'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  uglifycss = require('gulp-uglifycss'),
  minifyHTML = require('gulp-minify-html'),
  jsonMinify = require('gulp-json-minify');
  imagemin = require('gulp-imagemin'),
  pngcrush = require('imagemin-pngcrush'),
	concat = require('gulp-concat');

var env,
	coffeeSources,
	jsSources,
	sassSources,
	htmlSources,
	jsonSources,
	sassStyle;

env = process.env.NODE_ENV || 'development';

if(env==='development'){
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
} else {
	outputDir = 'builds/production/';
	sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/*.coffee'];
jsSources = ['components/scripts/*.js'];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + 'js/*.json'];
uglifycss =  [outputDir + 'css/*.css'];

var imagemin = require('gulp-imagemin');
var uglifycss = require('gulp-uglifycss');


gulp.task('coffee', function() {
	gulp.src(coffeeSources)
		.pipe(coffee({ bare: true })
			.on('error', gutil.log))
	.pipe(gulp.dest('components/scripts'))
});

gulp.task('js',function(){
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
		.pipe (gulp.dest(outputDir + 'js'))
		.pipe(connect.reload())
});

 
gulp.task('compressCSS', function () {
  gulp.src(sassSources)
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(gulp.dest(outputDir + 'css'));
});

gulp.task('compressJs', function() {
  return gulp.src('builds/production/js/*.js')
    .pipe(uglify({
      mangle: false,
      compress: true,
      output: { beautify: false }
     }))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(connect.reload())
});

gulp.task('compass', function() {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass',
      image: outputDir + 'images',
      style: sassStyle
    })
    .on('error', gutil.log))
    .pipe(gulp.dest(outputDir + 'css'))
    .pipe(connect.reload())
});

gulp.task('watch', function(){
	gulp.watch(coffeeSources, ['coffee']);
	gulp.watch(jsSources,['js']);
	gulp.watch('components/sass/*.scss', ['compass']);
	gulp.watch('builds/development/*.html',['html']);
	gulp.watch('builds/development/js/*.json',['json']);
  gulp.watch('builds/development/images/**/*.*',['images'])
});

gulp.task('connect', function(){
	connect.server({
		root: outputDir,
		livereload: true
	});
});

gulp.task('html', function(){
	gulp.src('builds/development/*.html')
    .pipe(gulpif(env=== 'production', minifyHTML()))
    .pipe(gulpif(env=== 'production', gulp.dest(outputDir)))
	  .pipe(connect.reload())
});


gulp.task('json', function() {
  return gulp.src('builds/development/js/*.json')
      .pipe(jsonMinify())
      .pipe(gulp.dest('builds/production/js'))
      .pipe(connect.reload())
});

gulp.task('images', function() {
  gulp.src('builds/development/images/**/*.*')
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload())
});
  

gulp.task('default', ['html', 'coffee', 'js', 'json', 'compass', 'images' ,'compressJs', 'compressCSS', 'watch', 'connect'])





