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
	ve.ui.CiteFromURLDialog.static.title = mw.msg( 'citoid-citeFromURLDialog-title' );

	ve.ui.CiteFromURLDialog.prototype.getPlainObject = function ( searchResults ) {

		var content, plainObject,
			citation = jQuery.parseJSON( JSON.stringify( searchResults ) )[0], //uses the first citation result for the time being

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

	ve.ui.CiteFromURLDialog.prototype.initialize = function () {
		ve.ui.CiteFromURLDialog.super.prototype.initialize.call( this );
		this.searchInput = new OO.ui.TextInputWidget( {
			'$': this.$,
			'multiline': false,
			'placeholder': mw.msg( 'citoid-citeFromURLDialog-search-placeholder' )
		} );
		var panel = new OO.ui.PanelLayout( { '$': this.$, 'scrollable': true, 'padded': true } ),
			inputsFieldset = new OO.ui.FieldsetLayout( {
				'$': this.$
			} ),
			//input search

			searchField = new OO.ui.FieldLayout( this.searchInput, {
				'$': this.$,
				'label': mw.msg( 'citoid-citeFromURLDialog-search-label' )
			} ),

			// execution buttons
			citeFromURLSearchButton = new OO.ui.ButtonWidget({
				'label': mw.msg('citoid-citeFromURLDialog-search'),
				'flags': ['constructive']
			} ).connect( this, { 'click': this.citeFromURLSearchButtonClick } );

		inputsFieldset.$element.append(
			searchField.$element
		);
		panel.$element.append( inputsFieldset.$element );
		this.$body.append( panel.$element );
		this.$foot.append( citeFromURLSearchButton.$element );

	};

	ve.ui.CiteFromURLDialog.prototype.citeFromURLSearchButtonClick = function () {
		this.pushPending();
		//var dialog = this;
		$.ajax( {
			beforeSend: function (request) {
				request.setRequestHeader('Content-Type', 'application/json');
			},
			url: 'http://citoid.wmflabs.org/url',
			type: 'POST',
			data: JSON.stringify( { url: this.searchInput.getValue() } ),
			dataType: 'json',
			success: ve.bind( function ( result ) {
				this.getPlainObject( result );
				this.close();
			}, this ),
			failure: function () {
				window.alert( 'something terrible has happened' );
			},
			always: ve.bind( this.popPending, this )
		} );
	};

	ve.ui.windowFactory.register( ve.ui.CiteFromURLDialog );

} );
