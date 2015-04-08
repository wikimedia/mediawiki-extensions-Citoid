/**
 * Inspector to insert filled references using citoid service
 *
 * @class
 * @extends ve.ui.FragmentInspector
 * @constructor
 * @param {Object} [config] Configuration options
 */

ve.ui.CiteFromIdInspector = function VeUiCiteFromIdInspector( config ) {
	// Parent constructor
	ve.ui.CiteFromIdInspector.super.call( this, config );

	config = config || {};

	this.referenceModel = null;
	this.doneStaging = false;
	this.results = [];
	this.citeTools = [];
	this.templateTypeMap = null;
	this.lookupPromise = null;
	this.service = null;

	this.$element
		.addClass( 've-ui-citeFromIdInspector' );
};

/* Inheritance */
OO.inheritClass( ve.ui.CiteFromIdInspector, ve.ui.FragmentInspector );

/* Static properties */

ve.ui.CiteFromIdInspector.static.name = 'citefromid';

ve.ui.CiteFromIdInspector.static.title = OO.ui.deferMsg( 'citoid-citeFromIDDialog-title' );

ve.ui.CiteFromIdInspector.static.size = 'large';

// The string used in TemplateData to identify the correct Map object
ve.ui.CiteFromIdInspector.static.templateDataName = 'citoid';

// The requested format from the citoid client, passed as a GET parameter
ve.ui.CiteFromIdInspector.static.citoidFormat = 'mediawiki';

ve.ui.CiteFromIdInspector.static.actions = [
	{
		action: 'back',
		label: OO.ui.deferMsg( 'citoid-citeFromIDDialog-back' ),
		flags: 'safe',
		modes: [ 'result', 'notice' ]
	}
];

/* Methods */

/**
 * @inheritDoc
 */
ve.ui.CiteFromIdInspector.prototype.initialize = function () {
	var lookupActionFieldLayout, noticeLabel,
		lookupFieldset = new OO.ui.FieldsetLayout(),
		limit = ve.init.target.constructor.static.citationToolsLimit;

	// Parent method
	ve.ui.CiteFromIdInspector.super.prototype.initialize.call( this );

	this.templateTypeMap = JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
	// Get the available tools for their titles and icons
	try {
		// Must use mw.message to avoid JSON being parsed as Wikitext
		this.citeTools = JSON.parse( mw.message( 'visualeditor-cite-tool-definition.json' ).plain() );
		// Limit the number of tools
		this.citeTools.splice( limit );
	} catch ( e ) { }

	// API for citoid service
	this.service = new mw.Api( {
		ajax: {
			url: mw.config.get( 'wgCitoidConfig' ).citoidServiceUrl,
			// Request content language of wiki from citoid service
			headers: { 'accept-language': mw.config.get( 'wgContentLanguage' ) },
			dataType: 'json',
			timeout: 20 * 1000, // 20 seconds
			type: 'GET'
		}
	} );

	this.panels = new OO.ui.StackLayout( {
		expanded: false,
		scrollable: false
	} );

	this.lookupPanel = new OO.ui.PanelLayout( {
		$: this.$,
		classes: [ 'citoid-citeFromIDDialog-panel-lookup' ],
		expanded: false,
		scrollable: false
	} );

	this.resultPanel = new OO.ui.PanelLayout( {
		$: this.$,
		classes: [ 'citoid-citeFromIDDialog-panel-result' ],
		expanded: false,
		scrollable: false
	} );

	this.noticePanel = new OO.ui.PanelLayout( {
		$: this.$,
		classes: [ 'citoid-citeFromIDDialog-panel-notice' ],
		expanded: false,
		scrollable: false
	} );

	// Lookup fieldset
	this.lookupInput = new OO.ui.TextInputWidget( {
		multiline: false,
		placeholder: mw.msg( 'citoid-citeFromIDDialog-search-placeholder' )
	} );

	this.lookupButton = new OO.ui.ButtonWidget( {
		label: mw.msg( 'citoid-citeFromIDDialog-lookup-button' )
	} );
	lookupActionFieldLayout = new OO.ui.ActionFieldLayout( this.lookupInput, this.lookupButton, {
		align: 'top',
		label: mw.msg( 'citoid-citeFromIDDialog-search-label' )
	} );

	lookupFieldset.$element.append(
		lookupActionFieldLayout.$element
	);

	// Citation dialog label
	this.citeDialogLabel = new OO.ui.LabelWidget( {
		// Double-parse
		label: $( '<span>' )
			.addClass( 've-ui-citeFromIdInspector-clickable ve-ui-citeFromIdInspector-dialog-link' )
			.append(
				this.doubleParseMessage(
					'citoid-citeFromIDDialog-use-general-dialog-message',
					'citoid-citeFromIDDialog-use-general-dialog-button'
				)
			)
	} );

	this.lookupPanel.$element
		.append(
			lookupFieldset.$element,
			this.citeDialogLabel.$element
		);

	// Error label
	noticeLabel = new OO.ui.LabelWidget( {
		// Double-parse
		label: $( '<span>' )
			.addClass( 've-ui-citeFromIdInspector-clickable ve-ui-citeFromIdInspector-dialog-error' )
			.append(
				this.doubleParseMessage(
					'citoid-citeFromIDDialog-use-general-error-message',
					'citoid-citeFromIDDialog-use-general-dialog-button'
				)
			)
	} );
	this.noticePanel.$element
		.append( noticeLabel.$element );

	// Preview fieldset
	this.previewSelectWidget = new ve.ui.CiteFromIdGroupWidget();
	this.resultPanel.$element.append( this.previewSelectWidget.$element );

	// Events
	this.lookupInput.connect( this, { change: 'onLookupInputChange' } );
	this.lookupButton.connect( this, { click: 'onLookupButtonClick' } );
	this.previewSelectWidget.connect( this, {
		choose: 'onPreviewSelectWidgetChoose'
	} );

	this.panels.addItems( [
		this.lookupPanel,
		this.resultPanel,
		this.noticePanel
	] );

	this.form.$element.append( this.panels.$element );

	// Attach
	this.form.$element
		.append( this.panels.$element )
		// Connect the dialog link to the event
		.find( '.ve-ui-citeFromIdInspector-clickable a' )
			.click( this.onOpenFullDialogLinkClick.bind( this ) );
};

/**
 * Switch between panels in the inspector
 * @param {string} panel Panel name
 */
ve.ui.CiteFromIdInspector.prototype.switchPanels = function ( panelName ) {
	var panel;

	switch ( panelName ) {
		case 'lookup':
			panel = this.lookupPanel;
			break;
		case 'result':
			panel = this.resultPanel;
			break;
		case 'notice':
			panel = this.noticePanel;
			break;
	}

	this.actions.setMode( panelName );
	this.panels.setItem( panel );
	this.updateSize();
};

/**
 * Double-parse a message to be able to display links inside it.
 * @param {string} wrapperMessage Wrapping message key
 * @param {string} linkMessage Link message key
 * @return {string} The final message, parsed.
 */
ve.ui.CiteFromIdInspector.prototype.doubleParseMessage = function ( wrapperMessage, linkMessage ) {
	var plainMsg, parsedMsg;

	// Once more, with feeling: there's a bug in mw.messages that prevents us from
	// using a link in the message unless we double-parse it.
	// See https://phabricator.wikimedia.org/T49395#490610
	mw.messages.set( {
		'citoid-citeFromIDDialog-temporary-message': '<a href="#">' + mw.message( linkMessage ) + '</a>'
	} );
	plainMsg = mw.message( 'citoid-citeFromIDDialog-temporary-message' ).plain();
	mw.messages.set( { 'citoid-citeFromIDDialog-temporary-message-parsed': plainMsg } );
	parsedMsg = mw.message( 'citoid-citeFromIDDialog-temporary-message-parsed' );
	return mw.message( wrapperMessage, parsedMsg ).parse();
};

/**
 * Respond to full dialog link click
 */
ve.ui.CiteFromIdInspector.prototype.onOpenFullDialogLinkClick = function () {
	var inspector = this,
		fragment = this.getFragment();

	// Preserve the staging
	this.deliveredToAnotherDialog = true;
	this.close().then( function () {
		inspector.getManager().getSurface().execute( 'window', 'open', 'generalreference', {
			fragment: fragment
		} );
	} );
};

/**
 * Respond to form submit.
 */
ve.ui.CiteFromIdInspector.prototype.onFormSubmit = function () {
	this.executeAction( 'lookup' );
	return false;
};

/**
 * Respond to preview select widget choose event
 */
ve.ui.CiteFromIdInspector.prototype.onPreviewSelectWidgetChoose = function ( item ) {
	var fragment,
		surfaceModel = this.getFragment().getSurface(),
		doc = surfaceModel.getDocument(),
		internalList = doc.getInternalList(),
		index = item.getData();

	if ( this.results[ index ] ) {
		// Apply staging
		this.getFragment().getSurface().applyStaging();

		// Gets back contents of <ref> tag
		item = this.referenceModel.findInternalItem( surfaceModel );
		fragment = this.getFragment().clone(
			new ve.dm.LinearSelection( doc, item.getChildren()[ 0 ].getRange() )
		);

		this.results[ index ].transclusionModel.insertTransclusionNode( fragment );
		// HACK: Scorch the earth - this is only needed because without it,
		// the reference list won't re-render properly, and can be removed
		// once someone fixes that
		this.referenceModel.setDocument(
			doc.cloneFromRange(
				internalList.getItemNode( this.referenceModel.getListIndex() ).getRange()
			)
		);
		this.referenceModel.updateInternalItem( surfaceModel );
		this.doneStaging = true;

		// Close the inspector
		this.close();
	}
};

/**
 * Respond to change value of the search input.
 * @param {string} value Current value
 */
ve.ui.CiteFromIdInspector.prototype.onLookupInputChange = function ( value ) {
	if ( this.lookupPromise ) {
		// Abort existing promises
		this.lookupPromise.abort();
		this.lookupPromise = null;
	}
	this.lookupButton.setDisabled( value === '' );
};

/**
 * Respond to lookup button click, perform lookup
 */
ve.ui.CiteFromIdInspector.prototype.onLookupButtonClick = function () {
	this.executeAction( 'lookup' );
};

/**
 * @inheritdoc
 */
ve.ui.CiteFromIdInspector.prototype.getSetupProcess = function ( data ) {
	return ve.ui.CiteFromIdInspector.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			// Reset
			this.lookupPromise = null;
			this.doneStaging = false;
			this.results = [];
			this.lookupButton.setDisabled( true );

			// Stage an empty reference
			this.getFragment().getSurface().pushStaging();

			// Collapse returns a new fragment, so update this.fragment
			this.fragment = this.getFragment().collapseToEnd();

			// Create model
			this.referenceModel = new ve.dm.MWReferenceModel();

			// Insert an empty reference
			this.referenceModel.insertInternalItem( this.getFragment().getSurface() );
			this.referenceModel.insertReferenceNode( this.getFragment() );

			this.switchPanels( 'lookup' );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.CiteFromIdInspector.prototype.getReadyProcess = function ( data ) {
	return ve.ui.LinkInspector.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			// Focus on the input
			this.lookupInput.setDisabled( false ).focus().select();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.CiteFromIdInspector.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.CiteFromIdInspector.super.prototype.getTeardownProcess.call( this, data )
		.first( function () {
			if ( !this.doneStaging ) {
				this.fragment.getSurface().popStaging();
			}

			// Empty the input
			this.lookupInput.setValue( null );

			// Reset
			if ( this.lookupPromise ) {
				this.lookupPromise.abort();
			}
			this.lookupPromise = null;
			this.clearResults();
			this.referenceModel = null;
		}, this );
};

/**
 * Clear the search results
 */
ve.ui.CiteFromIdInspector.prototype.clearResults = function () {
	this.results = [];
	this.previewSelectWidget.clearItems();
	this.updateSize();
};

/**
 * @inheritDoc
 */
ve.ui.CiteFromIdInspector.prototype.getActionProcess = function ( action ) {
	if ( action === 'lookup' ) {
		return new OO.ui.Process( function () {
			// Clear the results
			this.clearResults();
			// Look up
			return this.performLookup();
		}, this );
	}
	if ( action === 'back' ) {
		return new OO.ui.Process( function () {
			// Clear the results
			this.switchPanels( 'lookup' );
		}, this );
	}
	// Fallback to parent handler
	return ve.ui.CiteFromIdInspector.super.prototype.getActionProcess.call( this, action );
};

/**
 * Send a request to the citoid service
 */
ve.ui.CiteFromIdInspector.prototype.performLookup = function () {
	var xhr,
		inspector = this;

	// TODO: Add caching for requested urls
	if ( this.lookupPromise ) {
		// Abort existing lookup
		this.lookupPromise.abort();
		this.lookupPromise = null;
		this.lookupInput.popPending();
	}
	// Set as pending
	this.lookupButton.setDisabled( true );
	this.lookupInput.pushPending();

	// We have to first set up a get response so we can have
	// a proper xhr object with "abort" method, so we can
	// hand off this abort method to the jquery promise
	xhr = this.service
		.get( {
			search: encodeURI( this.lookupInput.getValue() ),
			format: ve.ui.CiteFromIdInspector.static.citoidFormat
		} );

	this.lookupPromise = xhr
		.then(
			// Success
			function ( searchResults ) {
				// Build results
				return inspector.buildTemplateResults( searchResults )
					.then( function () {
						inspector.switchPanels( 'result' );
					} );
			},
			// Fail
			function ( type, response ) {
				if ( response && response.textStatus === 'abort' ) {
					return $.Deferred().reject();
				}
				// Enable the input and lookup button
				inspector.switchPanels( 'notice' );
				return $.Deferred().resolve();
			} )
		.always( function () {
			inspector.lookupInput.popPending();
			inspector.lookupButton.setDisabled( false );
		} )
		.promise( { abort: xhr.abort } );
	return this.lookupPromise;
};

/**
 * Insert filled template based on search results from citoid service
 *
 * @param {Object[]} searchResults Array of citation objects from citoid service
 * @returns {jQuery.Promise} Promise that is resolved when the template part is added
 *  or is rejected if there are any problems with the template name or the internal item.
 */
ve.ui.CiteFromIdInspector.prototype.buildTemplateResults = function ( searchResults ) {
	var i, templateName, citation, result, refWidget,
		renderPromises = [],
		partPromises = [],
		inspector = this;

	for ( i = 0; i < searchResults.length; i++ ) {
		citation = searchResults[i];
		templateName = this.templateTypeMap[ citation.itemType ];

		// if TemplateName is undefined, this means that items of this citoid
		// type does not have a Template defined within the message.
		if ( !templateName ) {
			continue;
		}

		// Create models for this result
		this.results.push( {
			templateName: templateName,
			template: null,
			transclusionModel: new ve.dm.MWTransclusionModel()
		} );
		result = this.results[ this.results.length - 1 ];

		result.template = ve.dm.MWTemplateModel.newFromName( result.transclusionModel, templateName );

		partPromises.push(
			result.transclusionModel.addPart( result.template )
				// Fill in the details for the individual template
				.then( this.populateTemplate.bind( this, result.template, citation ) )
		);
	}

	return $.when.apply( $, partPromises )
		.then( function () {
			var optionWidgets = [];
			// Create option widgets
			for ( i = 0; i < inspector.results.length; i++ ) {
				refWidget = new ve.ui.CiteFromIdReferenceWidget(
					inspector.getFragment().getSurface().getDocument(),
					inspector.results[i].transclusionModel,
					{
						data: i,
						templateName: inspector.results[i].templateName,
						citeTools: inspector.citeTools
					} );
				optionWidgets.push( refWidget );
				renderPromises.push( refWidget.getRenderPromise() );
			}
			// Add to the select widget
			inspector.previewSelectWidget.addItems( optionWidgets );
			return $.when.apply( $, renderPromises );
		} );
};

/**
 * Fills template object parameters with values from the citation object
 *
 * @param {ve.dm.MNTemplateModel} template A template model to fill
 * @param {Object} citation An object that contains values to insert into template
 */
ve.ui.CiteFromIdInspector.prototype.populateTemplate = function ( template, citation ) {
	var citoidField, templateField, i, j,
		spec = template.getSpec(),
		maps = spec.getMaps(),
		map = maps[ ve.ui.CiteFromIdInspector.static.templateDataName ];

	for ( citoidField in map ) {
		templateField = map[ citoidField ];
		// Construct parameters
		if ( typeof templateField === 'string' && citation[ citoidField ] !== undefined ) {
			// Case: Citoid parameter directly equivalent to TemplateData parameter
			template.addParameter( new ve.dm.MWParameterModel( template, templateField, citation[citoidField ] ) );
		} else if ( Array.isArray( citation[ citoidField ] ) ) {
			// Case: Citoid parameter equivalent to 1 or 2D Array of TD parameters
			for ( i = 0; i < citation[ citoidField ].length; i++ ) {
				// Iterate through first dimension of array
				if ( typeof citation[ citoidField ][ i ] === 'string' && templateField[ i ] !== undefined ) {
					// Case: Citoid parameter equivalent to 1D Array of TD parameters
					template.addParameter( new ve.dm.MWParameterModel( template, templateField[ i ], citation[ citoidField ][ i ] ) );
				} else if ( Array.isArray( citation[ citoidField ][ i ] ) ) {
					// Case: Citoid parameter equivalent to 2D Array of TD parameters
					for ( j = 0; j < citation[ citoidField ][ i ].length; j++ ) {
						// Iterate through 2nd dimension of Array
						if ( typeof citation[ citoidField ][ i ][ j ] === 'string' && templateField[ i ] !== undefined && templateField[ i ][ j ] !== undefined ) {
							template.addParameter( new ve.dm.MWParameterModel( template, templateField[ i ][ j ], citation[ citoidField ][ i ][ j ] ) );
						}
					}
				}
			}
		}
	}
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.CiteFromIdInspector );
