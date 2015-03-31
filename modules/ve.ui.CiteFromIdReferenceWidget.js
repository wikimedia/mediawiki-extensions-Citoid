/**
 * Citoid extension citation option widget
 *
 * @extends {OO.ui.DecoratedOptionWidget}
 * @param {Object} config Dialog configuration object
 */
ve.ui.CiteFromIdReferenceWidget = function VeUiCiteFromIdReferenceWidget( documentModel, config ) {
	var i, len, icon, item, title, uiSurface,
		widget = this;

	config = config || {};

	this.allLinks = {};
	this.templateName = config.templateName || 'Cite web';
	this.template = config.template;
	this.transclusionModel = config.transclusionModel;
	this.title = this.templateName;

	// Parent constructor
	ve.ui.CiteFromIdReferenceWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.IconElement.call( this, config );

	// Set the icon
	if ( Array.isArray( config.citeTools ) ) {
		for ( i = 0, len = config.citeTools.length; i < len; i++ ) {
			item = config.citeTools[i];
			if ( item.template === this.templateName ) {
				this.title = item.title;
				icon = item.icon;
			}
		}
	}
	this.setIcon( icon );

	// Add insert button
	this.insertButton = new OO.ui.ButtonWidget( {
		label: mw.msg( 'citoid-citation-widget-insert-button' ),
		classes: [ 've-ui-citeFromIdReferenceWidget-insert-button' ],
		flags: [ 'constructive', 'primary' ]
	} );

	// Creating the citation
	uiSurface = new ve.ui.DesktopSurface(
		new ve.dm.ElementLinearData(
			documentModel.getStore(),
			[
				{
					type: 'mwTransclusionInline',
					attributes: {
						mw: this.transclusionModel.getPlainObject()
					}
				},
				{ type: '/mwTransclusionInline' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			]
		) );
	this.$referenceWrapper = $( '<div>' )
		.addClass( 've-ui-citeFromIdReferenceWidget-wrapper' )
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
	title = new OO.ui.LabelWidget( {
		label: this.title
	} );

	// Events
	this.insertButton.connect( this, { click: 'onInsertButtonClick' } );

	// Initialization
	this.$element
		.addClass( 've-ui-citeFromIdReferenceWidget' )
		.append(
			this.$icon,
			title.$element,
			this.insertButton.$element,
			this.$referenceWrapper
		);
};

/* Inheritance */

OO.inheritClass( ve.ui.CiteFromIdReferenceWidget, OO.ui.Widget );
OO.mixinClass( ve.ui.CiteFromIdReferenceWidget, OO.ui.IconElement );

/* Methods */

/**
 * Respond to insert button click event
 * @fires insert
 */
ve.ui.CiteFromIdReferenceWidget.prototype.onInsertButtonClick = function () {
	this.emit( 'insert', this.data );
};
