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
 * @param {string} [source]
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
 * @param {Object} [options]
 * @param {boolean} [options.replace=false] Replace the contents of the selected reference
 * @param {string} [options.lookup] URL to look up
 * @param {boolean} [options.inStaging=false] A staged change was made to the surface as part of
 *  opening the inspector, e.g. used to unwrap text in Template:Citation_needed_span
 * @return {boolean} Action was executed
 */
ve.ui.CitoidAction.prototype.open = function ( options ) {
	// Only for backwards compatibility with old callers outside of Citoid
	if ( typeof options !== 'object' ) {
		options = { replace: arguments[ 0 ], lookup: arguments[ 1 ], inStaging: arguments[ 2 ] };
	}

	options.inDialog = this.surface.getInDialog();
	this.surface.execute( 'window', 'open', 'citoid', options );
	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.CitoidAction );
