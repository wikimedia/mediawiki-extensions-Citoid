( function ( wb ) {

	'use strict';

	function CitoidLanguageConverter() {
		this.monolingualCodes = null;
		this.contentCodes = null;
		this.init();
	}

	CitoidLanguageConverter.prototype.init = function () {
		var self = this;
		this.service = new mw.Api();

		// Cache multilingual codes
		this.service
			.get( {
				action: 'query',
				format: 'json',
				meta: 'wbcontentlanguages',
				formatversion: '2',
				wbclcontext: 'monolingualtext'
			} )
			.then( function ( results ) {
				if ( results && results.query && results.query.wbcontentlanguages ) {
					self.monolingualCodes = results.query.wbcontentlanguages;
				}
			} );

		// Cache content language codes
		this.service
			.get( {
				action: 'query',
				format: 'json',
				meta: 'wbcontentlanguages',
				formatversion: '2',
				wbclcontext: 'term'
			} )
			.then( function ( results ) {
				if ( results && results.query && results.query.wbcontentlanguages ) {
					self.contentCodes = results.query.wbcontentlanguages;
				}
			} );
	};

	// Common to getContentCode and getMonolingualCode
	function getCode( value, cachedCodes, defaultCode ) {
		var code,
			getCodeFallback = function ( code ) {
				code = code.split( '-' );
				code = code[ 0 ];
				return code;
			};

		if ( !value ) {
			return defaultCode;
		}

		if ( !cachedCodes ) {
			return defaultCode;
		}

		value = value.toLowerCase();
		code = cachedCodes[ value ];

		if ( !code ) {
			code = getCodeFallback( value );
			code = cachedCodes[ code ];
			if ( !code ) {
				return defaultCode;
			}
		}
		code = code.code;
		return code;
	}

	// Get valid codes for multilingual text
	CitoidLanguageConverter.prototype.getMonolingualCode = function ( value ) {
		return getCode( value, this.monolingualCodes, 'und' );
	};

	// Get valid codes for content languages i.e. labels and desc
	CitoidLanguageConverter.prototype.getContentCode = function ( value ) {
		return getCode( value, this.contentCodes, 'en' );
	};

	wb.CitoidLanguageConverter = CitoidLanguageConverter;

}( wikibase ) );
