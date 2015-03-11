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

	this.referenceModel = null;
	this.transclusionModel = null;
	this.doneStaging = false;
	this.results = [];
	this.citeTools = [];
	this.templateTypeMap = null;
	this.lookupPromise = null;

	this.$element.addClass( 've-ui-citeFromIdInspector' );
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

ve.ui.CiteFromIdInspector.static.actions = [];

/* Methods */

/**
 * @inheritDoc
 */
ve.ui.CiteFromIdInspector.prototype.initialize = function () {
	var lookupActionFieldLayout,
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

	// Preview fieldset
	this.previewSelectWidget = new OO.ui.SelectWidget( {
		classes: [ 've-ui-citeFromIdInspector-preview' ]
	} );
	this.previewSelectWidget.aggregate( { update: 'itemUpdate' } );
	this.previewSelectWidget.toggle( false );

	// Events
	this.lookupInput.connect( this, { change: 'onLookupInputChange' } );
	this.lookupButton.connect( this, { click: 'onLookupButtonClick' } );
	this.previewSelectWidget.connect( this, {
		choose: 'onPreviewSelectWidgetChoose',
		itemUpdate: 'onPreviewSelectWidgetItemUpdate'
	} );

	// Attach
	this.form.$element.append( lookupFieldset.$element, this.previewSelectWidget.$element );
};

/**
 * Respond to form submit.
 */
ve.ui.CiteFromIdInspector.prototype.onFormSubmit = function () {
	this.executeAction( 'lookup' );
	return false;
};

/**
 * Respond to item update event in the preview select widget
 */
ve.ui.CiteFromIdInspector.prototype.onPreviewSelectWidgetItemUpdate = function () {
	this.updateSize();
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
		this.lookupInput.popPending();
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
			this.previewSelectWidget.toggle( false );
			// Stage an empty reference
			this.getFragment().getSurface().pushStaging();

			// Collapse returns a new fragment, so update this.fragment
			this.fragment = this.getFragment().collapseToEnd();

			// Create model
			this.referenceModel = new ve.dm.MWReferenceModel();

			// Insert an empty reference
			this.referenceModel.insertInternalItem( this.getFragment().getSurface() );
			this.referenceModel.insertReferenceNode( this.getFragment() );
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
	// Fallback to parent handler
	return ve.ui.CiteFromIdInspector.super.prototype.getActionProcess.call( this, action );
};

/**
 * Send a request to the citoid service
 * @return {[type]} [description]
 */
ve.ui.CiteFromIdInspector.prototype.performLookup = function () {
	var xhr,
		inspector = this;

	// TODO: Add caching for requested urls
	if ( this.lookupPromise ) {
		// Abort existing lookup
		this.lookupPromise.abort();
		this.lookupInput.popPending();
	}
	// Set as pending
	this.lookupButton.setDisabled( true );
	this.lookupInput.pushPending();
	xhr = new mw.Api().get(
				// Data
				{
					search: encodeURI( inspector.lookupInput.getValue() ),
					format: ve.ui.CiteFromIdInspector.static.citoidFormat
				},
				// Settings
				{
					url: mw.config.get( 'wgCitoidConfig' ).citoidServiceUrl,
					dataType: 'json',
					type: 'GET'
				}
			);
	this.lookupPromise = xhr
		.then(
			// Success
			function ( searchResults ) {
				// Apply staging
				inspector.lookupInput.popPending();
				inspector.lookupButton.setDisabled( false );
				return inspector.buildTemplateResults( searchResults );
			},
			// Fail
			function ( type, response ) {
				var textStatus = response.textStatus;
				// 520 status from citoid means there was no response at the
				// URL provided, but it returns a citation regardless. We're
				// choosing to insert that citation here but to notify the user.
				if ( response.xhr.status === 520 ) {
					// Enable the input and lookup button
					inspector.lookupInput.popPending();
					inspector.lookupButton.setDisabled( false );

					// Notify the user that something went wrong
					mw.notify( mw.message( 'citoid-520-error' ) );

					// Add as a regular web citation
					return inspector.buildTemplateResults( response.xhr.responseJSON );
				} else {
					inspector.lookupInput.popPending();
					inspector.lookupButton.setDisabled( false );
					if ( textStatus !== 'abort' ) {
						mw.notify( mw.msg( 'citoid-unknown-error' ) );
					}
					return new OO.ui.Error( mw.msg( 'citoid-unknown-error' ) );
				}
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
	var i, templateName, citation, result,
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
				optionWidgets.push( new ve.ui.CiteFromIdOptionWidget(
					inspector.getFragment().getSurface().getDocument(),
					{
						data: i,
						transclusionModel: inspector.results[i].transclusionModel,
						templateName: inspector.results[i].templateName,
						citeTools: inspector.citeTools
					} ) );
			}
			// Add to the select widget
			inspector.previewSelectWidget.addItems( optionWidgets );
			inspector.previewSelectWidget.toggle( true );
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
