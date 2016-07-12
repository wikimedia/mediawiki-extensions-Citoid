( function () {
	var i, j, jLen, name, toolClass, toolGroups, citeIndex, target, map;

	// Don't create tool unless the configuration message is present
	try {
		map = JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	} catch ( e ) { }

	if ( !map ) {
		// Unregister the tool
		ve.ui.toolFactory.unregister( ve.ui.CiteFromIdInspectorTool );
		return;
	}

	// HACK: Find the position of the current citation toolbar definition
	// and manipulate it.

	// Unregister regular citation tools so they don't end up in catch-all groups
	for ( name in ve.ui.toolFactory.registry ) {
		toolClass = ve.ui.toolFactory.lookup( name );
		if (
			name === 'reference' || name.indexOf( 'reference/' ) === 0 ||
			toolClass.prototype instanceof ve.ui.MWCitationDialogTool
		) {
			ve.ui.toolFactory.unregister( toolClass );
		}
	}
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
	 * HACK: Override MWReferenceContextItem methods directly instead of inheriting,
	 * as the context relies on the generated citation types (ref, book, ...) inheriting
	 * directly from MWReferenceContextItem.
	 *
	 * This should be a subclass, e.g. CitoidReferenceContextItem
	 */

	/**
	 * Get the href associated with this reference if it is a plain link reference
	 *
	 * @param {ve.dm.InternalItemNode} itemNode Reference item node
	 * @return {string|null} Href, or null if this isn't a plain link reference
	 */
	ve.ui.MWReferenceContextItem.static.getConvertibleHref = function ( itemNode ) {
		var annotation, contentNode,
			doc = itemNode.getRoot().getDocument(),
			range = itemNode.getRange(),
			// Get covering annotations
			annotations = doc.data.getAnnotationsFromRange( range, false );

		// The reference consists of one single external link so
		// offer the user a conversion to citoid-generated reference
		if (
			annotations.getLength() === 1 &&
			( annotation = annotations.get( 0 ) ) instanceof ve.dm.MWExternalLinkAnnotation
		) {
			return annotation.getHref();
		} else if ( range.getLength() === 4 ) {
			contentNode = ve.getProp( itemNode, 'children', 0, 'children', 0 );
			if ( contentNode instanceof ve.dm.MWNumberedExternalLinkNode ) {
				return contentNode.getHref();
			}
		}
		return null;
	};

	/**
	 * @inheritdoc
	 */
	ve.ui.MWReferenceContextItem.prototype.renderBody = function () {
		var convertButton, convertibleHref,
			contextItem = this,
			refNode = this.getReferenceNode();

		this.$body.append( this.getRendering() );

		if ( !refNode ) {
			return;
		}

		convertibleHref = this.constructor.static.getConvertibleHref( refNode );

		if ( convertibleHref ) {
			convertButton = new OO.ui.ButtonWidget( {
				label: ve.msg( 'citoid-referencecontextitem-convert-button' )
			} ).on( 'click', function () {
				var action = ve.ui.actionFactory.create( 'citoid', contextItem.context.getSurface() );
				action.open( true, convertibleHref );
			} );

			this.$body.append(
				$( '<div>' )
					.addClass( 've-ui-citoidReferenceContextItem-convert ve-ui-mwReferenceContextItem-muted' )
					.text( ve.msg( 'citoid-referencecontextitem-convert-message' ) ),
				convertButton.$element
			);
		}
	};

}() );
