/*!
 * VisualEditor UserInterface ISBNScannerButtonWidget class
 * Originally from VisualEditor MediaWiki UserInterface
 *
 * @copyright 2011-2015 VisualEditor Team and others
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ISBNScannerButtonWidget object.
 *
 * @class
 * @extends OO.ui.ButtonWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.ISBNScannerButtonWidget = function VeUiISBNScannerButtonWidget( config ) {
	config = ve.extendObject( {
		icon: 'barcode',
		label: ve.msg( 'citoid-isbnscannerdialog-title' )
	}, config );

	// Parent constructor
	ve.ui.ISBNScannerButtonWidget.super.call( this, config );

	this.overlay = new ve.ui.Overlay( { classes: [ 've-ui-overlay-global' ] } );
	this.dialogs = config.dialogManager || new ve.ui.WindowManager( { factory: ve.ui.windowFactory } );

	this.on( 'click', this.openScanner.bind( this ) );

	this.overlay.$element.append( this.dialogs.$element );
	$( document.body ).append( this.overlay.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.ISBNScannerButtonWidget, OO.ui.ButtonWidget );

/**
 * Open the ISBN scanner dialog
 */
ve.ui.ISBNScannerButtonWidget.prototype.openScanner = function () {
	var widget = this;
	this.dialogs.openWindow( 'isbnScanner', {
		availableLanguages: this.availableLanguages,
		$returnFocusTo: null
	} ).closing.then( function ( data ) {
		data = data || {};
		if ( data.action === 'apply' ) {
			widget.emit( 'detected', data.code );
		}
	} );
};