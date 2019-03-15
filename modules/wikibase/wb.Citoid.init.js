/*
 * Lightweight loader for wikibase citoid module
 */

( function ( wb ) {

	var config, citoidUrl, citoidTool, enableTabs, isEditView;

	// Only initialise on entity pages
	mw.hook( 'wikibase.entityPage.entityLoaded' ).add( function () {

		try {
			config = JSON.parse( mw.message( 'citoid-wikibase-config.json' ).plain() );
			citoidUrl = mw.config.get( 'wgCitoidConfig' ).wbFullRestbaseUrl;
			enableTabs = mw.config.get( 'wbRefTabsEnabled' );
			isEditView = mw.config.get( 'wbIsEditView' );
		} catch ( e ) {
			return;
		}

		if ( enableTabs && citoidUrl && config.zoteroProperties && isEditView ) {
			// Load required modules; wikibase.datamodel doesn't get registered until too late otherwise
			mw.loader.using( [ 'ext.citoid.wikibase', 'wikibase.datamodel', 'dataValues' ] ).then( function () {
				citoidTool = new wb.CitoidTool( config );
				citoidTool.init();
			} );
		}

	} );

}( wikibase ) );
