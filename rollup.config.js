// import base from './rollup.base.config'
import babel from 'rollup-plugin-babel'
import sass from 'rollup-plugin-sass'
import babili from 'rollup-plugin-babili'
// import postcss from 'postcss'
import css from 'rollup-plugin-css-only'
// import autoprefixer from 'autoprefixer'
// import cssnano from 'cssnano'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {

	output: {

		format: 'umd',
		
		// format: 'iife',

		file: './js/brax-editable.min.js',

		name: 'BraxEditable'

	},

	moduleName: 'BraxEditable',

	entry: './src/brax-editable.js',

	external: ['tippy'],

	plugins: [
		
		sass({
			output: './js/brax-editable.min.css',
			// processor: css => postcss([autoprefixer, cssnano])
			// .process(css)
			// .then(result => result.css)
		}),

		// css({ output: false }),

		babel({
			presets: ['es2015-rollup'],
			plugins: ['transform-object-rest-spread', 'transform-object-assign'],
			// exclude: 'node_modules/**',
		}),

		babili({
			comments: false
		}),

		commonjs({
			namedExports: {
				'node_modules/tippy.js/dist/tippy.js': ['tippy']
			}
		}),

		resolve({
			browser: true
		})

	]
}