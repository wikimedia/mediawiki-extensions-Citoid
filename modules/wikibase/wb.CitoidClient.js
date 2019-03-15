( function ( wb ) {

	'use strict';

	function CitoidClient() {

	}

	CitoidClient.prototype.search = function ( value ) {
		var baseUrl = mw.config.get( 'wgCitoidConfig' ).wbFullRestbaseUrl,
			version = 'v1/data/citation',
			format = 'mediawiki-basefields',
			url = baseUrl + version + '/' + format + '/' + encodeURIComponent( value );

		return $.ajax( {
			timeout: 3000, // TODO: increase
			method: 'GET',
			url: url
		} );
	};

	wb.CitoidClient = CitoidClient;

}( wikibase ) );
