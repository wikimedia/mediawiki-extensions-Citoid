( function () {
	var i, name, toolClass, toolGroups, map, requireMappings, origRenderBody,
		missingMappings = [];

	// If any citation tools exist, setup Citoid commands, as this at
	// least provides an improved experience for selecting "manual" citations.
	if ( ve.ui.mwCitationTools.length ) {
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

		/* Trigger */
		// Unregister Cite's trigger
		ve.ui.triggerRegistry.unregister( 'reference' );
		ve.ui.triggerRegistry.register(
			'citefromid', { mac: new ve.ui.Trigger( 'cmd+shift+k' ), pc: new ve.ui.Trigger( 'ctrl+shift+k' ) }
		);

		/* Command help */
		// This will replace Cite's trigger on insert/ref
		// "register" on commandHelpRegistry is more of an "update", so we don't need to provide label/sequence.
		ve.ui.commandHelpRegistry.register( 'insert', 'ref', {
			trigger: 'citefromid'
		} );
	} else {
		// If there are no citation tools, don't even bother searching for type mappings below
		return;
	}

	/* Setup tools and toolbars */

	// Don't create tool unless the configuration message is present
	try {
		map = JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	} catch ( e ) {}

	if ( !map ) {
		// Unregister the tool
		ve.ui.toolFactory.unregister( ve.ui.CiteFromIdInspectorTool );
		return;
	}

	requireMappings = [
		'artwork',
		'audioRecording',
		'bill',
		'blogPost',
		'book',
		'bookSection',
		'case',
		'computerProgram',
		'conferencePaper',
		'dictionaryEntry',
		'document',
		'email',
		'encyclopediaArticle',
		'film',
		'forumPost',
		'hearing',
		'instantMessage',
		'interview',
		'journalArticle',
		'letter',
		'magazineArticle',
		'manuscript',
		'map',
		'newspaperArticle',
		'patent',
		'podcast',
		'presentation',
		'radioBroadcast',
		'report',
		'statute',
		'thesis',
		'tvBroadcast',
		'videoRecording',
		'webpage'
	];

	// Check map has all required keys
	for ( i = 0; i < requireMappings.length; i++ ) {
		if ( !map[ requireMappings[ i ] ] ) {
			missingMappings.push( requireMappings[ i ] );
		}
	}

	if ( missingMappings.length ) {
		mw.log.warn( 'Mapping(s) missing from citoid-template-type-map.json: ' + missingMappings.join( ', ' ) );
		// Unregister the tool
		ve.ui.toolFactory.unregister( ve.ui.CiteFromIdInspectorTool );
		return;
	}

	// Expose
	ve.ui.mwCitoidMap = map;

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

	function fixTarget( target ) {
		var i, iLen;
		toolGroups = target.static.toolbarGroups;
		// Instead of using the rigid position of the group,
		// downgrade this hack from horrific to somewhat less horrific by
		// looking through the object to find what we actually need
		// to replace. This way, if toolbarGroups are changed in VE code
		// we won't have to manually change the index here.
		for ( i = 0, iLen = toolGroups.length; i < iLen; i++ ) {
			// Replace the previous cite group with the citoid tool.
			// If there is no cite group, citoid will appear in the catch-all group
			if ( toolGroups[ i ].name === 'cite' ) {
				toolGroups[ i ] = {
					name: 'citoid',
					include: [ 'citefromid' ]
				};
				break;
			}
		}
	}

	for ( name in ve.init.mw.targetFactory.registry ) {
		fixTarget( ve.init.mw.targetFactory.lookup( name ) );
	}

	ve.init.mw.targetFactory.on( 'register', function ( name, target ) {
		fixTarget( target );
	} );

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

	origRenderBody = ve.ui.MWReferenceContextItem.prototype.renderBody;

	/**
	 * @inheritdoc
	 */
	ve.ui.MWReferenceContextItem.prototype.renderBody = function () {
		var convertButton, convertibleHref,
			contextItem = this,
			refNode = this.getReferenceNode();

		origRenderBody.call( this );

		if ( !refNode || this.isReadOnly() ) {
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
