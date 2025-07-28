/**
 * Citoid extension citation group widget
 *
 * @mixes OO.ui.mixin.GroupWidget
 * @param {Object} config Dialog configuration object
 */
ve.ui.CitoidGroupWidget = function VeUiCitoidGroupWidget( config ) {
	// Parent constructor
	ve.ui.CitoidGroupWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.GroupWidget.call( this, Object.assign( {}, config, { $group: this.$element } ) );

	// Aggregate events
	this.aggregate( { insert: 'choose' } );

	this.$element.addClass( 've-ui-citoidInspector-preview' );
};

/* Inheritance */
OO.inheritClass( ve.ui.CitoidGroupWidget, OO.ui.Widget );
OO.mixinClass( ve.ui.CitoidGroupWidget, OO.ui.mixin.GroupElement );

/* Events */

/**
 * @event ve.ui.CitoidGroupWidget#choose
 */

/* Methods */

/**
 * Clear all items from the group.
 *
 * Before they are cleared they will be destroyed individually, aborting promises and destroying ui
 * surfaces and nodes.
 *
 * @chainable
 */
ve.ui.CitoidGroupWidget.prototype.clearItems = function () {
	for ( let i = 0, len = this.items.length; i < len; i++ ) {
		this.items[ i ].destroy();
	}

	// Parent method
	OO.ui.mixin.GroupElement.prototype.clearItems.call( this );
};
