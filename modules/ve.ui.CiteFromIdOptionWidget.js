/**
 * Citoid extension citation option widget
 *
 * @extends {OO.ui.DecoratedOptionWidget}
 * @param {Object} config Dialog configuration object
 */
ve.ui.CiteFromIdOptionWidget = function VeUiCiteFromIdOptionWidget( documentModel, config ) {
	var i, len, icon, uiSurface, item,
		widget = this;

	config = config || {};

	this.allLinks = {};
	this.templateName = config.templateName || 'Cite web';
	this.template = config.template;
	this.transclusionModel = config.transclusionModel;
	this.title = this.templateName;

	if ( Array.isArray( config.citeTools ) ) {
		for ( i = 0, len = config.citeTools.length; i < len; i++ ) {
			item = config.citeTools[i];
			if ( item.template === this.templateName ) {
				this.title = item.title;
				icon = item.icon;
			}
		}
	}
	// Parent constructor
	ve.ui.CiteFromIdOptionWidget.super.call( this, $.extend( config, {
		icon: icon || 'ref-' + this.templateName.toLowerCase().replace( ' ', '-' )
	} ) );

	// Create a node
	uiSurface = new ve.ui.DesktopSurface(
		new ve.dm.ElementLinearData(
			documentModel.getStore(),
			[
				{
					type: 'mwTransclusionBlock',
					attributes: {
						mw: this.transclusionModel.getPlainObject()
					}
				},
				{ type: '/mwTransclusionBlock' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			]
		) );
	this.$referenceWrapper = $( '<div>' )
		.addClass( 've-ui-citeFromIdOptionWidget-wrapper' )
		// HACK: We want to update the size of the inspector according to the
		// size of this widget, and for that we need to know when the generated
		// node is done generating. This should be fixed at some point to not
		// require listening DOMSubtreeModified event.
		.on( 'DOMSubtreeModified', ve.debounce( function () {
			widget.emit( 'update' );
		}, 100 ) )
		.on( 'click mousedown', function ( e ) {
			e.preventDefault();
		} )
		.append( uiSurface.view.documentView.documentNode.children[0].$element );

	// Display the preview
	this.setLabel( this.title );

	// Initialize
	this.$element
		.addClass( 've-ui-citeFromIdOptionWidget' )
		.append( this.$referenceWrapper );
};

OO.inheritClass( ve.ui.CiteFromIdOptionWidget, OO.ui.DecoratedOptionWidget );
