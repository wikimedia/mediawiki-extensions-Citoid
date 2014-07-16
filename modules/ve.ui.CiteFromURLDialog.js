mw.loader.using( 'ext.visualEditor.mwreference', function () {

	/**
	 * [CiteFromURLDialog description]
	 * @param {[type]} config [description]
	 */
	ve.ui.CiteFromURLDialog = function VeUiCiteFromURLDialog( config ) {
		// Parent constructor
		config = ve.extendObject( { 'size': 'medium' }, config );
		ve.ui.CiteFromURLDialog.super.call( this, config );
	};

	/* Inheritance */
	OO.inheritClass( ve.ui.CiteFromURLDialog, ve.ui.MWCitationDialog );

	/* Static Properties */
	ve.ui.CiteFromURLDialog.static.name = 'citefromurl';
	ve.ui.CiteFromURLDialog.static.title = mw.msg( 'citoid-citeFromURLDialog-title' );

	/**
	 * [getPlainObject description]
	 * @param  {[type]} searchResults [description]
	 * @return {[type]}               [description]
	 */
	ve.ui.CiteFromURLDialog.prototype.getPlainObject = function ( searchResults ) {

		var content, plainObject, d,
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

		d = new Date();
		paramObj.accessdate = { 'wt': d.toDateString() };

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

		//this.getFragment().insertContent( content );
		return content;
	};

	/**
	 * [initialize description]
	 * @return {[type]} [description]
	 */
	ve.ui.CiteFromURLDialog.prototype.initialize = function () {
		ve.ui.CiteFromURLDialog.super.super.prototype.initialize.call( this );
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

	/**
	 * [citeFromURLSearchButtonClick description]
	 * @return {[type]} [description]
	 */
	ve.ui.CiteFromURLDialog.prototype.citeFromURLSearchButtonClick = function () {

		this.pushPending();
		var that = this;

		$.ajax( {
			beforeSend: function (request) {
				request.setRequestHeader('Content-Type', 'application/json');
			},
			url: 'http://citoid.wmflabs.org/url',
			type: 'POST',
			data: JSON.stringify( { url: this.searchInput.getValue() } ),
			dataType: 'json',
			success: function ( result ) {
				that.close();

				var item,
					surfaceModel = that.getFragment().getSurface(),
					doc = surfaceModel.getDocument(),
					internalList = doc.getInternalList();

				//sets up referencemodel with blank stuff
				if ( !that.referenceModel ) {
					// Collapse returns a new fragment, so update this.fragment
					that.fragment = that.getFragment().collapseRangeToEnd();
					that.referenceModel = new ve.dm.MWReferenceModel();
					that.referenceModel.insertInternalItem( surfaceModel );
					that.referenceModel.insertReferenceNode( that.getFragment() );
				}
				//gets bank stuff again
				item = that.referenceModel.findInternalItem( surfaceModel );
				if ( item ) {
					//actually inserts full transclusion model here!
					that.getFragment().clone( item.getChildren()[0].getRange()).insertContent(that.getPlainObject( result ) );
				}

				// HACK: Scorch the earth - this is only needed because without it, the reference list won't
				// re-render properly, and can be removed once someone fixes that
				that.referenceModel.setDocument(
					doc.cloneFromRange(
						internalList.getItemNode( that.referenceModel.getListIndex() ).getRange()
					)
				);

				that.referenceModel.updateInternalItem( surfaceModel );

				//hack- doesn't seem to be working in always
				that.popPending();
			},
			error: function ( XMLHttpRequest, textStatus, errorThrown) {
				that.popPending();
				mw.notify( 'Status:'  + textStatus +  'Error: ' + errorThrown );
			},
			always: function () {
				that.popPending();
			}
		} );
	};

	ve.ui.windowFactory.register( ve.ui.CiteFromURLDialog );

} );
