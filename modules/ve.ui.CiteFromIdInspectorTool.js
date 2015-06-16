( function () {
	// Don't create tool unless the configuration message is present
	try {
		JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	} catch ( e ) {
		return;
	}

	// HACK: Find the position of the current citation toolbar definition
	// and manipulate it.
	var i, len,
		toolGroups = ve.init.mw.Target.static.toolbarGroups,
		citeIndex = toolGroups.length;

	// Instead of using the rigid position of the group,
	// downgrade this hack from horrific to somewhat less horrific by
	// looking through the object to find what we actually need
	// to replace. This way, if toolbarGroups are changed in VE code
	// we won't have to manually change the index here.
	for ( i = 0, len = toolGroups.length; i < len; i++ ) {
		if ( ve.getProp( toolGroups[i], 'include', 0, 'group' ) === 'cite' ) {
			citeIndex = i;
			break;
		}
	}

	// HACK: Replace the previous cite group with the citoid tool.
	ve.init.mw.Target.static.toolbarGroups[ citeIndex ] = { include: [ 'citefromid' ] };

	// HACK: Replace the 'Basic' tool title now that it lives in the 'insert' toolgroup
	ve.ui.MWReferenceDialogTool.static.title = OO.ui.deferMsg( 'citoid-dialogbutton-reference-full-tooltip' );

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
	ve.ui.CiteFromIdInspectorTool = function VeUiCiteFromIdInspectorTool( toolGroup, config ) {
		ve.ui.InspectorTool.call( this, toolGroup, config );
	};

	OO.inheritClass( ve.ui.CiteFromIdInspectorTool, ve.ui.InspectorTool );

	ve.ui.CiteFromIdInspectorTool.static.name = 'citefromid';
	ve.ui.CiteFromIdInspectorTool.static.autoAddToCatchall = false;
	ve.ui.CiteFromIdInspectorTool.static.title = OO.ui.deferMsg( 'citoid-citefromidtool-title' );
	ve.ui.CiteFromIdInspectorTool.static.label = OO.ui.deferMsg( 'citoid-citefromidtool-title' );
	ve.ui.CiteFromIdInspectorTool.static.icon = 'quotes';
	ve.ui.CiteFromIdInspectorTool.static.displayBothIconAndLabel = true;
	ve.ui.CiteFromIdInspectorTool.static.group = 'cite';
	ve.ui.CiteFromIdInspectorTool.static.commandName = 'citefromid';

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'citefromid', 'citoid', 'open', { supportedSelections: [ 'linear' ] }
		)
	);

	ve.ui.sequenceRegistry.register(
		new ve.ui.Sequence( 'wikitextRef', 'citefromid', '<ref', 4 )
	);

	ve.ui.toolFactory.register( ve.ui.CiteFromIdInspectorTool );

}() );
