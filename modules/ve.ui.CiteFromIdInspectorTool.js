( function () {

	/**
	 * MediaWiki UserInterface cite from ID inspector tool.
	 *
	 * @class
	 * @abstract
	 * @extends ve.ui.Tool
	 * @constructor
	 * @param {OO.ui.Toolbar} toolbar
	 * @param {Object} [config] Configuration options
	 */

	// Don't create tool unless the configuration message is present
	try {
		JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	} catch ( e ) {
		return;
	}

	ve.ui.CiteFromIdInspectorTool = function VeUiCiteFromIdInspectorTool( toolGroup, config ) {
		ve.ui.InspectorTool.call( this, toolGroup, config );
	};

	OO.inheritClass( ve.ui.CiteFromIdInspectorTool, ve.ui.InspectorTool );

	ve.ui.CiteFromIdInspectorTool.static.name = 'citefromid';
	ve.ui.CiteFromIdInspectorTool.static.icon = 'ref-cite-web';
	ve.ui.CiteFromIdInspectorTool.static.title = OO.ui.deferMsg( 'citoid-citeFromIDTool-title' );
	ve.ui.CiteFromIdInspectorTool.static.group = 'cite';
	ve.ui.CiteFromIdInspectorTool.static.commandName = 'citefromid';

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'citefromid', 'window', 'open',
			{ args: [ 'citefromid' ], supportedSelections: [ 'linear' ] }
		)
	);

	ve.ui.toolFactory.register( ve.ui.CiteFromIdInspectorTool );

}() );
