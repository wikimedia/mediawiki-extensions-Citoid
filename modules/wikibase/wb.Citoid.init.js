/*
 * Lightweight loader for wikibase citoid module
 */

( function () {

	// Only initialise on entity pages
	mw.hook( 'wikibase.entityPage.entityLoaded' ).add( () => {

		let config, enabled;

		try {
			config = JSON.parse( require( './data.json' ).toolConfig );
			enabled =
				config.zoteroProperties &&
				mw.config.get( 'wgCitoidConfig' ).wbFullRestbaseUrl &&
				mw.config.get( 'wbRefTabsEnabled' ) &&
				mw.config.get( 'wbIsEditView' );
		} catch ( e ) {
			return;
		}

		if ( enabled ) {
			// Load required modules; wikibase.datamodel doesn't get registered until too late otherwise
			mw.loader.using( [ 'ext.citoid.wikibase', 'wikibase.datamodel', 'dataValues' ] ).then( () => {
				const citoidTool = new wikibase.CitoidTool( config );
				citoidTool.init();
			} );
		}

	} );

}() );
