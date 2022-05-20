/**
 * MediaWiki UserInterface cite from ID inspector tool.
 *
 * @class
 * @abstract
 * @extends ve.ui.FragmentInspectorTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.CitoidInspectorTool = function VeUiCitoidInspectorTool() {
	var educationPopup;

	// Parent constructor
	ve.ui.CitoidInspectorTool.super.apply( this, arguments );

	// For backwards compatibility with on-wiki gadgets (T219512)
	this.$element.addClass( 'oo-ui-tool-name-citefromid' );

	educationPopup = new ve.ui.MWEducationPopupWidget( this.$link, {
		popupTitle: ve.msg( 'cite-ve-dialogbutton-citation-educationpopup-title' ),
		popupText: mw.message( 'cite-ve-dialogbutton-citation-educationpopup-text' ).parseDom(),
		popupImage: 'cite',
		trackingName: 'citoid'
	} );

	this.$link.after( educationPopup.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.CitoidInspectorTool, ve.ui.FragmentInspectorTool );

/* Static properties */

ve.ui.CitoidInspectorTool.static.name = 'citoid';
ve.ui.CitoidInspectorTool.static.title = OO.ui.deferMsg(
	mw.config.get( 'wgCiteVisualEditorOtherGroup' ) ?
		'citoid-citoidtool-title-othergroup' :
		'citoid-citoidtool-title'
);
ve.ui.CitoidInspectorTool.static.icon = 'quotes';
ve.ui.CitoidInspectorTool.static.narrowConfig = {
	title: null
};
ve.ui.CitoidInspectorTool.static.displayBothIconAndLabel = true;
ve.ui.CitoidInspectorTool.static.group = 'cite';
ve.ui.CitoidInspectorTool.static.commandName = 'citoid';

/* Registration */

ve.ui.toolFactory.register( ve.ui.CitoidInspectorTool );
