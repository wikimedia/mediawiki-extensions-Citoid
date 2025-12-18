( function ( wb, dv ) {

	'use strict';

	function loadWbDataModel() {
		return mw.loader.using( [ 'wikibase.datamodel' ] ).then( ( require ) => require( 'wikibase.datamodel' ) );
	}

	function CitoidToolReferenceEditor( config, windowManager, pendingDialog ) {
		this.config = config;
		this.windowManager = windowManager;
		this.pendingDialog = pendingDialog;
		this.citoidClient = new wb.CitoidClient();
		this.lc = new wb.CitoidLanguageConverter();
		this.api = new mw.Api();

		this.cachePropertyTypes();
	}

	CitoidToolReferenceEditor.prototype.cachePropertyTypes = function () {
		let idsQueryValue = '';

		this.propertyTypeMap = {};
		this.dataTypes = mw.config.get( 'wbDataTypes' );

		// Doesn't support 'globecoordinate', others
		this.typeToMethodMap = {
			string: this.getStringSnak,
			monolingualtext: this.getMonolingualValueSnak,
			quantity: this.getNumSnak,
			time: this.getDateSnak
			// 'wikibase-entityid': this.getWikibaseItemSnak, // temp disable items
		};

		// Construct query parameter idsQueryValue - request all properties at once
		Object.keys( this.config.zoteroProperties ).forEach( ( zotProp ) => {
			const wbProp = this.config.zoteroProperties[ zotProp ];
			if ( wbProp ) {
				if ( idsQueryValue ) {
					idsQueryValue = idsQueryValue + '|' + wbProp; // i.e. |P1234
				} else {
					idsQueryValue = wbProp; // First one, no leading pipe
				}
			}
		} );

		if ( idsQueryValue ) {
			this.api.get( {
				action: 'wbgetentities',
				ids: idsQueryValue,
				format: 'json',
				formatversion: 1, // Doesn't currently work, see T212069
				props: 'datatype'
			} ).then(
				( data ) => {
					Object.keys( data.entities ).forEach( ( wbProp ) => {
						const entity = data.entities[ wbProp ];
						if ( Object.prototype.hasOwnProperty.call( entity, 'missing' ) ) {
							mw.log.warn( 'Entity ' + entity.id + ' is missing.' );
						} else if ( entity.type !== 'property' ) {
							mw.log.warn( 'Invalid entity type "' + entity.type + '"' );
						} else {
							// Hand appropriate snak adder function to each property in the config
							if ( this.dataTypes[ entity.datatype ] ) {
								if ( this.typeToMethodMap[ this.dataTypes[ entity.datatype ].dataValueType ] ) {
									this.propertyTypeMap[ wbProp ] = this.typeToMethodMap[ this.dataTypes[ entity.datatype ].dataValueType ];
								}
							}
						}
					} );
				},
				// Failure
				( type, response ) => {
					mw.log.warn( response.error.info );
				}
			);
		} else {
			mw.log.warn( 'Citoid is improperly configured; No wikibase properties found in config.zoteroProperties' );
		}

	};

	CitoidToolReferenceEditor.prototype.addReferenceSnaksFromCitoidData = function ( data, referenceView ) {
		const refView = $( referenceView ).data( 'referenceview' ),
			lv = this.getReferenceSnakListView( refView ),
			items = lv.items(),
			lang = this.getMVSnakLang( data ),
			snakPromises = [];

		// Clear manual tab of existing snaks - we should ideally ask user for permission to do this
		if ( items.length ) {
			items.each( ( key ) => {
				lv.removeItem( $( items[ key ] ) );
			} );
		}

		let addSnakProm = false;
		Object.keys( data ).forEach( ( key ) => {
			const val = data[ key ],
				propertyId = this.getPropertyForCitoidData( key );

			if ( !propertyId || !val ) {
				return;
			}

			const getSnak = this.propertyTypeMap[ propertyId ];

			if ( !getSnak ) {
				return;
			}

			// Add single string values
			if ( typeof val === 'string' ) {
				snakPromises.push( getSnak( propertyId, val, lang ) );
				addSnakProm = true;

			} else if ( Array.isArray( val ) ) {
				for ( let i = 0; i < val.length; i++ ) {
					// Array of array of strings - authors in this case, typically. Concatonate.
					if ( Array.isArray( val[ i ] ) ) {
						snakPromises.push(
							getSnak( propertyId, val[ i ][ 0 ] + ' ' + val[ i ][ 1 ], lang )
						);
						addSnakProm = true;
					} else { // Array of strings - identifiers, typically
						snakPromises.push( getSnak( propertyId, val[ i ], lang ) );
					}
				}
			}

		} );

		// Add each snak to listview after promise is complete
		$.when( ...snakPromises.map(
			( snakPromise ) => snakPromise.then( ( snak ) => {
				lv.addItem( snak );
				addSnakProm = true;
			} ).catch( () => {} )
		) ).then( () => {
			if ( addSnakProm ) {
				lv.startEditing().then( () => {
					// Trigger change to enable save button for new snaks
					$( referenceView ).trigger( 'statementviewchange' );
					this.pendingDialog.popPending();
					this.windowManager.closeWindow( this.pendingDialog );
				} );
			} else {
				// On failure, add any old items back into the manual tab
				items.each( ( key ) => {
					lv.addItem( $( items[ key ] ) );
				} );
				this.pendingDialog.popPending();
				this.pendingDialog.executeAction( 'error' );
				this.pendingDialog.updateSize();
			}
		} );
	};

	CitoidToolReferenceEditor.prototype.getReferenceSnakListView = function ( refView ) {
		const refListView = refView.$listview.data( 'listview' ),
			snakListView = refListView.items(),
			snakListViewData = snakListView.data( 'snaklistview' ),
			listView = snakListViewData.$listview.data( 'listview' );

		return listView;
	};

	CitoidToolReferenceEditor.prototype.getPropertyForCitoidData = function ( key ) {
		if ( this.config.zoteroProperties[ key ] ) {
			return this.config.zoteroProperties[ key ];
		}

		return null;
	};

	CitoidToolReferenceEditor.prototype.getMVSnakLang = function ( data ) {
		return this.lc.getMonolingualCode( data.language );
	};

	CitoidToolReferenceEditor.prototype.getMonolingualValueSnak = function ( propertyId, val, languageCode ) {
		return loadWbDataModel().then( ( datamodel ) => new datamodel.PropertyValueSnak(
			propertyId,
			new dv.MonolingualTextValue( languageCode, val )
		) );
	};

	CitoidToolReferenceEditor.prototype.getStringSnak = function ( propertyId, val ) {
		return loadWbDataModel().then( ( datamodel ) => new datamodel.PropertyValueSnak(
			propertyId,
			new dv.StringValue( val )
		) );
	};

	CitoidToolReferenceEditor.prototype.getNumSnak = function ( propertyId, val ) {
		return loadWbDataModel().then( ( datamodel ) => new datamodel.PropertyValueSnak(
			propertyId,
			new dv.QuantityValue( new dv.DecimalValue( val ), 1 ) // Do not add units
		) );
	};

	// Returns promise
	CitoidToolReferenceEditor.prototype.getDateSnak = function ( propertyId, val ) {
		return new mw.Api().get( {
			values: val,
			action: 'wbparsevalue',
			datatype: 'time',
			format: 'json'
		} ).then( ( result ) => {
			const jsonDate = result.results[ 0 ].value;

			return loadWbDataModel().then( ( datamodel ) => new datamodel.PropertyValueSnak(
				propertyId,
				dv.TimeValue.newFromJSON( jsonDate )
			) );
		} );
	};

	CitoidToolReferenceEditor.prototype.getWikibaseItemSnak = function ( propertyId, val ) {
		return loadWbDataModel().then( ( datamodel ) => new datamodel.PropertyValueSnak(
			propertyId,
			new datamodel.EntityId( val )
		) );
	};

	wb.CitoidToolReferenceEditor = CitoidToolReferenceEditor;

}( wikibase, dataValues ) );
