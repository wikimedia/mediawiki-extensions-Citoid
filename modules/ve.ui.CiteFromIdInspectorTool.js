/**
 * MediaWiki UserInterface cite from ID inspector tool.
 *
 * @class
 * @abstract
 * @extends ve.ui.FragmentInspectorTool
 * @mixins ve.ui.MWEducationPopupTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.CiteFromIdInspectorTool = function VeUiCiteFromIdInspectorTool() {
	// Parent constructor
	ve.ui.CiteFromIdInspectorTool.super.apply( this, arguments );

	// Mixin constructor
	ve.ui.MWEducationPopupTool.call( this, {
		title: ve.msg( 'cite-ve-dialogbutton-citation-educationpopup-title' ),
		text: ve.msg( 'cite-ve-dialogbutton-citation-educationpopup-text' )
	} );
};

/* Inheritance */

OO.inheritClass( ve.ui.CiteFromIdInspectorTool, ve.ui.FragmentInspectorTool );

OO.mixinClass( ve.ui.CiteFromIdInspectorTool, ve.ui.MWEducationPopupTool );

/* Static properties */

ve.ui.CiteFromIdInspectorTool.static.name = 'citefromid';
ve.ui.CiteFromIdInspectorTool.static.autoAddToCatchall = false;
ve.ui.CiteFromIdInspectorTool.static.title = OO.ui.deferMsg(
	mw.config.get( 'wgCiteVisualEditorOtherGroup' ) ?
		'citoid-citefromidtool-title-othergroup' :
		'citoid-citefromidtool-title'
);
ve.ui.CiteFromIdInspectorTool.static.label = ve.ui.CiteFromIdInspectorTool.static.title;
ve.ui.CiteFromIdInspectorTool.static.icon = 'quotes';
ve.ui.CiteFromIdInspectorTool.static.displayBothIconAndLabel = true;
ve.ui.CiteFromIdInspectorTool.static.group = 'cite';
ve.ui.CiteFromIdInspectorTool.static.commandName = 'citefromid';

/* Registration */

ve.ui.toolFactory.register( ve.ui.CiteFromIdInspectorTool );

/* Command */

ve.ui.commandRegistry.register(
	new ve.ui.Command(
		'citefromid', 'citoid', 'open', { supportedSelections: [ 'linear' ] }
	)
);

/* Sequence */

ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextRef', 'citefromid', '<ref', 4 )
);

