/*!
 * VisualEditor UserInterface CitoidAction class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Link action.
 *
 * Opens the citoid inspector with a parameter denoting which dialog
 * the surface is in.
 *
 * @class
 * @extends ve.ui.Action
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.CitoidAction = function VeUiCitoidAction( surface ) {
	// Parent constructor
	ve.ui.Action.call( this, surface );
};

/* Inheritance */

OO.inheritClass( ve.ui.CitoidAction, ve.ui.Action );

/* Static Properties */

ve.ui.CitoidAction.static.name = 'citoid';

/**
 * @inheritdoc
 */
ve.ui.CitoidAction.static.methods = [ 'open' ];

/* Methods */

/**
 * When opening citoid inspector, send the inspector a property of the surface
 * dialog name.
 *
 * @method
 * @return {boolean} Action was executed
 */
ve.ui.CitoidAction.prototype.open = function ( lookup ) {
	this.surface.execute( 'window', 'open', 'citefromid', {
		lookup: lookup,
		inDialog: this.surface.getInDialog()
	} );
	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.CitoidAction );
