( function () {
	// Don't create tool unless the configuration message is present
	try {
		JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	} catch ( e ) {
		return;
	}

	// HACK: Find the position of the current citation toolbar definition
	// and manipulate it.
	var i, len, originalDefinition,
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
			originalDefinition = ve.copy( toolGroups[i] );
			// Remove the label, since we only need a downward-arrow indicator
			delete originalDefinition.label;
			break;
		}
	}

	// HACK: Replace the previous cite group to represent citoid and the
	// dropdown menu for cite tools.
	ve.init.mw.Target.static.toolbarGroups[ citeIndex ] = {
		header: OO.ui.deferMsg( 'visualeditor-toolbar-cite-group' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-cite-group-tooltip' ),
		include: [ 'citefromid', 'moreCiteTool' ]
	};

	/**
	 * MediaWiki UserInterface citation tool group
	 *
	 * @class
	 * @extends OO.ui.ToolGroupTool
	 * @constructor
	 * @param {OO.ui.ToolGroup} toolGroup
	 * @param {Object} [config] Configuration options
	 */
	ve.ui.MoreCiteTool = function VeUiMoreCiteTool( toolGroup, config ) {
		OO.ui.ToolGroupTool.call( this, toolGroup, config );
	};
	OO.inheritClass( ve.ui.MoreCiteTool, OO.ui.ToolGroupTool );
	ve.ui.MoreCiteTool.static.autoAddToCatchall = false;
	ve.ui.MoreCiteTool.static.name = 'moreCiteTool';
	ve.ui.MoreCiteTool.static.group = 'citeTools';
	ve.ui.MoreCiteTool.static.title =
		OO.ui.deferMsg( 'visualeditor-toolbar-cite-tooltip' );
	ve.ui.MoreCiteTool.static.groupConfig = originalDefinition;
	ve.ui.toolFactory.register( ve.ui.MoreCiteTool );

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
	ve.ui.CiteFromIdInspectorTool.static.icon = 'reference';
	ve.ui.CiteFromIdInspectorTool.static.title = OO.ui.deferMsg( 'citoid-citeFromIDTool-title' );
	ve.ui.CiteFromIdInspectorTool.static.label = OO.ui.deferMsg( 'citoid-citeFromIDTool-title' );
	ve.ui.CiteFromIdInspectorTool.static.group = 'cite';
	ve.ui.CiteFromIdInspectorTool.static.commandName = 'citefromid';

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'citefromid', 'window', 'open',
			{ args: [ 'citefromid' ], supportedSelections: [ 'linear' ] }
		)
	);

	ve.ui.sequenceRegistry.register(
		new ve.ui.Sequence( 'wikitextRef', 'citefromid', '<ref', 4 )
	);

	ve.ui.toolFactory.register( ve.ui.CiteFromIdInspectorTool );

}() );
