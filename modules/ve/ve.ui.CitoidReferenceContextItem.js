ve.ui.CitoidReferenceContextItem = function VeUiCitoidReferenceContextItem() {
	// Parent constructor
	ve.ui.CitoidReferenceContextItem.super.apply( this, arguments );
};

/* Inheritance */

const MWReferenceContextItem = ve.ui.contextItemFactory.lookup( 'reference' );
OO.inheritClass( ve.ui.CitoidReferenceContextItem, MWReferenceContextItem );

/**
 * Get the href associated with this reference if it is a plain link reference
 *
 * @param {ve.dm.InternalItemNode} itemNode Reference item node
 * @return {string|null} Href, or null if this isn't a plain link reference
 */
ve.ui.CitoidReferenceContextItem.static.getConvertibleHref = function ( itemNode ) {
	const doc = itemNode.getRoot().getDocument(),
		range = itemNode.getRange();

	// Get all annotations
	const annotations = doc.data.getAnnotationsFromRange( range, true );
	const externalLinks = annotations.get().filter( ( ann ) => ann instanceof ve.dm.MWExternalLinkAnnotation ).map( ( ann ) => ann.getHref() );

	// Find numbered external link nodes
	itemNode.traverse( ( node ) => {
		if ( node instanceof ve.dm.MWNumberedExternalLinkNode ) {
			externalLinks.push( node.getHref() );
		}
	} );

	// The reference contains one external link so offer the user
	// a conversion to citoid-generated reference
	if ( externalLinks.length === 1 ) {
		return externalLinks[ 0 ];
	}
	return null;
};

/**
 * @inheritdoc
 */
ve.ui.CitoidReferenceContextItem.prototype.renderBody = function () {
	const refNode = this.getReferenceNode();

	// Parent method
	ve.ui.CitoidReferenceContextItem.super.prototype.renderBody.call( this );

	if ( !refNode || this.isReadOnly() || !ve.ui.mwCitoidMap ) {
		return;
	}

	const convertibleHref = this.constructor.static.getConvertibleHref( refNode );

	if ( convertibleHref ) {
		const convertButton = new OO.ui.ButtonWidget( {
			label: ve.msg( 'citoid-referencecontextitem-convert-button' )
		} ).on( 'click', () => {
			// Phabricator T401494
			ve.track( 'activity.citoid', { action: 'convert-link' } );
			const action = ve.ui.actionFactory.create( 'citoid', this.context.getSurface() );
			action.open( true, convertibleHref );
		} );

		this.$body.append(
			$( '<div>' )
				.addClass( 've-ui-citoidReferenceContextItem-convert ve-ui-mwReferenceContextItem-muted' )
				.text( ve.msg( 'citoid-referencecontextitem-convert-message' ) )
		);

		if ( this.$foot ) {
			this.$foot.prepend( convertButton.$element );
		} else {
			this.$body.append( convertButton.$element );
		}
	}
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.CitoidReferenceContextItem );
