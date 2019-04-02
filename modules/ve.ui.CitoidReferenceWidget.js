/**
 * Citoid extension citation option widget
 *
 * @class
 * @extends {OO.ui.DecoratedOptionWidget}
 *
 * @constructor
 * @param {ve.dm.Document} documentModel Document model
 * @param {ve.dm.MWTransclusionModel} transclusionModel Transclusion model used for this template
 * @param {Object} config Configuration object
 * @cfg {string} [templateName] Template name
 * @cfg {Object[]} citeTools An array of available citation tool configuration
 */
ve.ui.CitoidReferenceWidget = function VeUiCitoidReferenceWidget( documentModel, transclusionModel, config ) {
	var i, len, icon, item, title, doc, node;

	config = config || {};

	this.transclusionModel = transclusionModel;
	this.templateName = config.templateName || 'Cite web';
	this.title = this.templateName;
	this.renderPromise = $.Deferred();

	// Parent constructor
	ve.ui.CitoidReferenceWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, config );

	// Set the icon
	if ( Array.isArray( config.citeTools ) ) {
		for ( i = 0, len = config.citeTools.length; i < len; i++ ) {
			item = config.citeTools[ i ];
			if ( item.template === this.templateName ) {
				this.title = item.title;
				icon = item.icon;
			}
		}
	}
	this.setIcon( icon || 'ref-cite-web' );

	// Add insert button
	this.insertButton = new OO.ui.ButtonWidget( {
		label: mw.msg( 'citoid-citation-widget-insert-button' ),
		classes: [ 've-ui-citoidReferenceWidget-insert-button' ],
		flags: [ 'progressive', 'primary' ]
	} );

	// Create the citation preview
	doc = documentModel.cloneWithData( [
		{ type: 'paragraph' },
		{
			type: 'mwTransclusionInline',
			attributes: {
				mw: this.transclusionModel.getPlainObject()
			}
		},
		{ type: '/mwTransclusionInline' },
		{ type: '/paragraph' },
		{ type: 'internalList' },
		{ type: '/internalList' }
	] );

	node = doc.getDocumentNode().getChildren()[ 0 ];
	this.preview = new ve.ui.MWPreviewElement( node );
	if ( this.preview.isGenerating() ) {
		this.preview.once( 'render', this.renderPromise.resolve );
	} else {
		this.renderPromise.resolve();
	}

	// Display the preview
	title = new OO.ui.LabelWidget( {
		label: this.title
	} );

	// Events
	this.insertButton.connect( this, { click: 'onInsertButtonClick' } );

	// Initialization
	this.$element
		.addClass( 've-ui-citoidReferenceWidget' )
		.append(
			this.$icon,
			title.$element,
			this.insertButton.$element,
			this.preview.$element
		);
};

/* Inheritance */

OO.inheritClass( ve.ui.CitoidReferenceWidget, OO.ui.Widget );
OO.mixinClass( ve.ui.CitoidReferenceWidget, OO.ui.mixin.IconElement );

/* Methods */

/**
 * Clean up the widget; destroy node and surface.
 */
ve.ui.CitoidReferenceWidget.prototype.destroy = function () {
	this.renderPromise.reject();
	this.preview.destroy();
};

/**
 * Respond to insert button click event
 *
 * @fires insert
 */
ve.ui.CitoidReferenceWidget.prototype.onInsertButtonClick = function () {
	this.emit( 'insert', this.data );
};

/**
 * Focus the widget
 */
ve.ui.CitoidReferenceWidget.prototype.focus = function () {
	this.insertButton.$button[ 0 ].focus();
};

/**
 * Get the render promise associated with the node.
 *
 * @return {jQuery.Promise} Rendering promise resolved when the rendering
 * of the node is completed.
 */
ve.ui.CitoidReferenceWidget.prototype.getRenderPromise = function () {
	return this.renderPromise;
};
