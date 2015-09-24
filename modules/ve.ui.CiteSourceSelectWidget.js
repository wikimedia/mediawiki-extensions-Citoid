/*!
 * VisualEditor UserInterface CiteSourceSelectWidget class
 * Originally from VisualEditor MediaWiki UserInterface
 *
 * @copyright 2011-2015 VisualEditor Team and others
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.CiteSourceSelectWidget object.
 *
 * @class
 * @extends OO.ui.SearchWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.CiteSourceSelectWidget = function VeUiCiteSourceSelectWidget( config ) {
	var i, len, tools, item, limit,
		items = [];

	config = config || {};

	// Parent constructor
	ve.ui.CiteSourceSelectWidget.super.call( this, config );

	limit = ve.init.target.constructor.static.citationToolsLimit;

	try {
		// Must use mw.message to avoid JSON being parsed as Wikitext
		tools = JSON.parse( mw.message( 'visualeditor-cite-tool-definition.json' ).plain() );
	} catch ( e ) {
		tools = [];
	}

	// Go over available tools
	for ( i = 0, len = Math.min( limit, tools.length ); i < len; i++ ) {
		item = tools[ i ];
		items.push( new OO.ui.DecoratedOptionWidget( {
			icon: item.icon,
			label: item.title,
			data: {
				windowName: 'cite-' + item.name,
				dialogData: { template: item.template }
			}
		} ) );
	}

	// Basic tools
	this.refBasic = new OO.ui.DecoratedOptionWidget( {
		icon: 'reference',
		label: ve.msg( 'visualeditor-dialogbutton-reference-full-label' ),
		data: { windowName: 'reference' },
		classes: [ 've-ui-citeSourceSelectWidget-basic' ]
	} );
	items.push( this.refBasic );

	this.addItems( items );

	$( '<div>' )
		.addClass( 've-ui-citeSourceSelectWidget-separator' )
		.insertBefore( this.refBasic.$element );

	// Initialization
	this.$element.addClass( 've-ui-citeSourceSelectWidget' );
};

/* Inheritance */

OO.inheritClass( ve.ui.CiteSourceSelectWidget, OO.ui.SelectWidget );