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
	this.doneStaging = false;
	this.results = [];
	this.citeTools = [];
	this.templateTypeMap = null;
	this.lookupPromise = null;
	this.service = null;
	this.inDialog = '';
	this.currentAutoProcessPanel = null;

	this.$element.addClass( 've-ui-citeFromIdInspector' );
};

/* Inheritance */

OO.inheritClass( ve.ui.CiteFromIdInspector, ve.ui.FragmentInspector );

/* Static properties */

ve.ui.CiteFromIdInspector.static.name = 'citefromid';

ve.ui.CiteFromIdInspector.static.title = OO.ui.deferMsg( 'citoid-citefromiddialog-title' );

ve.ui.CiteFromIdInspector.static.size = 'large';

/**
 * The string used in TemplateData to identify the correct Map object
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.CiteFromIdInspector.static.templateDataName = 'citoid';

/**
 * The requested format from the citoid client, passed as a GET parameter
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.CiteFromIdInspector.static.citoidFormat = 'mediawiki';

ve.ui.CiteFromIdInspector.static.actions = [
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: 'safe',
		modes: [ 'auto-lookup', 'manual', 'reuse' ]
	},
	{
		action: 'back',
		label: OO.ui.deferMsg( 'citoid-citefromiddialog-back' ),
		flags: 'safe',
		modes: [ 'auto-result' ]
	}
];

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

	this.modeSelect = new OO.ui.TabSelectWidget( {
		classes: [ 've-ui-citeFromIdInspector-modeSelect' ],
		items: [
			new OO.ui.TabOptionWidget( {
				data: 'auto',
				label: ve.msg( 'citoid-citefromiddialog-mode-auto' )
			} ),
			new OO.ui.TabOptionWidget( {
				data: 'manual',
				label: ve.msg( 'citoid-citefromiddialog-mode-manual' )
			} ),
			new OO.ui.TabOptionWidget( {
				data: 'reuse',
				label: ve.msg( 'citoid-citefromiddialog-mode-reuse' )
			} )
		]
	} );

	// Modes
	this.modeStack = new OO.ui.StackLayout( {
		expanded: false,
		scrollable: false
	} );

	this.modePanels = {
		auto: new OO.ui.PanelLayout( {
			classes: [ 'citoid-citeFromIDDialog-panel-auto' ],
			expanded: false,
			scrollable: false
		} ),
		manual: new OO.ui.PanelLayout( {
			classes: [ 'citoid-citeFromIDDialog-panel-manual' ],
			expanded: false,
			scrollable: false
		} ),
		reuse: new OO.ui.PanelLayout( {
			classes: [ 'citoid-citeFromIDDialog-panel-reuse' ],
			expanded: false,
			scrollable: false
		} )
	};

	// Auto mode
	this.autoProcessStack = new OO.ui.StackLayout( {
		expanded: false,
		scrollable: false
	} );

	this.autoProcessPanels = {
		lookup: new OO.ui.PanelLayout( {
			classes: [ 'citoid-citeFromIDDialog-panel-lookup' ],
			expanded: false,
			scrollable: false
		} ),
		result: new OO.ui.PanelLayout( {
			classes: [ 'citoid-citeFromIDDialog-panel-result' ],
			expanded: false,
			scrollable: false
		} )
	};

	// Lookup fieldset
	this.lookupInput = new OO.ui.TextInputWidget( {
		multiline: false,
		placeholder: ve.msg( 'citoid-citefromiddialog-search-placeholder' )
	} );

	this.lookupButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'citoid-citefromiddialog-lookup-button' )
	} );
	lookupActionFieldLayout = new OO.ui.ActionFieldLayout( this.lookupInput, this.lookupButton, {
		align: 'top',
		label: ve.msg( 'citoid-citefromiddialog-search-label' )
	} );

	lookupFieldset.$element.append(
		lookupActionFieldLayout.$element
	);

	// Error label
	this.$noticeLabel = $( '<div>' ).addClass( 've-ui-citeFromIdInspector-dialog-error oo-ui-element-hidden' ).text(
		ve.msg( 'citoid-citefromiddialog-use-general-error-message' )
	);

	this.autoProcessPanels.lookup.$element.append( lookupFieldset.$element, this.$noticeLabel );

	this.modePanels.auto.$element.append( this.autoProcessStack.$element );

	// Preview fieldset
	this.previewSelectWidget = new ve.ui.CiteFromIdGroupWidget();
	this.autoProcessPanels.result.$element.append( this.previewSelectWidget.$element );

	// Manual mode
	this.sourceSelect = new ve.ui.MWReferenceSourceSelectWidget( {
		classes: [ 've-ui-citeFromIdInspector-sourceSelect' ]
	} );
	this.modePanels.manual.$element.append( this.sourceSelect.$element );

	// Re-use mode
	this.search = new ve.ui.MWReferenceSearchWidget( {
		classes: [ 've-ui-citeFromIdInspector-search' ]
	} );
	this.modePanels.reuse.$element.append( this.search.$element );

	// Events
	this.modeSelect.connect( this, { choose: 'onModeSelectChoose' } );
	this.lookupInput.connect( this, {
		change: 'onLookupInputChange',
		enter: 'onLookupButtonClick'
	} );
	this.lookupButton.connect( this, { click: 'onLookupButtonClick' } );
	this.previewSelectWidget.connect( this, { choose: 'onPreviewSelectWidgetChoose' } );
	this.sourceSelect.connect( this, { choose: 'onSourceSelectChoose' } );
	this.search.connect( this, { select: 'onSearchSelect' } );

	this.autoProcessStack.addItems( [
		this.autoProcessPanels.lookup,
		this.autoProcessPanels.result
	] );

	this.modeStack.addItems( [
		this.modePanels.auto,
		this.modePanels.manual,
		this.modePanels.reuse
	] );

	// Attach
	this.form.$element
		.addClass( 've-ui-citeFromIdInspector-form' )
		.append( this.modeSelect.$element, this.modeStack.$element );
};

/**
 * Handle choose events from mode select widget
 *
 * @param {OO.ui.OptionWidget} item Chosen option
 */
ve.ui.CiteFromIdInspector.prototype.onModeSelectChoose = function ( item ) {
	this.setModePanel( item.getData(), null, true );
};

/**
 * Switch to a specific mode panel
 *
 * @param {string} panelName Panel name
 * @param {boolean} [fromSelect] Mode was changed by the select widget
 * @param {boolean} [fromSelect] Mode was changed by the select widget
 */
ve.ui.CiteFromIdInspector.prototype.setModePanel = function ( panelName, processPanelName, fromSelect ) {
	this.modeStack.setItem( this.modePanels[panelName] );
	switch ( panelName ) {
		case 'auto':
			processPanelName = processPanelName || this.currentAutoProcessPanel || 'lookup';
			this.autoProcessStack.setItem( this.autoProcessPanels[processPanelName] );
			if ( processPanelName === 'lookup' ) {
				this.lookupInput.setDisabled( false ).focus().select();
			}
			this.currentAutoProcessPanel = processPanelName;
			break;
		case 'reuse':
			this.search.buildIndex();
			this.search.getQuery().focus();
			break;
	}
	// Result panel goes 'fullscreen', hiding the tab widget
	// TODO: Do this in a less hacky way
	this.modeSelect.toggle( !( processPanelName && processPanelName === 'result' ) );
	if ( !fromSelect ) {
		this.modeSelect.selectItemByData( panelName );
	}
	this.actions.setMode( panelName + ( processPanelName ? '-' + processPanelName : '' ) );
	this.updateSize();
};

/**
 * Handle source select choose events
 *
 * @param {OO.ui.OptionWidget} item Chosen item
 */
ve.ui.CiteFromIdInspector.prototype.onSourceSelectChoose = function ( item ) {
	var data = item.getData(),
		// Closing the dialog may unset some properties, so cache the ones we want
		fragment = this.getFragment(),
		manager = this.getManager();

	// Close this dialog then open the new dialog
	this.close().then( function () {
		manager.getSurface().execute( 'mwcite', 'open', data.windowName, $.extend( {
			fragment: fragment
		}, data.dialogData ) );
	} );
};

/**
 * Handle search select events.
 *
 * @param {ve.dm.MWReferenceModel|null} ref Reference model or null if no item is selected
 */
ve.ui.CiteFromIdInspector.prototype.onSearchSelect = function ( ref ) {
	if ( ref instanceof ve.dm.MWReferenceModel ) {
		ref.insertReferenceNode( this.getFragment() );
		this.getFragment().getSurface().applyStaging();
	}
};

/**
 * Respond to preview select widget choose event
 */
ve.ui.CiteFromIdInspector.prototype.onPreviewSelectWidgetChoose = function ( item ) {
	var fragment = this.fragment,
		surfaceModel = this.getFragment().getSurface(),
		doc = surfaceModel.getDocument(),
		internalList = doc.getInternalList(),
		index = item.getData();

	if ( this.results[ index ] ) {
		// Gets back contents of <ref> tag
		if ( this.inDialog !== 'reference' ) {
			item = this.referenceModel.findInternalItem( surfaceModel );
			fragment = this.getFragment().clone(
				new ve.dm.LinearSelection( doc, item.getChildren()[ 0 ].getRange() )
			);
		}

		this.results[ index ].transclusionModel.insertTransclusionNode( fragment );

		if ( this.inDialog !== 'reference' ) {
			// HACK: Scorch the earth - this is only needed because without it,
			// the reference list won't re-render properly, and can be removed
			// once someone fixes that
			this.referenceModel.setDocument(
				doc.cloneFromRange(
					internalList.getItemNode( this.referenceModel.getListIndex() ).getRange()
				)
			);
			this.referenceModel.updateInternalItem( surfaceModel );

			// Apply staging
			this.getFragment().getSurface().applyStaging();
			this.doneStaging = true;
		}
		// Close the inspector
		this.close();
	}
};

/**
 * Respond to change value of the search input.
 *
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
			this.inDialog = data.inDialog || '';

			// Collapse returns a new fragment, so update this.fragment
			this.fragment = this.getFragment().collapseToEnd();

			// Create model
			this.referenceModel = new ve.dm.MWReferenceModel();

			this.search.setInternalList( this.getFragment().getDocument().getInternalList() );
			this.modeSelect.getItemFromData( 'reuse' ).setDisabled( this.search.isIndexEmpty() );

			if ( this.inDialog !== 'reference' ) {
				// Stage an empty reference
				this.getFragment().getSurface().pushStaging();

				// Insert an empty reference
				this.referenceModel.insertInternalItem( this.getFragment().getSurface() );
				this.referenceModel.insertReferenceNode( this.getFragment(), true );
			}

			this.modeSelect.selectItemByData( 'auto' );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.CiteFromIdInspector.prototype.getReadyProcess = function ( data ) {
	return ve.ui.CiteFromIdInspector.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			// Set the panel after ready as it focuses the input too
			this.setModePanel( 'auto', 'lookup' );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.CiteFromIdInspector.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.CiteFromIdInspector.super.prototype.getTeardownProcess.call( this, data )
		.first( function () {
			if ( !this.doneStaging && this.inDialog !== 'reference' ) {
				this.fragment.getSurface().popStaging();
			}

			// Empty the input
			this.lookupInput.setValue( null );

			// Clear selection
			this.sourceSelect.selectItem();

			// Reset
			if ( this.lookupPromise ) {
				this.lookupPromise.abort();
			}
			this.lookupPromise = null;
			this.clearResults();
			this.referenceModel = null;
			this.currentAutoProcessPanel = null;
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
			this.setModePanel( 'auto', 'lookup' );
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
			search: this.lookupInput.getValue(),
			format: ve.ui.CiteFromIdInspector.static.citoidFormat
		} );

	this.lookupPromise = xhr
		.then(
			// Success
			function ( searchResults ) {
				// Build results
				return inspector.buildTemplateResults( searchResults )
					.then( function () {
						inspector.setModePanel( 'auto', 'result' );
					} );
			},
			// Fail
			function ( type, response ) {
				if ( response && response.textStatus === 'abort' ) {
					return $.Deferred().reject();
				}
				// Enable the input and lookup button
				inspector.$noticeLabel.removeClass( 'oo-ui-element-hidden' );
				inspector.lookupInput.once( 'change', function () {
					inspector.$noticeLabel.addClass( 'oo-ui-element-hidden' );
					inspector.updateSize();
				} ).setValidityFlag( false );
				inspector.updateSize();
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
