( function ( wb, dv ) {

	'use strict';

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
		var self = this,
			idsQueryValue = '';

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
		Object.keys( this.config.zoteroProperties ).forEach( function ( zotProp ) {
			var wbProp = self.config.zoteroProperties[ zotProp ];
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
				function ( data ) {
					Object.keys( data.entities ).forEach( function ( wbProp ) {
						var entity = data.entities[ wbProp ];
						if ( Object.prototype.hasOwnProperty.call( entity, 'missing' ) ) {
							mw.log.warn( 'Entity ' + entity.id + ' is missing.' );
						} else if ( entity.type !== 'property' ) {
							mw.log.warn( 'Invalid entity type "' + entity.type + '"' );
						} else {
							// Hand appropriate snak adder function to each property in the config
							if ( self.dataTypes[ entity.datatype ] ) {
								if ( self.typeToMethodMap[ self.dataTypes[ entity.datatype ].dataValueType ] ) {
									self.propertyTypeMap[ wbProp ] = self.typeToMethodMap[ self.dataTypes[ entity.datatype ].dataValueType ];
								}
							}
						}
					} );
				},
				// Failure
				function ( type, response ) {
					mw.log.warn( response.error.info );
				}
			);
		} else {
			mw.log.warn( 'Citoid is improperly configured; No wikibase properties found in config.zoteroProperties' );
		}

	};

	CitoidToolReferenceEditor.prototype.addReferenceSnaksFromCitoidData = function ( data, referenceView ) {
		var getSnak, i, propertyId, val,
			refView = $( referenceView ).data( 'referenceview' ),
			lv = this.getReferenceSnakListView( refView ),
			items = lv.items(),
			lang = this.getMVSnakLang( data ),
			self = this,
			addSnakProm = false,
			snakPromises = [];

		// Clear manual tab of existing snaks - we should ideally ask user for permission to do this
		if ( items.length ) {
			items.each( function ( key ) {
				lv.removeItem( $( items[ key ] ) );
			} );
		}

		Object.keys( data ).forEach( function ( key ) {
			propertyId = self.getPropertyForCitoidData( key );
			if ( !propertyId ) {
				return;
			}
			getSnak = self.propertyTypeMap[ propertyId ];

			if ( !getSnak ) {
				return;
			}

			val = data[ key ];

			// Add single string values
			if ( typeof val === 'string' ) {
				snakPromises.push( getSnak( propertyId, val, lang ) );
				addSnakProm = true;

			} else if ( Array.isArray( val ) ) {
				for ( i = 0; i < val.length; i++ ) {
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

		$.when.apply( $, snakPromises.map( function ( snakPromise ) {
			// Add each snak to listview after promise is complete
			return snakPromise.then( function ( snak ) {
				lv.addItem( snak );
			} );
		} ) ).then( function () {
			if ( addSnakProm ) {
				lv.startEditing().then( function () {
					// Trigger change to enable save button for new snaks
					$( referenceView ).trigger( 'statementviewchange' );
					self.pendingDialog.popPending();
					self.windowManager.closeWindow( self.pendingDialog );
				} );
			} else {
				// On failure, add any old items back into the manual tab
				items.each( function ( key ) {
					lv.addItem( $( items[ key ] ) );
				} );
				self.pendingDialog.popPending();
				self.pendingDialog.executeAction( 'error' );
				self.pendingDialog.updateSize();
			}
		} );
	};

	CitoidToolReferenceEditor.prototype.getReferenceSnakListView = function ( refView ) {
		var refListView = refView.$listview.data( 'listview' ),
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
		var snak = new wb.datamodel.PropertyValueSnak(
			propertyId,
			new dv.MonolingualTextValue( languageCode, val )
		);
		return $.Deferred().resolve( snak );
	};

	CitoidToolReferenceEditor.prototype.getStringSnak = function ( propertyId, val ) {
		var snak = new wb.datamodel.PropertyValueSnak(
			propertyId,
			new dv.StringValue( val )
		);
		return $.Deferred().resolve( snak );
	};

	CitoidToolReferenceEditor.prototype.getNumSnak = function ( propertyId, val ) {
		var snak,
			value = new dv.QuantityValue( new dv.DecimalValue( val ), 1 ); // Do not add units
		snak = new wb.datamodel.PropertyValueSnak(
			propertyId,
			value
		);
		return $.Deferred().resolve( snak );
	};

	// Returns promise
	CitoidToolReferenceEditor.prototype.getDateSnak = function ( propertyId, val ) {
		var jsonDate;

		return new mw.Api().get( {
			values: val,
			action: 'wbparsevalue',
			datatype: 'time',
			format: 'json'
		} ).then( function ( result ) {
			jsonDate = result.results[ 0 ].value;
			return new wb.datamodel.PropertyValueSnak(
				propertyId,
				dv.TimeValue.newFromJSON( jsonDate )
			);
		} );
	};

	CitoidToolReferenceEditor.prototype.getWikibaseItemSnak = function ( propertyId, val ) {
		var snak = new wb.datamodel.PropertyValueSnak(
			propertyId,
			new wb.datamodel.EntityId( val )
		);
		return $.Deferred().resolve( snak );
	};

	wb.CitoidToolReferenceEditor = CitoidToolReferenceEditor;

}( wikibase, dataValues ) );
