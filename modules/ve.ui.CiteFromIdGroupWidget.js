/**
 * Citoid extension citation group widget
 *
 * @mixins OO.ui.GroupWidget
 * @param {Object} config Dialog configuration object
 */
ve.ui.CiteFromIdGroupWidget = function VeUiCiteFromIdGroupWidget( config ) {
	// Parent constructor
	ve.ui.CiteFromIdGroupWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.GroupWidget.call( this, $.extend( {}, config, { $group: this.$element } ) );

	// Aggregate events
	this.aggregate( {
		insert: 'itemInsert',
		update: 'itemUpdate'
	} );
	this.connect( this, {
		itemInsert: 'onItemInsert',
		itemUpdate: 'onItemUpdate'
	} );

	this.$element.addClass( 've-ui-citeFromIdInspector-preview' );
};

/* Inheritance */
OO.inheritClass( ve.ui.CiteFromIdGroupWidget, OO.ui.Widget );
OO.mixinClass( ve.ui.CiteFromIdGroupWidget, OO.ui.GroupElement );

/* Methods */

/**
 * Respond to item insert event
 * @param {ve.ui.CiteFromIdReferenceWidget} item Source item
 * @fires choose
 */
ve.ui.CiteFromIdGroupWidget.prototype.onItemInsert = function ( item ) {
	this.emit( 'choose', item );
};

/**
 * Respond to item update event
 * @param {ve.ui.CiteFromIdReferenceWidget} item Source item
 * @fires update
 */
ve.ui.CiteFromIdGroupWidget.prototype.onItemUpdate = function () {
	this.emit( 'update' );
};

/**
 * Clear all items from the group.
 *
 * Before they are cleared they will be destroyed individually, aborting promises and destroying ui
 * surfaces and nodes.
 *
 * @chainable
 */
ve.ui.CiteFromIdGroupWidget.prototype.clearItems = function () {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		this.items[ i ].destroy();
	}

	// Parent method
	OO.ui.GroupElement.prototype.clearItems.call( this );
};
