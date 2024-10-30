/**
 * Inspector to insert filled references using citoid service
 *
 * @class
 * @extends ve.ui.NodeInspector
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.CitoidInspector = function VeUiCitoidInspector( config ) {
	// Parent constructor
	ve.ui.CitoidInspector.super.call( this, ve.extendObject( { padded: false }, config ) );

	this.referenceModel = null;
	this.staging = 0;
	this.stagedReference = false;
	this.results = [];
	this.citeTools = [];
	this.templateTypeMap = null;
	this.lookupPromise = null;
	this.fullRestbaseUrl = null;
	this.service = null;
	this.serviceConfig = null;
	this.serviceUrl = null;
	this.inDialog = '';
	this.currentAutoProcessPanel = null;

	this.$element.addClass( 've-ui-citoidInspector' );
};

/* Inheritance */

OO.inheritClass( ve.ui.CitoidInspector, ve.ui.NodeInspector );

/* Static properties */

ve.ui.CitoidInspector.static.name = 'citoid';

ve.ui.CitoidInspector.static.title = OO.ui.deferMsg( 'citoid-citoiddialog-title' );

ve.ui.CitoidInspector.static.size = 'large';

ve.ui.CitoidInspector.static.modelClasses = [ ve.dm.MWReferenceNode ];

/**
 * The string used in TemplateData to identify the correct Map object
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.CitoidInspector.static.templateDataName = 'citoid';

/**
 * The requested format from the citoid client, passed as a GET parameter
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.CitoidInspector.static.citoidFormat = 'mediawiki';

ve.ui.CitoidInspector.static.actions = [
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: [ 'safe', 'close' ],
		modes: [ 'auto-lookup', 'manual', 'reuse' ]
	},
	{
		action: 'back',
		label: OO.ui.deferMsg( 'citoid-citoiddialog-back' ),
		flags: [ 'safe', 'back' ],
		modes: [ 'auto-result-single', 'auto-result-multi', 'auto-result-error' ]
	},
	{
		action: 'insert',
		label: OO.ui.deferMsg( 'citoid-citation-widget-insert-button' ),
		flags: [ 'progressive', 'primary' ],
		modes: [ 'auto-result-single' ]
	}
];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.CitoidInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.CitoidInspector.super.prototype.initialize.call( this );

	this.dialogs = new ve.ui.WindowManager( { factory: ve.ui.windowFactory } );
	$( OO.ui.getTeleportTarget() ).append( this.dialogs.$element );

	this.templateTypeMap = ve.ui.mwCitoidMap;
	this.citeTools = ve.ui.mwCitationTools;

	// Restbase URL, also used as Bool to determine whether or not to use Restbase for citoid
	this.fullRestbaseUrl = mw.config.get( 'wgCitoidConfig' ).fullRestbaseUrl;

	// API config for citoid service if VE is using Restbase
	if ( this.fullRestbaseUrl ) {
		this.serviceUrl = this.fullRestbaseUrl + 'v1/data/citation/' + ve.ui.CitoidInspector.static.citoidFormat;
		this.serviceConfig = {
			ajax: {
				// Request content language of wiki from citoid service
				headers: { 'accept-language': mw.config.get( 'wgContentLanguage' ) },
				timeout: 20 * 1000, // 20 seconds
				type: 'GET'
			}
		};
	} else {
		// API for citoid service if not using Restbase; uses citoidServiceURL in extension.json instead
		this.service = new mw.Api( {
			ajax: {
				url: mw.config.get( 'wgCitoidConfig' ).citoidServiceUrl,
				// Request content language of wiki from citoid service
				headers: { 'accept-language': mw.config.get( 'wgContentLanguage' ) },
				timeout: 20 * 1000, // 20 seconds
				type: 'GET'
			}
		} );
	}

	// Modes
	this.modeIndex = new OO.ui.IndexLayout( {
		expanded: false,
		scrollable: false
	} );

	this.modePanels = {
		auto: new OO.ui.TabPanelLayout( 'auto', {
			label: ve.msg( 'citoid-citoiddialog-mode-auto' ),
			classes: [ 'citoid-citoidDialog-panel-auto' ],
			padded: true,
			expanded: false,
			scrollable: false
		} ),
		manual: new OO.ui.TabPanelLayout( 'manual', {
			label: ve.msg( 'citoid-citoiddialog-mode-manual' ),
			classes: [ 'citoid-citoidDialog-panel-manual' ],
			padded: true,
			expanded: false,
			scrollable: false
		} ),
		reuse: new OO.ui.TabPanelLayout( 'reuse', {
			label: ve.msg( 'citoid-citoiddialog-mode-reuse' ),
			classes: [ 'citoid-citoidDialog-panel-reuse' ],
			expanded: false,
			scrollable: false
		} )
	};

	this.modeIndex.addTabPanels( [
		this.modePanels.auto,
		this.modePanels.manual,
		this.modePanels.reuse
	] );

	this.modeIndex.getTabPanel( 'auto' ).tabItem.setDisabled( !this.templateTypeMap );
	this.defaultPanel = this.templateTypeMap ? 'auto' : 'manual';

	// Auto mode
	this.autoProcessStack = new OO.ui.StackLayout( {
		expanded: false,
		scrollable: false
	} );

	this.autoProcessPanels = {
		lookup: new OO.ui.PanelLayout( {
			classes: [ 'citoid-citoidDialog-panel-lookup' ],
			expanded: false,
			scrollable: false
		} ),
		result: new OO.ui.PanelLayout( {
			classes: [ 'citoid-citoidDialog-panel-result' ],
			expanded: false,
			scrollable: false
		} )
	};

	// Lookup field
	this.lookupInput = new OO.ui.TextInputWidget( {
		placeholder: ve.msg( 'citoid-citoiddialog-search-placeholder' )
	} );

	this.lookupButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'citoid-citoiddialog-lookup-button' )
	} );
	const lookupActionFieldLayout = new OO.ui.ActionFieldLayout( this.lookupInput, this.lookupButton, {
		align: 'top',
		label: ve.msg( 'citoid-citoiddialog-search-label' )
	} );

	const isbnEnabledPlatforms = mw.config.get( 'wgCitoidConfig' ).isbnScannerEnabled || {};
	const isbnEnabled = !!isbnEnabledPlatforms[ OO.ui.isMobile() ? 'mobile' : 'desktop' ];
	const isbnSupported =
		// Reflects browser security policy
		( location.protocol === 'https:' || location.hostname === 'localhost' ) &&
		navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

	this.isbnButton = new ve.ui.ISBNScannerButtonWidget( { disabled: !isbnSupported } );
	this.isbnButton.on( 'detected', ( isbn ) => {
		this.fromScan = true;
		this.lookupInput.setValue( isbn );
		this.lookupInput.once( 'change', () => {
			this.fromScan = false;
		} );
		this.executeAction( 'lookup' );
	} );
	const isbnButtonFieldLayout = new OO.ui.FieldLayout( this.isbnButton );

	// Citoid API error message
	this.errorMessage = new OO.ui.MessageWidget( {
		classes: [ 've-ui-citoidInspector-error' ],
		type: 'error',
		inline: true
	} ).toggle( false );

	this.errorMessage.$element.append( $( '<p>' ).text( ve.msg( 'citoid-citoiddialog-use-general-error-message-body' ) ) );

	const manualButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'citoid-citoiddialog-manual-button' ),
		flags: [ 'progressive' ]
	} );
	manualButton.on( 'click', () => {
		ve.track( 'activity.' + this.constructor.static.name, { action: 'automatic-generate-manual-fallback' } );
		this.modeIndex.setTabPanel( 'manual' );
	} );

	this.errorMessage.$element.append( $( '<p>' ).append( manualButton.$element ) );

	this.autoProcessPanels.lookup.$element.append(
		lookupActionFieldLayout.$element,
		isbnEnabled ? isbnButtonFieldLayout.$element : undefined,
		this.errorMessage.$element
	);

	this.modePanels.auto.$element.append( this.autoProcessStack.$element );

	// Preview fieldset
	this.previewSelectWidget = new ve.ui.CitoidGroupWidget();
	this.resultError = new OO.ui.MessageWidget( {
		$label: $( '<div>' ),
		classes: [ 've-ui-citoidInspector-resultError' ],
		type: 'error'
	} ).toggle( false );
	this.autoProcessPanels.result.$element.append(
		this.previewSelectWidget.$element,
		this.resultError.$element
	);

	// Credit field
	this.credit = new OO.ui.LabelWidget( {
		classes: [ 've-ui-citoidInspector-credit' ]
	} );
	this.previewSelectWidget.$element.append( this.credit.$element );

	// Manual mode
	this.sourceSelect = new ve.ui.CiteSourceSelectWidget( {
		classes: [ 've-ui-citoidInspector-sourceSelect' ]
	} );
	this.modePanels.manual.$element.append( this.sourceSelect.$element );

	// Re-use mode
	this.reuseSearch = new ve.ui.MWReferenceSearchWidget( {
		classes: [ 've-ui-citoidInspector-search' ],
		$overlay: this.$overlay
	} );
	this.modePanels.reuse.$element.append( this.reuseSearch.$element );

	// Events
	this.modeIndex.connect( this, { set: 'onModeIndexSet' } );
	this.lookupInput.connect( this, {
		change: 'onLookupInputChange',
		enter: 'onLookupInputEnter'
	} );
	this.lookupButton.connect( this, { click: 'onLookupButtonClick' } );
	this.previewSelectWidget.connect( this, { choose: 'onPreviewSelectWidgetChoose' } );
	this.sourceSelect.connect( this, { choose: 'onSourceSelectChoose' } );
	this.reuseSearch.connect( this, {
		reuse: 'onReuseSearchResultsReuse',
		extends: 'onReuseSearchResultsExtends'
	} );

	this.autoProcessStack.addItems( [
		this.autoProcessPanels.lookup,
		this.autoProcessPanels.result
	] );

	// Attach
	this.form.$element
		.addClass( 've-ui-citoidInspector-form' )
		.append( this.modeIndex.$element );
};

/**
 * Handle set events from mode index layout
 *
 * @param {OO.ui.TabPanelLayout} tabPanel Set tab panel
 */
ve.ui.CitoidInspector.prototype.onModeIndexSet = function ( tabPanel ) {
	// Switching tabs by directly calling this.modeIndex.setTabPanel will
	// double-fire this event, so filter out the second call:
	if ( tabPanel.getName() !== this.lastModePanelName ) {
		this.setModePanel( tabPanel.getName(), null, true );
		this.lastModePanelName = tabPanel.getName();
	}
};

/**
 * Switch to a specific mode panel
 *
 * @param {string} tabPanelName Panel name, 'auto', 'manual' or 'reuse'
 * @param {string} [processPanelName] Process panel name, 'lookup' or 'result'
 * @param {boolean} [fromSelect] Mode was changed by the select widget
 * @param {Object} [config] Mode-specific config
 */
ve.ui.CitoidInspector.prototype.setModePanel = function ( tabPanelName, processPanelName, fromSelect, config ) {
	if ( [ 'auto', 'manual', 'reuse' ].indexOf( tabPanelName ) === -1 ) {
		tabPanelName = this.defaultPanel;
	} else if ( this.modeIndex.getTabPanel( tabPanelName ).tabItem.isDisabled() ) {
		tabPanelName = this.defaultPanel;
	} else if ( tabPanelName !== ( ve.userConfig( 'citoid-mode' ) || this.defaultPanel ) ) {
		ve.userConfig( 'citoid-mode', tabPanelName );
	}

	if ( !fromSelect ) {
		this.modeIndex.setTabPanel( tabPanelName );
	}
	let panelNameModifier;
	let focusTarget;
	switch ( tabPanelName ) {
		case 'auto':
			processPanelName = processPanelName || this.currentAutoProcessPanel || 'lookup';
			this.autoProcessStack.setItem( this.autoProcessPanels[ processPanelName ] );
			switch ( processPanelName ) {
				case 'lookup':
					this.lookupInput.setDisabled( false ).select();
					break;
				case 'result': {
					const isSingle = this.previewSelectWidget.items.length === 1;
					if ( config.hasError ) {
						panelNameModifier = 'error';
					} else {
						panelNameModifier = isSingle ? 'single' : 'multi';
					}
					this.previewSelectWidget.$element.toggleClass( 've-ui-citoidInspector-preview-single', isSingle );
					focusTarget = isSingle ?
						this.actions.get( { flags: 'primary' } )[ 0 ] :
						this.previewSelectWidget.items[ 0 ];
					break;
				}
			}
			this.currentAutoProcessPanel = processPanelName;
			break;
		case 'reuse':
			this.reuseSearch.buildIndex();
			// Don't auto-focus on mobile as the keyboard
			// covers the search results.
			if ( !OO.ui.isMobile() ) {
				focusTarget = this.reuseSearch.getQuery();
			}
			break;
	}
	// Result tab panel goes 'fullscreen' by hiding the tab widget
	// TODO: Do this in a less hacky way
	this.modeIndex.toggleMenu( !( processPanelName && processPanelName === 'result' ) );
	this.actions.setMode(
		tabPanelName +
		( processPanelName ? '-' + processPanelName : '' ) +
		( panelNameModifier ? '-' + panelNameModifier : '' )
	);
	this.updateSize();
	// Hiding the menu is a 200ms transition, so resize again
	setTimeout( () => {
		this.updateSize();
	}, 200 );

	if ( focusTarget ) {
		focusTarget.focus();
	}

	if ( this.isActive ) {
		ve.track( 'activity.' + this.constructor.static.name, { action: 'panel-switch' } );

		// https://phabricator.wikimedia.org/T362347
		ve.track(
			'activity.' + this.constructor.static.name,
			{ action: 'panel-switch-' + tabPanelName }
		);
	}
};

/**
 * Handle source select choose events
 *
 * @param {OO.ui.OptionWidget} item Chosen item
 */
ve.ui.CitoidInspector.prototype.onSourceSelectChoose = function ( item ) {
	const commandName = item.getData(),
		surface = this.getManager().getSurface();

	ve.track( 'activity.' + this.constructor.static.name, { action: 'manual-choose' } );

	// Close this dialog then open the new dialog
	this.close( { action: 'manual-choose' } ).closed.then( () => {
		const command = ve.ui.commandRegistry.lookup( commandName );
		command.execute( surface );
	} );
};

/**
 * Handle reuse search results choose events.
 *
 * @param {ve.dm.MWReferenceModel} ref Chosen item
 */
ve.ui.CitoidInspector.prototype.onReuseSearchResultsReuse = function ( ref ) {
	ref.insertReferenceNode( this.getFragment() );
	// The insertion above collapses the document selection around the placeholder.
	// As inspector's don't auto-select when closing, we need to manually re-select here.
	// TODO: This should probably be fixed upstream.
	this.getFragment().select();
	while ( this.staging ) {
		this.getFragment().getSurface().applyStaging();
		this.staging--;
	}

	ve.track( 'activity.' + this.constructor.static.name, { action: 'reuse-choose' } );

	this.close( { action: 'reuse-choose' } );
};

/**
 * Handle extends search results choose events.
 *
 * @param {ve.dm.MWReferenceModel} originalRef Chosen item
 */
ve.ui.CitoidInspector.prototype.onReuseSearchResultsExtends = function ( originalRef ) {
	this.dialogs
		.openWindow( 'reference', {
			fragment: this.getFragment(),
			createSubRef: originalRef
		} )
		.closing.then( ( data ) => {
			if ( data && data.action && data.action === 'insert' ) {
				while ( this.staging ) {
					this.getFragment().getSurface().applyStaging();
					this.staging--;
				}

				this.close( { action: 'extends-choose' } );
			}
		} );
};

/**
 * Respond to preview select widget choose event
 *
 * @param {ve.ui.MWReferenceResultWidget} item Chosen item
 */
ve.ui.CitoidInspector.prototype.onPreviewSelectWidgetChoose = function ( item ) {
	const surfaceModel = this.getFragment().getSurface(),
		doc = surfaceModel.getDocument(),
		internalList = doc.getInternalList(),
		index = item.getData();

	let fragment = this.fragment;
	if ( this.results[ index ] ) {
		// Gets back contents of <ref> tag
		if ( this.inDialog !== 'reference' ) {
			item = this.referenceModel.findInternalItem( surfaceModel );
			fragment = this.getFragment().clone(
				new ve.dm.LinearSelection( item.getChildren()[ 0 ].getRange() )
			);
		}

		this.results[ index ].transclusionModel.insertTransclusionNode( fragment, 'inline' );

		if ( this.stagedReference ) {
			// Remove placeholder status
			this.getFragment().changeAttributes( { placeholder: false } );

			// HACK: Scorch the earth - this is only needed because without it,
			// the reference list won't re-render properly, and can be removed
			// once someone fixes that
			this.referenceModel.setDocument(
				doc.cloneFromRange(
					internalList.getItemNode( this.referenceModel.getListIndex() ).getRange()
				)
			);
			this.referenceModel.updateInternalItem( surfaceModel );
			this.stagedReference = false;
		}

		// Apply staging
		while ( this.staging ) {
			surfaceModel.applyStaging();
			this.staging--;
		}

		ve.track( 'activity.' + this.constructor.static.name, { action: 'automatic-insert' } );
		if ( this.fromScan ) {
			ve.track( 'activity.' + ve.ui.ISBNScannerDialog.static.name, { action: 'result-inserted' } );
		}

		// Force a context change to show the correct context item as we may
		// have changed from a plain reference to a templated citation
		surfaceModel.emitContextChange();
		// Close the inspector
		this.close( { action: 'automatic-insert' } );
	}
};

/**
 * Respond to change value of the search input.
 *
 * @param {string} value Current value
 */
ve.ui.CitoidInspector.prototype.onLookupInputChange = function ( value ) {
	if ( this.lookupPromise ) {
		// Abort existing promises
		this.lookupPromise.abort();
		this.lookupPromise = null;
	}
	this.lookupButton.setDisabled( value === '' );
};

/**
 * Handle enter events from the lookup input
 */
ve.ui.CitoidInspector.prototype.onLookupInputEnter = function () {
	if ( !this.lookupButton.isDisabled() ) {
		this.onLookupButtonClick();
	}
};

/**
 * Handle click events from the lookup button, perform lookup
 */
ve.ui.CitoidInspector.prototype.onLookupButtonClick = function () {
	this.executeAction( 'lookup' );

	ve.track( 'activity.' + this.constructor.static.name, { action: 'automatic-generate' } );
};

/**
 * @inheritdoc
 */
ve.ui.CitoidInspector.prototype.getSetupProcess = function ( data ) {
	return ve.ui.CitoidInspector.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			this.isActive = false;

			// Reset
			this.lookupPromise = null;
			this.staging = 0;
			this.stagedReference = false;
			this.results = [];
			this.lookupButton.setDisabled( true );
			this.inDialog = data.inDialog || '';
			this.replaceRefNode = data.replace && this.getSelectedNode();
			this.fromScan = false;
			if ( data.inStaging ) {
				this.staging++;
			}

			// Collapse returns a new fragment, so update this.fragment
			if ( !data.replace ) {
				this.fragment = this.getFragment().collapseToEnd().select();
			}

			this.reuseSearch.setInternalList( this.getFragment().getDocument().getInternalList() );
			this.modeIndex.getTabPanel( 'reuse' ).tabItem.setDisabled( this.reuseSearch.isIndexEmpty() );

			if ( this.replaceRefNode ) {
				this.referenceModel = ve.dm.MWReferenceModel.static.newFromReferenceNode( this.replaceRefNode );
			} else {
				// Create model
				this.referenceModel = new ve.dm.MWReferenceModel( this.fragment.getDocument() );

				if ( this.inDialog !== 'reference' ) {
					this.staging++;
					this.stagedReference = true;
					const fragment = this.getFragment();
					// Stage an empty reference
					fragment.getSurface().pushStaging();

					// Insert an empty reference
					this.referenceModel.insertInternalItem( fragment.getSurface() );
					this.referenceModel.insertReferenceNode( fragment, true );
					fragment.select();
				}
			}

			if ( data.replace ) {
				this.title
					.setLabel( ve.msg( 'citoid-citoiddialog-title-replace' ) )
					.setTitle( ve.msg( 'citoid-citoiddialog-title-replace' ) );
			}

			if ( data.lookup ) {
				this.lookupInput.setValue( data.lookup );
				this.executeAction( 'lookup' );
			}

			this.modeIndex.setTabPanel( data.lookup ? this.defaultPanel : ( ve.userConfig( 'citoid-mode' ) || this.defaultPanel ) );
		} );
};

/**
 * @inheritdoc
 */
ve.ui.CitoidInspector.prototype.getReadyProcess = function ( data ) {
	return ve.ui.CitoidInspector.super.prototype.getReadyProcess.call( this, data )
		.next( () => {
			// Set the panel after ready as it focuses the input too
			const mode = data.lookup ? this.defaultPanel : ( ve.userConfig( 'citoid-mode' ) || this.defaultPanel );
			this.setModePanel( mode, mode === 'auto' ? 'lookup' : undefined );

			this.isActive = true;
		} );
};

/**
 * @inheritdoc
 */
ve.ui.CitoidInspector.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.CitoidInspector.super.prototype.getTeardownProcess.call( this, data )
		.first( () => {
			// Always pop the first piece of staging (creating a dummy reference)
			if ( this.staging ) {
				this.fragment.getSurface().popStaging();
				this.staging--;
			}
			while ( this.staging ) {
				// If we are switching to manual mode, apply any pre-dialog staged
				// changes, such as the citation-needed-inline conversion.
				// TODO: Ideally we would pass on this staging state to the next dialog
				// so it could be reverted if the next dialog is closed.
				if ( data && data.action === 'manual-choose' ) {
					this.fragment.getSurface().applyStaging();
				} else {
					this.fragment.getSurface().popStaging();
				}
				this.staging--;
			}

			// Empty the input
			this.lookupInput.setValue( null );

			// Clear selection
			this.sourceSelect.selectItem();

			// Clear credit line
			this.credit.setLabel( null );

			// Reset
			if ( this.lookupPromise ) {
				this.lookupPromise.abort();
			}
			this.lookupPromise = null;
			this.clearResults();
			this.reuseSearch.clearSearch();
			this.referenceModel = null;
			this.currentAutoProcessPanel = null;
		} );
};

/**
 * Clear the search results
 */
ve.ui.CitoidInspector.prototype.clearResults = function () {
	this.results = [];
	this.previewSelectWidget.clearItems();
	this.updateSize();
};

/**
 * @inheritdoc
 */
ve.ui.CitoidInspector.prototype.getActionProcess = function ( action ) {
	if ( action === 'lookup' ) {
		return new OO.ui.Process( () => {
			// Clear the results
			this.clearResults();
			// Common case: entering a number here and assuming it'll work to reuse an existing citation:
			const search = this.lookupInput.getValue();
			if ( !isNaN( search ) && parseInt( search, 10 ) < 1000 ) {
				// Fairly arbitrary limitation assuming that numbers below 1000 aren't going to refer to anything else.
				this.setModePanel( 'reuse' );
				this.reuseSearch.query.setValue( search );
				return;
			}
			// Look up
			return this.performLookup();
		} );
	}
	if ( action === 'back' ) {
		return new OO.ui.Process( () => {
			// Clear the results
			this.setModePanel( 'auto', 'lookup' );
			// Clear credit line
			this.credit.setLabel( null );
		} );
	}
	if ( action === 'insert' ) {
		return new OO.ui.Process( () => {
			// The 'insert' option when only one result is shown
			this.onPreviewSelectWidgetChoose( this.previewSelectWidget.items[ 0 ] );
		} );
	}
	// Fallback to parent handler
	return ve.ui.CitoidInspector.super.prototype.getActionProcess.call( this, action );
};

/**
 * Send a request to the citoid service
 *
 * @return {jQuery.Promise} Lookup promise
 */
ve.ui.CitoidInspector.prototype.performLookup = function () {
	// TODO: Add caching for requested urls
	if ( this.lookupPromise ) {
		// Abort existing lookup
		this.lookupPromise.abort();
		this.lookupPromise = null;
		this.lookupInput.popPending();
	}
	// Set as pending
	this.lookupButton.setDisabled( true );
	this.lookupInput.setDisabled( true ).pushPending();

	// Common case: pasting a URI into this field. Citoid expects
	// minimally encoded input, so do some speculative decoding here to
	// avoid 404 fetches. T146539
	const search = ve.safeDecodeURIComponent(
		this.lookupInput.getValue()
	);

	// We have to first set up a get response so we can have
	// a proper xhr object with "abort" method, so we can
	// hand off this abort method to the jquery promise

	let citoidXhr;
	if ( this.fullRestbaseUrl ) {
		// Use restbase endpoint
		this.serviceConfig.ajax.url = this.serviceUrl + '/' + encodeURIComponent( search );
		citoidXhr = new mw.Api( this.serviceConfig ).get();
	} else {
		// Use standalone citoid service
		citoidXhr = this.service
			.get( {
				search: search,
				format: ve.ui.CitoidInspector.static.citoidFormat
			} );
	}

	let reliabilityXhr;
	this.lookupPromise = citoidXhr
		.then(
			// Success
			( searchResults ) => {
				const url = OO.getProp( searchResults, 0, 'url' );
				// TODO: Handle multiple results (not currently returned by our providers)
				if ( url ) {
					reliabilityXhr = new mw.Api().get( {
						action: 'editcheckreferenceurl',
						url: url,
						page: mw.config.get( 'wgRelevantPageName' ),
						formatversion: 2
					} );
				} else {
					reliabilityXhr = $.Deferred().resolve().promise();
				}
				return reliabilityXhr.then( ( reliablityResults ) => {
					let hasError = false;

					if ( reliablityResults && reliablityResults.editcheckreferenceurl[ url ] === 'blocked' ) {
						const backButton = new OO.ui.ButtonWidget( {
							flags: [ 'primary', 'progressive' ],
							label: ve.msg( 'citoid-citoiddialog-reliability-back' )
						} ).on( 'click', () => {
							this.executeAction( 'back' );
							ve.track( 'activity.editCheckReliability', { action: 'edit-check-confirm' } );
						} );

						this.resultError.setLabel( $( '<div>' ).append(
							$( '<strong>' ).text( ve.msg( 'citoid-citoiddialog-reliability-unreliable-title' ) ),
							$( '<p>' )
								.text( ve.msg( 'citoid-citoiddialog-reliability-unreliable-description' ) ),
							backButton.$element
						) );
						this.resultError.toggle( true );
						hasError = true;

						ve.track( 'activity.editCheckReliability', { action: 'citation-blocked' } );
					} else {
						this.resultError.toggle( false );
					}
					// Build results
					return this.buildTemplateResults( searchResults )
						.then( () => {
							this.setModePanel( 'auto', 'result', false, { hasError: hasError } );
						}, () => {
							// Phabricator T363292
							ve.track( 'activity.CitoidInspector', { action: 'automatic-generate-fail-searchResults' } );

							this.lookupFailed();
							return $.Deferred().resolve();
						} );
				} );
			},
			// Fail
			( type, response ) => {
				if ( response && response.textStatus === 'abort' ) {
					return $.Deferred().reject();
				}
				// Phabricator T363292
				ve.track( 'activity.CitoidInspector', { action: 'automatic-generate-fail-network' } );

				this.lookupFailed( response.xhr.status );
				// Restore focus to the input field.
				// Definitely don't do this on success and focusing a hidden input causes jQuery
				// to prevent it from being focused the next time the inspector is opened (T285626)
				this.lookupInput
					.setDisabled( false ).focus();
				return $.Deferred().resolve();
			} )
		.always( () => {
			this.lookupInput
				.setDisabled( false )
				.popPending();
			this.lookupButton.setDisabled( false );
		} )
		.promise( {
			abort: () => {
				citoidXhr.abort();
				if ( reliabilityXhr && reliabilityXhr.abort ) {
					reliabilityXhr.abort();
				}
			}
		} );
	return this.lookupPromise;
};

/**
 * Set the auto panel to the error-state
 * @param {number} [httpStatus] Http status returned by Citoid server, or undefined
 */
ve.ui.CitoidInspector.prototype.lookupFailed = function ( httpStatus ) {
	// Enable the input and lookup button
	if ( httpStatus === 415 ) {
		this.errorMessage.$label.text( ve.msg( 'citoid-citoiddialog-unsupported-media-type-message' ) );
	} else {
		this.errorMessage.$label.text( ve.msg( 'citoid-citoiddialog-use-general-error-message-title' ) );
	}
	this.errorMessage.toggle( true );
	this.lookupInput.once( 'change', () => {
		this.errorMessage.toggle( false );
		this.updateSize();
	} ).setValidityFlag( false );
	this.updateSize();
	setTimeout( () => {
		OO.ui.Element.static.reconsiderScrollbars( this.$body[ 0 ] );
	} );

	// Phabricator T363292
	ve.track( 'activity.' + this.constructor.static.name, { action: 'automatic-generate-fail' } );
};

/**
 * Insert filled template based on search results from citoid service
 *
 * @param {Object[]} searchResults Array of citation objects from citoid service
 * @return {jQuery.Promise} Promise that is resolved when the template part is added
 *  or is rejected if there are any problems with the template name or the internal item.
 */
ve.ui.CitoidInspector.prototype.buildTemplateResults = function ( searchResults ) {
	const renderPromises = [],
		partPromises = [];

	searchResults.forEach( ( citation ) => {
		const templateName = this.templateTypeMap[ citation.itemType ];

		// if TemplateName is undefined, this means that items of this citoid
		// type does not have a Template defined within the message.
		if ( !templateName ) {
			return;
		}

		const transclusionModel = new ve.dm.MWTransclusionModel();
		// Create models for this result
		const result = {
			templateName: templateName,
			template: ve.dm.MWTemplateModel.newFromName( transclusionModel, templateName ),
			source: citation.source, // May be undefined or Array
			transclusionModel: transclusionModel
		};
		this.results.push( result );

		partPromises.push(
			result.transclusionModel.addPart( result.template )
				// Fill in the details for the individual template
				.then( ve.ui.CitoidInspector.static.populateTemplate.bind( this, result.template, citation ) )
		);
	} );

	return ve.promiseAll( partPromises )
		.then( () => {
			const sources = [],
				optionWidgets = [];
			// Create option widgets
			this.results.forEach( ( result, i ) => {
				const refWidget = new ve.ui.CitoidReferenceWidget(
					this.getFragment().getSurface().getDocument(),
					result.transclusionModel,
					{
						data: i,
						templateName: result.templateName,
						citeTools: this.citeTools
					} );
				const template = result.template;
				// T92428: Ignore empty templates
				if ( ve.isEmptyObject( template.getParameters() ) ) {
					return;
				}
				sources.push( result.source ); // source may be undefined or Array of strings
				optionWidgets.push( refWidget );
				renderPromises.push( refWidget.getRenderPromise() );
			} );
			if ( optionWidgets.length > 0 ) {
				// Add citations to the select widget
				this.previewSelectWidget.addItems( optionWidgets );
				// Add credit for the first result only to the widget, currently for Zotero & WorldCat only
				if ( sources[ 0 ] ) {
					if ( sources[ 0 ].indexOf( 'Zotero' ) !== -1 ) {
						this.credit.setLabel( ve.msg( 'citoid-citoiddialog-credit', 'Zotero' ) );
					} else if ( sources[ 0 ].indexOf( 'WorldCat' ) !== -1 ) {
						this.credit.setLabel( ve.msg( 'citoid-citoiddialog-credit', 'WorldCat' ) );
					} else {
						this.credit.setLabel( null );
					}
					// Move credit to end
					this.previewSelectWidget.$element.append( this.credit.$element );
				}
				return ve.promiseAll( renderPromises );
			}
			// failed, so go back
			return $.Deferred().reject();
		} );
};

/**
 * Fills template object parameters with values from the citation object
 *
 * @param {ve.dm.MWTemplateModel} template A template model to fill
 * @param {Object} citation An object that contains values to insert into template
 */
ve.ui.CitoidInspector.static.populateTemplate = function ( template, citation ) {
	const spec = template.getSpec(),
		maps = spec.getMaps(),
		map = maps[ ve.ui.CitoidInspector.static.templateDataName ];

	for ( const citoidField in map ) {
		const templateField = map[ citoidField ];

		// Construct parameters

		// Case: Citoid parameter directly equivalent to TemplateData parameter
		if ( typeof templateField === 'string' && citation[ citoidField ] && typeof citation[ citoidField ] === 'string' ) {
			template.addParameter(
				new ve.dm.MWParameterModel(
					template, templateField, citation[ citoidField ]
				)
			);
		// Case: Citoid parameter contains a 1 or 2D Array
		} else if ( citation[ citoidField ] && Array.isArray( citation[ citoidField ] ) ) {
			let concatCitoidField = null; // for storing a concatenated citoid value composed of array elements
			// Iterate through first dimension of array
			for ( let i = 0; i < citation[ citoidField ].length; i++ ) {
				// Case: Citoid parameter equivalent to 1D Array of TD parameters
				if ( citation[ citoidField ][ i ] && typeof citation[ citoidField ][ i ] === 'string' ) {
					// Case: Citoid parameter equivalent to TD parameter
					if ( Array.isArray( templateField ) && templateField[ i ] &&
						typeof templateField[ i ] === 'string' ) {
						template.addParameter( new ve.dm.MWParameterModel(
							template, templateField[ i ], citation[ citoidField ][ i ] )
						);
					// Case: No equivalent TD parameter, add value to flattened string instead.
					} else if ( typeof templateField === 'string' ) {
						if ( !concatCitoidField ) {
							concatCitoidField = citation[ citoidField ][ i ];
						} else {
							concatCitoidField += ', ' + citation[ citoidField ][ i ];
						}
					}
				// Case: Citoid parameter equivalent to 2D Array of TD parameters
				} else if ( citation[ citoidField ][ i ] && Array.isArray( citation[ citoidField ][ i ] ) ) {
					let concat2dField = null; // for storing elements of a 2d array converted to a 1d element

					// Iterate through inner dimension of array
					for ( let j = 0; j < citation[ citoidField ][ i ].length; j++ ) {
						// Case: 2nd degree parameter exists
						if ( citation[ citoidField ][ i ][ j ] && typeof citation[ citoidField ][ i ][ j ] === 'string' ) {
							// Case: Citoid parameter equivalent to TD parameter
							if ( Array.isArray( templateField[ i ] ) &&
								templateField[ i ][ j ] && typeof templateField[ i ][ j ] === 'string' ) {
								template.addParameter(
									new ve.dm.MWParameterModel(
										template, templateField[ i ][ j ],
										citation[ citoidField ][ i ][ j ]
									)
								);
							// Case: Citoid parameter deeper than TD parameter
							} else {
								if ( !concat2dField ) {
									concat2dField = citation[ citoidField ][ i ][ j ];
								} else {
									concat2dField += ' ' + citation[ citoidField ][ i ][ j ];
								}
							}
						}
					}
					// Done iterating; Deal with concatenated values
					if ( concat2dField ) {
						// Case: Concat 2d value is equivalent to a 1d template field value
						if ( Array.isArray( templateField ) && typeof templateField[ i ] === 'string' ) {
							template.addParameter(
								new ve.dm.MWParameterModel(
									template, templateField[ i ], concat2dField
								)
							);
						// Case: Concat value is likely equivalent to a flat template field value
						} else {
							if ( !concatCitoidField ) {
								concatCitoidField = concat2dField;
							} else {
								concatCitoidField += ', ' + concat2dField;
							}
						}
					}
				}
			}
			// Done iterating; add final concatenated field to TD
			if ( concatCitoidField ) {
				// Case: Concat value is equivalent to flat templateField value
				if ( templateField && typeof templateField === 'string' ) {
					template.addParameter(
						new ve.dm.MWParameterModel(
							template, templateField, concatCitoidField
						)
					);
				}
			}
		}
	}
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.CitoidInspector );
