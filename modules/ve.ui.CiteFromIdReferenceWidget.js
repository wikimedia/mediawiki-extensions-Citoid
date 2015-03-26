/**
 * Citoid extension citation option widget
 *
 * @extends {OO.ui.DecoratedOptionWidget}
 * @param {Object} config Dialog configuration object
 */
ve.ui.CiteFromIdReferenceWidget = function VeUiCiteFromIdReferenceWidget( documentModel, config ) {
	var i, len, icon, item, title,
		widget = this;

	config = config || {};

	this.allLinks = {};
	this.templateName = config.templateName || 'Cite web';
	this.template = config.template;
	this.transclusionModel = config.transclusionModel;
	this.title = this.templateName;

	this.renderPromise = $.Deferred();

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
	this.uiSurface = new ve.ui.DesktopSurface(
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
	// HACK: We need the view to be initialized in order for the 'rerender' event
	// to be emitted on the generated node.
	this.uiSurface.getView().initialize();
	this.node = this.uiSurface.getView().getDocument().getDocumentNode().getChildren()[0];
	if ( this.node.isGenerating() ) {
		this.node.once( 'rerender', function () {
			widget.renderPromise.resolve();
		} );
	} else {
		this.renderPromise.resolve();
	}

	this.$referenceWrapper = $( '<div>' )
		.addClass( 've-ui-citeFromIdReferenceWidget-wrapper' )
		.on( 'click mousedown', function ( e ) {
			e.preventDefault();
		} )
		.append( this.node.$element );

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
 * Clean up the widget; destroy node and surface.
 */
ve.ui.CiteFromIdReferenceWidget.prototype.destroy = function () {
	this.node.destroy();
	this.uiSurface.destroy();
	this.renderPromise.reject();
};

/**
 * Respond to insert button click event
 * @fires insert
 */
ve.ui.CiteFromIdReferenceWidget.prototype.onInsertButtonClick = function () {
	this.emit( 'insert', this.data );
};

/**
 * Get the render promise associated with the node.
 * @return {jQuery.Promise} Rendering promise resolved when the rendering
 * of the node is completed.
 */
ve.ui.CiteFromIdReferenceWidget.prototype.getRenderPromise = function () {
	return this.renderPromise;
};
