mw.loader.using( 'ext.visualEditor.mwtransclusion', function () {

	ve.ui.CiteFromURLDialog = function VeUiCiteFromURLDialog( config ) {
		// Parent constructor
		config = ve.extendObject( { 'size': 'medium' }, config );
		ve.ui.CiteFromURLDialog.super.call( this, config );
	};

	/* Inheritance */
	OO.inheritClass( ve.ui.CiteFromURLDialog, ve.ui.MWTemplateDialog );

	/* Static Properties */
	ve.ui.CiteFromURLDialog.static.name = 'citefromurl';
	ve.ui.CiteFromURLDialog.static.title = ve.msg( 'citoid-citeFromURLDialog-title' );

	ve.ui.CiteFromURLDialog.prototype.initialize = function () {
		ve.ui.CiteFromURLDialog.super.prototype.initialize.call( this );
		//this.bookletLayout.clearPages();

		this.searchInput = new OO.ui.TextInputWidget( {
			'$': this.$,
			'multiline': false,
			'placeholder': ve.msg( 'citoid-citeFromURLDialog-search-placeholder' )
		} );

		this.searchInput.on( 'change', function () {
			this.applyButton.setDisabled( this.searchInput.getValue().length === 0 );
		}, [], this );

		//temp hack for autofill case :(
		this.searchInput.on( 'click', function () {
			this.applyButton.setDisabled( this.searchInput.getValue().length === 0 );
		}, [], this );

		var panel = new OO.ui.PanelLayout( { '$': this.$, 'scrollable': true, 'padded': true, 'autocomplete': false } ),
			inputsFieldset = new OO.ui.FieldsetLayout( {
				'$': this.$
			} ),

			searchField = new OO.ui.FieldLayout( this.searchInput, {
				'$': this.$,
				'label': ve.msg( 'citoid-citeFromURLDialog-search-label' )
			} );

		inputsFieldset.$element.append(
			searchField.$element
		);
		panel.$element.append( inputsFieldset.$element );
		this.$body.append( panel.$element );
	};

	//ve.ui.CiteFromURLDialog.prototype.getPageFromPart = function () {
	//	return new ve.ui.CiteFromURLDialogPage( { '$': this.$ } );
	//};

	ve.ui.CiteFromURLDialog.prototype.getApplyButtonLabel = function () {
		return ve.msg( 'citoid-citeFromURLDialog-search' );
	};

	ve.ui.CiteFromURLDialog.prototype.applyChanges = function () {
		var deferred = $.Deferred();
		//var dialog = this
		$.ajax( {
			beforeSend: function (request) {
				request.setRequestHeader( 'Content-Type', 'application/json' );
			},
			url: 'http://citoid.wmflabs.org/url',
			type: 'POST',
			data: JSON.stringify( { url: this.searchInput.getValue() } ),
			dataType: 'json',
			success: ve.bind( function ( result ) {
				deferred.resolve( result );
			}, this ),
			failure: function () {
				deferred.reject( ['ow', 'owagain'] );
			}
		} );

		return deferred.promise();
	};

	ve.ui.CiteFromURLDialog.prototype.onApplyChangesDone = function ( searchResults ) {
		ve.ui.CiteFromURLDialog.super.prototype.onApplyChangesDone.call( this );

		var content, plainObject,
			citation = $.parseJSON( JSON.stringify( searchResults ) )[0], //uses the first citation result for the time being

			//Parameter map for Template:Citation on en-wiki
			//In the format citation-template-field:citoid-field
			paramMap = {
				'first1': 'author1-first',
				'last1': 'author1-last',
				'first2': 'author2-first',
				'last2': 'author2-last',
				'first3': 'author3-first',
				'last3': 'author3-last',
				'first4': 'author4-first',
				'last4': 'author4-last',
				'title': 'title',
				'url': 'url',
				'publisher': 'publisher',
			//	'accessdate': 'accessDate',
			//	'newspaper': 'publicationTitle',
				'date': 'date',
				'location': 'place',
				'issn': 'ISSN',
				'isbn': 'ISBN',
				'pages': 'pages',
				'journal': 'publicationTitle',
				'volume': 'volume',
				'series': 'series',
				'issue': 'issue',
				'doi': 'DOI'
			},
			paramObj = {};

		$.each( paramMap, function ( key, value ) {
			var objString = citation[value] !== undefined ? citation[value] : '';
			paramObj[key] = { 'wt': objString };
		} );

		plainObject = { //before paren put get plain object
			'parts': [ {

				'template': {
					'target': {
						'href': 'Template:Citation',
						'wt': 'citation'
					},
					'params': paramObj
				}
			} ]
		};

		content = [
			{
				'type': 'mwTransclusionInline',
				'attributes': {
					'mw': plainObject
				}
			},
			{ 'type': '/mwTransclusionInline' }
		];

		this.getFragment().insertContent( content );
	};

	ve.ui.windowFactory.register( ve.ui.CiteFromURLDialog );

} );
