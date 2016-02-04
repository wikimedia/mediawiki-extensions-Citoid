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

	targetLoader:
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
				continue targetLoader;
			}
			if ( ve.getProp( toolGroups[ j ], 'include', 0, 'group' ) === 'cite' ) {
				citeIndex = j;
				break;
			}
		}

		// Replace the previous cite group with the citoid tool.
		toolGroups[ citeIndex ] = { include: [ 'citefromid' ] };
	}

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
	ve.ui.CiteFromIdInspectorTool = function VeUiCiteFromIdInspectorTool() {
		ve.ui.CiteFromIdInspectorTool.super.apply( this, arguments );
		ve.ui.MWEducationPopupTool.call( this, {
			title: ve.msg( 'visualeditor-dialogbutton-citation-educationpopup-title' ),
			text: ve.msg( 'visualeditor-dialogbutton-citation-educationpopup-text' )
		} );
	};

	OO.inheritClass( ve.ui.CiteFromIdInspectorTool, ve.ui.FragmentInspectorTool );
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

	/**
	 * HACK: Override MWReferenceContextItem methods directly instead of inheriting,
	 * as the context relies on the generated citation types (ref, book, ...) inheriting
	 * directly from MWReferenceContextItem.
	 *
	 * This should be a subclass, e.g. CitoidReferenceContextItem
	 */

	/**
	 * @inheritdoc
	 */
	ve.ui.MWReferenceContextItem.prototype.renderBody = function () {
		var surfaceModel, fragment, annotations, annotation, convertButton, range, contentNode,
			refNode = this.getReferenceNode();

		this.$body.append( this.getRendering() );

		if ( !refNode ) {
			return;
		}

		surfaceModel = this.context.getSurface().getModel();
		range = refNode.getRange();
		fragment = surfaceModel.getLinearFragment( range );
		// Get covering annotations
		annotations = fragment.getAnnotations( false );
		// The reference consists of one single external link so
		// offer the user a conversion to citoid-generated reference
		if (
			annotations.getLength() === 1 &&
			( annotation = annotations.get( 0 ) ) instanceof ve.dm.MWExternalLinkAnnotation
		) {
			this.convertibleHref = annotation.getHref();
		} else if ( range.getLength() === 4 ) {
			contentNode = fragment.adjustLinearSelection( 1, -1 ).getSelectedNode();
			if ( contentNode instanceof ve.dm.MWNumberedExternalLinkNode ) {
				this.convertibleHref = contentNode.getHref();
			}
		}
		if ( this.convertibleHref ) {
			convertButton = new OO.ui.ButtonWidget( {
				label: ve.msg( 'citoid-referencecontextitem-convert-button' )
			} ).connect( this, { click: 'onConvertButtonClick' } );
			this.$body.append(
				$( '<div>' )
					.addClass( 've-ui-citoidReferenceContextItem-convert ve-ui-mwReferenceContextItem-muted' )
					.text( ve.msg( 'citoid-referencecontextitem-convert-message' ) ),
				convertButton.$element
			);
		}
	};

	/**
	 * Handle click events from the convert button
	 */
	ve.ui.MWReferenceContextItem.prototype.onConvertButtonClick = function () {
		var action = ve.ui.actionFactory.create( 'citoid', this.context.getSurface() );
		action.open( this.convertibleHref );
	};

}() );
