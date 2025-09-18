( function ( wb ) {

	'use strict';

	function CitoidClient() {

	}

	CitoidClient.prototype.search = function ( value ) {
		const citoidConfig = mw.config.get( 'wgCitoidConfig' );
		const format = 'mediawiki-basefields';
		let baseUrl;

		// phab: T361576 Deprecate wbFullRestbaseUrl as of 1.45; temporarily include both for backwards compatibility
		if ( citoidConfig.wbFullRestbaseUrl ) {
			baseUrl = citoidConfig.wbFullRestbaseUrl + 'v1/data/citation';
		} else {
			baseUrl = citoidConfig.citoidServiceUrl;
		}

		const url = baseUrl + '/' + format + '/' + encodeURIComponent( value );

		return $.ajax( {
			timeout: 30000,
			method: 'GET',
			url: url
		} );
	};

	wb.CitoidClient = CitoidClient;

}( wikibase ) );
