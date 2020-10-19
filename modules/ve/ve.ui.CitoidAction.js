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
ve.ui.CitoidAction = function VeUiCitoidAction() {
	// Parent constructor
	ve.ui.CitoidAction.super.apply( this, arguments );
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
 * @param {boolean} [replace] Replace the contents of the selected reference
 * @param {string} [lookup] URL to look up
 * @param {number} [inStaging] A staged change was mode to the surface as part of opening the inspector.
 *  e.g. Used to unwrap text in Template:Citation_needed_span
 * @return {boolean} Action was executed
 */
ve.ui.CitoidAction.prototype.open = function ( replace, lookup, inStaging ) {
	this.surface.execute( 'window', 'open', 'citoid', {
		replace: replace,
		lookup: lookup,
		inStaging: inStaging,
		inDialog: this.surface.getInDialog()
	} );
	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.CitoidAction );
