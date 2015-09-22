( function () {
	var i, j, jLen, toolGroups, citeIndex, target;

	// Don't create tool unless the configuration message is present
	try {
		JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	} catch ( e ) {
		// Temporary hack for T93800
		try {
			JSON.parse( mw.message( 'citoid-template-type-map-backup.json' ).plain() );
		} catch ( e2 ) {
			return;
		}
	}

	// HACK: Find the position of the current citation toolbar definition
	// and manipulate it.

	for ( i in ve.init.mw ) {
		target = ve.init.mw[ i ];
		if ( !target || !( target.prototype instanceof ve.init.Target ) ) {
			continue;
		}
		toolGroups = target.static.toolbarGroups;
		citeIndex = toolGroups.length;
		// Instead of using the rigid position of the group,
		// downgrade this hack from horrific to somewhat less horrific by
		// looking through the object to find what we actually need
		// to replace. This way, if toolbarGroups are changed in VE code
		// we won't have to manually change the index here.
		for ( j = 0, jLen = toolGroups.length; j < jLen; j++ ) {
			if ( ve.getProp( toolGroups[ j ], 'include', 0 ) === 'citefromid' ) {
				citeIndex = -1;
				break;
			}
			if ( ve.getProp( toolGroups[ j ], 'include', 0, 'group' ) === 'cite' ) {
				citeIndex = j;
				break;
			}
		}

		// HACK: Replace the previous cite group with the citoid tool.
		if ( citeIndex !== -1 ) {
			toolGroups[ citeIndex ] = { include: [ 'citefromid' ] };
		}
	}

	/**
	 * MediaWiki UserInterface cite from ID inspector tool.
	 *
	 * @class
	 * @abstract
	 * @extends ve.ui.Tool
	 * @constructor
	 * @param {OO.ui.ToolGroup} toolGroup
	 * @param {Object} [config] Configuration options
	 */
	ve.ui.CiteFromIdInspectorTool = function VeUiCiteFromIdInspectorTool() {
		ve.ui.CiteFromIdInspectorTool.super.apply( this, arguments );
		ve.ui.MWEducationPopupTool.call( this, {
			title: ve.msg( 'visualeditor-dialogbutton-citation-educationpopup-title' ),
			text: ve.msg( 'visualeditor-dialogbutton-citation-educationpopup-text' )
		} );
	};

	OO.inheritClass( ve.ui.CiteFromIdInspectorTool, ve.ui.InspectorTool );
	OO.mixinClass( ve.ui.CiteFromIdInspectorTool, ve.ui.MWEducationPopupTool );

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
