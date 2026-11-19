'use strict';

const { defineConfig, globalIgnores } = require( 'eslint/config' );
const wikimedia = require( 'eslint-config-wikimedia/flat' );

// Directories with their own config, which other configs don't apply to.
// These were directories with `"root": true` in .eslintrc.json.
const rootDirs = {
	modules: [ 'modules/**' ]
};

module.exports = defineConfig( [
	globalIgnores( [
		// Upstream code
		'lib/*',
		'lib/*/',
		'!lib/foreign-resources.*',

		// Build
		'vendor/',
		'docs/',

		// Language files written automatically by TranslateWiki
		'**/i18n/**/*.json',
		'!**/i18n/**/en.json',
		'!**/i18n/**/qqq.json'
	] ),

	// Gruntfile.js, etc.
	{
		ignores: Object.values( rootDirs ).flat(),
		extends: [ wikimedia( 'server' ) ]
	},

	// Code which runs in MediaWiki
	{
		files: rootDirs.modules,
		extends: [ wikimedia( 'client', 'jquery', 'mediawiki' ) ],
		rules: {
			'max-len': 'off'
		}
	},
	{
		files: [ 'modules/ve/**' ],
		languageOptions: {
			globals: {
				ve: 'readonly'
			}
		},
		rules: {
			'mediawiki/no-unlabeled-buttonwidget': 'warn'
		}
	},
	{
		files: [ 'modules/ve/tests/**' ],
		extends: [ wikimedia( 'qunit' ) ]
	},
	{
		files: [ 'modules/wikibase/**' ],
		languageOptions: {
			globals: {
				wikibase: 'readonly',
				dataValues: 'readonly'
			}
		},
		rules: {
			'no-jquery/no-jquery-ui': 'warn'
		}
	},
	{
		// After the wikimedia configs, which set sourceType to 'script'
		files: rootDirs.modules,
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				global: 'readonly'
			}
		}
	}
] );
