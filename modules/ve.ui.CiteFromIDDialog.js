mw.loader.using( 'ext.visualEditor.mwreference', function () {

	/**
	 * Dialog to insert filled references using citoid service
	 *
	 * @class
	 * @extends ve.ui.MWCitationDialog
	 * @constructor
	 * @param {Object} [config] Configuration options
	 */

	ve.ui.CiteFromIDDialog = function VeUiCiteFromIDDialog( config ) {
		// Parent constructor
		ve.ui.CiteFromIDDialog.super.call( this, config );
	};

	/* Inheritance */
	OO.inheritClass( ve.ui.CiteFromIDDialog, ve.ui.MWCitationDialog );

	/* Static Properties */
	ve.ui.CiteFromIDDialog.static.name = 'citefromid';
	ve.ui.CiteFromIDDialog.static.title = mw.msg( 'citoid-citeFromIDDialog-title' );
	// The string used in TemplateData to identify the correct Map object
	ve.ui.CiteFromIDDialog.static.templateDataName = 'extension/Citoid/ve.ui.CiteFromIDDialog';
	// The requested format from the citoid client, passed as a GET parameter
	ve.ui.CiteFromIDDialog.static.citoidFormat = 'mediawiki';

	/**
	 * @inheritdoc
	 */
	ve.ui.CiteFromIDDialog.prototype.initialize = function () {

		// Skip ve.ui.MWCitationDialog and ve.ui.MWTemplateDialog initialize methods
		ve.ui.CiteFromIDDialog.super.super.super.prototype.initialize.call( this );

		// Booklet layout required due to inheriting from MWTemplateDialog
		this.bookletLayout = new OO.ui.BookletLayout(
			ve.extendObject(
				{ $: this.$ },
				this.constructor.static.bookletLayoutConfig
			)
		);

		this.searchInput = new OO.ui.TextInputWidget( {
			$: this.$,
			multiline: false,
			placeholder: mw.msg( 'citoid-citeFromIDDialog-search-placeholder' )
		} );

		var panel = new OO.ui.PanelLayout( {
				$: this.$,
				padded: true,
				scrollable: true,
				expanded: false
			} ),
			inputsFieldset = new OO.ui.FieldsetLayout( {
				$: this.$
			} ),
			searchField = new OO.ui.FieldLayout( this.searchInput, {
				$: this.$,
				align: 'top',
				label: mw.msg( 'citoid-citeFromIDDialog-search-label' )
			} );

		inputsFieldset.$element.append(
			searchField.$element
		);

		panel.$element.append( inputsFieldset.$element );
		this.$body.append( panel.$element );

		this.modules = ['ext.visualEditor.data'];

	};

	/**
	 * Insert filled template based on search results from citoid service
	 * @param {Object[]} searchResults Array of citation objects from citoid service
	 */
	ve.ui.CiteFromIDDialog.prototype.insertTemplate = function ( searchResults ) {

		var transclusion, template, templateName, templateTypeMap, partPromise, item, fragment,
			citation = searchResults[0], //uses the first citation result for the time being
			dialog = this,
			surfaceModel = this.getFragment().getSurface(),
			doc = surfaceModel.getDocument(),
			internalList = doc.getInternalList();

		// Try to parse Mediawiki namespace templateTypeMap definition
		try {
			templateTypeMap = JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
		} catch ( e ) {
			mw.notify( mw.msg( 'citoid-typeMap-config-error' ) );
			dialog.popPending();
			return;
		}

		// Set up blank referenceModel
		if ( !this.referenceModel ) {
			// Collapse returns a new fragment, so update this.fragment
			this.fragment = this.getFragment().collapseToEnd();
			this.referenceModel = new ve.dm.MWReferenceModel();
			this.referenceModel.insertInternalItem( surfaceModel );
			this.referenceModel.insertReferenceNode( this.getFragment() );
		}

		// Gets back contents of <ref> tag
		item = this.referenceModel.findInternalItem( surfaceModel );
		if ( item ) {
			fragment = this.getFragment().clone(
				new ve.dm.LinearSelection( doc, item.getChildren()[0].getRange() )
			);

			transclusion = new ve.dm.MWTransclusionModel();
			templateName = templateTypeMap[citation.itemType];

			// if TemplateName is undefined, this means that items of this citoid
			// type does not have a Template defined within the message.
			if ( !templateName ) {
				mw.notify( mw.msg( 'citoid-typeMap-config-error' ) );
				dialog.popPending();
				return;
			}

			template = ve.dm.MWTemplateModel.newFromName( transclusion, templateName );
			this.template = template;

			// Promise for template being added to the transclusion
			partPromise = transclusion.addPart( template );

			partPromise.done( function () {
				dialog.fillTemplate( citation );

				transclusion.insertTransclusionNode( fragment );
				// HACK: Scorch the earth - this is only needed because without it, the reference list won't
				// re-render properly, and can be removed once someone fixes that
				dialog.referenceModel.setDocument(
					doc.cloneFromRange(
						internalList.getItemNode( dialog.referenceModel.getListIndex() ).getRange()
					)
				);

				dialog.referenceModel.updateInternalItem( surfaceModel );
				// hack- doesn't seem to be working in always
				dialog.popPending();
				dialog.close();
			} );
		}
	};

	/**
	 * Fills template object with parameters from with values in citation object
	 * @param {Object} citation Contains values to insert into template
	 */
	ve.ui.CiteFromIDDialog.prototype.fillTemplate = function ( citation ) {
		var citoidField, templateField, i, j,
			template = this.template,
			spec = template.getSpec(),
			maps = spec.getMaps(),
			map = maps[ve.ui.CiteFromIDDialog.static.templateDataName];

		for ( citoidField in map ) {
			templateField = map[citoidField];
			// Construct parameters
			if ( typeof templateField === 'string' && citation[citoidField] !== undefined ) {
				// Case: Citoid parameter directly equivalent to TemplateData parameter
				template.addParameter( new ve.dm.MWParameterModel( template, templateField, citation[citoidField] ) );
			} else if ( Array.isArray( citation[citoidField] ) ) {
				// Case: Citoid parameter equivalent to 1 or 2D Array of TD parameters
				for ( i = 0; i < citation[citoidField].length; i++ ) {
					// Iterate through first dimension of array
					if ( typeof citation[citoidField][i] === 'string' && templateField[i] !== undefined ) {
						// Case: Citoid parameter equivalent to 1D Array of TD parameters
						template.addParameter( new ve.dm.MWParameterModel( template, templateField[i], citation[citoidField][i] ) );
					} else if ( Array.isArray( citation[citoidField][i] ) ) {
						// Case: Citoid parameter equivalent to 2D Array of TD parameters
						for ( j = 0; j < citation[citoidField][i].length; j++ ) {
							// Iterate through 2nd dimension of Array
							if ( typeof citation[citoidField][i][j] === 'string' && templateField[i][j] !== undefined ) {
								template.addParameter( new ve.dm.MWParameterModel( template, templateField[i][j], citation[citoidField][i][j] ) );
							}
						}
					}
				}
			}
		}
	};

	/**
	 * @inheritdoc
	 */
	ve.ui.CiteFromIDDialog.prototype.getActionProcess = function ( action ) {
		if ( action === 'apply' || action === 'insert' ) {
			return new OO.ui.Process( function () {
				var dialog = this;

				dialog.pushPending();

				$.ajax( {
					beforeSend: function ( request ) {
						request.setRequestHeader( 'Content-Type', 'application/json' );
					},
					url: mw.config.get( 'wgCitoidConfig' ).citoidServiceUrl,
					type: 'GET',
					data: {
						search: encodeURI( dialog.searchInput.getValue() ),
						format: ve.ui.CiteFromIDDialog.static.citoidFormat
					},
					dataType: 'json'
				} )
					.done( function ( result ) {
						dialog.insertTemplate( result );
					} )
					.fail( function ( response, textStatus, errorThrown ) {
						// 520 status from citoid means there was no response at the
						// URL provided, but it returns a citation regardless. We're
						// choosing to insert that citation here but to notify the user.
						if ( response.status === 520 ) {
							dialog.insertTemplate( response.responseJSON );
							mw.notify( mw.message( 'citoid-520-error' ) );
						} else {
							mw.notify( 'Status: '  + textStatus +  'Error: ' + errorThrown );
						}
					} )
					.always( function () {
						dialog.popPending();
					} );
			}, this );
		}

		// Parent method
		return ve.ui.CiteFromIDDialog.super.prototype.getActionProcess.call( this, action );
	};

	/**
	 * Handle the transclusion being ready to use.
	 * Enables apply/insert buttons
	 */
	ve.ui.CiteFromIDDialog.prototype.onTransclusionReady = function () {
		// Parent method
		ve.ui.CiteFromIDDialog.super.prototype.onTransclusionReady.call( this );
		// TODO- disable when no input
		this.actions.setAbilities( { 'apply': true, 'insert': true } );
	};

	/**
	 * Overrides Template Dialog method which expects this.template to
	 * exist on initialization and sets the template as the dialog title.
	 *
	 * @return {string} Title of dialog
	 */
	ve.ui.CiteFromIDDialog.prototype.getTemplatePartLabel = function () {
		return ve.msg( 'citoid-citeFromIDDialog-title' );
	};

	/**
	 * Overrides Template Dialog method which has a fixed height
	 * @inheritdoc
	 */
	ve.ui.CiteFromIDDialog.prototype.getBodyHeight =
		ve.ui.CiteFromIDDialog.super.super.super.prototype.getBodyHeight;

	/**
	 * @inheritdoc
	 */
	ve.ui.CiteFromIDDialog.prototype.getTeardownProcess = function ( data ) {
		return ve.ui.CiteFromIDDialog.super.prototype.getTeardownProcess.call( this, data )
			.first( function () {
				// Clear search input box
				this.searchInput.setValue( '' );
			}, this );
	};

	ve.ui.windowFactory.register( ve.ui.CiteFromIDDialog );

} );
