const gulp = require('gulp');
const webpack = require('webpack-stream');
// const gutil = require("gulp-util");
// const exec = require('child_process').exec;
// const spawn = require('child_process').spawn;
const sass = require('gulp-sass');

// var WebpackDevServer = require("webpack-dev-server");

var WebpackConfig = require("./webpack.config.js");

// var WebpackDev = require("./webpack.dev.js");

// var WebpackProd = require("./webpack.prod.js");


gulp.task('css', function(){
	
	return gulp.src('./src/brax-editable.scss')
		.pipe(
			
			sass({
				outputStyle: 'compressed'
			})
			.on('error', sass.logError)

		)
		.pipe( gulp.dest('./css/') );

});


gulp.task('js', function(){
	
	return gulp.src('./src/brax-editable.js').pipe(
		webpack( WebpackConfig )
	).pipe(
		gulp.dest('./js/')
	);

});

gulp.task('default', [ 'css', 'js' ]);