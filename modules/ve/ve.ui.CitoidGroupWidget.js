/**
 * Citoid extension citation group widget
 *
 * @mixins OO.ui.mixin.GroupWidget
 * @param {Object} config Dialog configuration object
 */
ve.ui.CitoidGroupWidget = function VeUiCitoidGroupWidget( config ) {
	// Parent constructor
	ve.ui.CitoidGroupWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.GroupWidget.call( this, $.extend( {}, config, { $group: this.$element } ) );

	// Aggregate events
	this.aggregate( {
		insert: 'itemInsert',
		update: 'itemUpdate'
	} );
	this.connect( this, {
		itemInsert: 'onItemInsert',
		itemUpdate: 'onItemUpdate'
	} );

	this.$element.addClass( 've-ui-citoidInspector-preview' );
};

/* Inheritance */
OO.inheritClass( ve.ui.CitoidGroupWidget, OO.ui.Widget );
OO.mixinClass( ve.ui.CitoidGroupWidget, OO.ui.mixin.GroupElement );

/* Methods */

/**
 * Respond to item insert event
 *
 * @param {ve.ui.CitoidReferenceWidget} item Source item
 * @fires choose
 */
ve.ui.CitoidGroupWidget.prototype.onItemInsert = function ( item ) {
	this.emit( 'choose', item );
};

/**
 * Respond to item update event
 *
 * @param {ve.ui.CitoidReferenceWidget} item Source item
 * @fires update
 */
ve.ui.CitoidGroupWidget.prototype.onItemUpdate = function () {
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
ve.ui.CitoidGroupWidget.prototype.clearItems = function () {
	for ( var i = 0, len = this.items.length; i < len; i++ ) {
		this.items[ i ].destroy();
	}

	// Parent method
	OO.ui.mixin.GroupElement.prototype.clearItems.call( this );
};
