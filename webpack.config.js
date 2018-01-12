const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
// const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {

	entry: './src/brax-editable.js',

	// devtool: 'source-map',

	// watch: true,

	module: {

		rules: [

			{ 

				test: /\.js$/,

				exclude: /(node_modules|bower_components)/,

				use: {

					loader: "babel-loader",
				
					options: {
						presets: [
							// 'env'
							'@babel/preset-env'
						]
					}

				}

			}

		]
		
	},

	output: {
		
		filename: 'brax-editable.js',
		
		path: path.resolve(__dirname, 'js'),
	   
		libraryTarget: 'umd'

	},

	resolve: {
		modules: [
			"node_modules",
			path.resolve(__dirname, "js")
		]
	},

	plugins: [
		
		// new MinifyPlugin( )
		
		new UglifyJSPlugin()
		
		//new UglifyJSPlugin({
			// minimize: true,
			// sourceMap: true
		//})
		

	]
	

};
