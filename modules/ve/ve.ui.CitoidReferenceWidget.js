/**
 * Citoid extension citation option widget
 *
 * @class
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {ve.dm.Document} documentModel Document model
 * @param {ve.dm.MWTransclusionModel} transclusionModel Transclusion model used for this template
 * @param {Object} [config]
 * @param {string} [config.templateName="Cite web"]
 * @param {Object[]} [config.citeTools] An array of available citation tool configuration
 */
ve.ui.CitoidReferenceWidget = function VeUiCitoidReferenceWidget( documentModel, transclusionModel, config ) {
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
	let icon;
	if ( Array.isArray( config.citeTools ) ) {
		for ( let i = 0, len = config.citeTools.length; i < len; i++ ) {
			const item = config.citeTools[ i ];
			if ( item.template === this.templateName ) {
				this.title = item.title;
				icon = item.icon;
			}
		}
	}
	this.setIcon( icon || 'browser' );

	// Add insert button
	this.insertButton = new OO.ui.ButtonWidget( {
		label: mw.msg( 'citoid-citation-widget-insert-button' ),
		classes: [ 've-ui-citoidReferenceWidget-insert-button' ],
		flags: [ 'progressive', 'primary' ]
	} );

	// Create the citation preview
	const doc = documentModel.cloneWithData( [
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
	// There are no nested references, and this doc is never
	// merged with another doc, so set copyInternalList=false
	// and detachedCopy=true
	], false, true );

	const node = doc.getDocumentNode().getChildren()[ 0 ];
	this.preview = new ve.ui.MWPreviewElement( node );
	if ( this.preview.isGenerating() ) {
		this.preview.once( 'render', this.renderPromise.resolve );
	} else {
		this.renderPromise.resolve();
	}

	// Display the preview
	const title = new OO.ui.LabelWidget( {
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

/* Events */

/**
 * @event ve.ui.CitoidReferenceWidget#insert
 */

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
 * @fires ve.ui.CitoidReferenceWidget#insert
 */
ve.ui.CitoidReferenceWidget.prototype.onInsertButtonClick = function () {
	this.emit( 'insert' );
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
