const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {

	entry: './src/brax-editable.js',

	devtool: 'none',

	watch: true,

	module: {

		rules: [

			{ 

				test: /\.js$/,

				exclude: /(node_modules|bower_components)/,

				use: {

					loader: "babel-loader",
				
					options: {
						presets: [
							'env'
							// '@babel/preset-env'
						]
					}

				}

			}

		]
		
	},

	output: {
		
		filename: 'brax-editable.js',
		
		path: path.resolve(__dirname, 'js'),
		
		// library: 'Brax',
	   
		libraryTarget: 'umd'

		// libraryTarget: { root:'_' }

	},

	resolve: {
		modules: [
			"node_modules",
			// path.resolve(__dirname, "js/riot"),
			path.resolve(__dirname, "js")
			// path.resolve(__dirname, "templates"),
		]
	},

	plugins: [

		new UglifyJSPlugin({
			minimize: true
		})	

	]
	

};
