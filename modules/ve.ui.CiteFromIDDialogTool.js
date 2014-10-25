mw.loader.using( 'ext.visualEditor.mwreference', function () {

	/**
	 * MediaWiki UserInterface cite from ID dialog tool.
	 *
	 * @class
	 * @abstract
	 * @extends ve.ui.Tool
	 * @constructor
	 * @param {OO.ui.Toolbar} toolbar
	 * @param {Object} [config] Configuration options
	 */

	//Don't create tool unless the configuration message is present
	try {
		JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	} catch ( e ) {
		return;
	}

	ve.ui.CiteFromIDDialogTool = function VeUiCiteFromIDDialogTool( toolGroup, config ) {
		OO.ui.Tool.call( this, toolGroup, config );
	};

	OO.inheritClass( ve.ui.CiteFromIDDialogTool, ve.ui.Tool );

	ve.ui.CiteFromIDDialogTool.static.name = 'citefromid';
	ve.ui.CiteFromIDDialogTool.static.icon = 'ref-cite-web';
	ve.ui.CiteFromIDDialogTool.static.title = mw.msg( 'citoid-citeFromIDTool-title' );
	ve.ui.CiteFromIDDialogTool.static.group = 'cite';
	ve.ui.CiteFromIDDialogTool.static.commandName = 'citefromid';

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'citefromid', 'window', 'open',
			{ args: ['citefromid'], supportedSelections: ['linear'] }
		)
	);

	ve.ui.toolFactory.register( ve.ui.CiteFromIDDialogTool );

});
