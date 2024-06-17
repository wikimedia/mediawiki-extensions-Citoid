/*!
 * VisualEditor UserInterface SetExtendsContentDialog class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Dialog for searching for and selecting a language.
 *
 * @class
 * @extends OO.ui.ProcessDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.SetExtendsContentDialog = function VeUiSetExtendsContentDialog( config ) {
	// Parent constructor
	ve.ui.SetExtendsContentDialog.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.SetExtendsContentDialog, OO.ui.ProcessDialog );

/* Static Properties */

ve.ui.SetExtendsContentDialog.static.name = 'setExtendsContent';

ve.ui.SetExtendsContentDialog.static.size = 'medium';

// TODO extends i18n
ve.ui.SetExtendsContentDialog.static.title = 'Extend a reference';

ve.ui.SetExtendsContentDialog.static.actions = [
	{
		action: 'insert',
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-insert' ),
		flags: [ 'progressive', 'primary' ],
		modes: 'insert'
	},
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: [ 'safe', 'close' ],
		modes: [ 'insert' ]
	}
];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.SetExtendsContentDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.SetExtendsContentDialog.super.prototype.initialize.apply( this, arguments );

	const citeCommands = Object.keys( ve.init.target.getSurface().commandRegistry.registry )
		.filter( ( command ) => command.indexOf( 'cite-' ) !== -1 );

	this.editPanel = new OO.ui.PanelLayout( {
		scrollable: true, padded: true
	} );

	// Icon message widget
	this.extendsWarning = new OO.ui.MessageWidget( {
		icon: 'alert',
		inline: true,
		classes: [ 've-ui-setExtendsContentDialog-warning' ]
	} );

	this.referenceTarget = ve.init.target.createTargetWidget(
		{
			includeCommands: ve.ui.MWReferenceDialog.static.includeCommands,
			excludeCommands: ve.ui.MWReferenceDialog.static.excludeCommands.concat( citeCommands ),
			importRules: ve.ui.MWReferenceDialog.static.getImportRules(),
			inDialog: this.constructor.static.name,
			// TODO extends i18n
			placeholder: 'Write or paste the content for the extension here'
		}
	);

	this.contentFieldset = new OO.ui.FieldsetLayout();
	this.contentFieldset.$element.append( this.referenceTarget.$element );

	this.editPanel.$element.append( this.extendsWarning.$element, this.contentFieldset.$element );

	this.$body.append( this.editPanel.$element );
};

/**
 * @inheritdoc
 */
ve.ui.SetExtendsContentDialog.prototype.getSetupProcess = function ( data ) {
	return ve.ui.SetExtendsContentDialog.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			this.originalRef = data.originalRef;
			this.newRef = data.newRef;

			const originalItemNode = data.internalList.getItemNode( this.originalRef.getListIndex() );
			const originalRefText = new ve.ui.MWPreviewElement( originalItemNode, { useView: true } ).$element.text();
			// TODO extends i18n
			const warningMessage = `This is an extension of another reference "${ originalRefText }".`;
			this.extendsWarning.setLabel( warningMessage );

			this.referenceTarget.setDocument( this.newRef.getDocument() );
		} );
};

/**
 * @override
 */
ve.ui.SetExtendsContentDialog.prototype.getActionProcess = function ( action ) {
	if ( action === 'insert' ) {
		return new OO.ui.Process( () => {
			this.close( { action: action } );
		} );
	}
	return ve.ui.SetExtendsContentDialog.super.prototype.getActionProcess.call( this, action );
};

/**
 * @inheritdoc
 */
ve.ui.SetExtendsContentDialog.prototype.getReadyProcess = function ( data ) {
	return ve.ui.SetExtendsContentDialog.super.prototype.getReadyProcess.call( this, data )
		.next( () => {
			this.referenceTarget.focus();
		} );
};

/**
 * @inheritdoc
 */
ve.ui.SetExtendsContentDialog.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.SetExtendsContentDialog.super.prototype.getTeardownProcess.call( this, data )
		.next( () => {
			if ( data && data.action && data.action === 'insert' ) {
				this.newRef.setDocument( this.referenceTarget.getContent() );
			}
			this.referenceTarget.clear();
		} );
};

/**
 * @inheritdoc
 */
ve.ui.SetExtendsContentDialog.prototype.getBodyHeight = function () {
	return 250;
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.SetExtendsContentDialog );
