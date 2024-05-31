( function ( wb ) {

	'use strict';

	function CitoidTabRenderer( config, citoidClient, citeToolReferenceEditor, windowManager, pendingDialog ) {
		this.config = config;
		this.citoidClient = citoidClient;
		this.citeToolReferenceEditor = citeToolReferenceEditor;
		this.windowManager = windowManager;
		this.pendingDialog = pendingDialog;
	}

	CitoidTabRenderer.prototype.renderTab = function ( referenceView ) {
		var $searchButton, $searchLabel, $searchField, $automatic, automaticSectionLink, $automaticLink, $autoLi,
			$refView = $( referenceView ),
			buttonLabel = mw.msg( 'citoid-wb-referenceview-tabs-search' ),
			automaticLabel = mw.msg( 'citoid-wb-referenceview-tabs-automatic' ),
			options = {
				templateParams: [
					'wikibase-citoid-search', // CSS class names
					'#', // URL
					buttonLabel, // Label
					'' // Title tooltip
				],
				cssClassSuffix: 'search'
			},
			$ul = $( referenceView ).find( 'ul' );

		// Create automatic panel with unique id
		$searchLabel = $( '<label>' ).text( mw.msg( 'citoid-wb-referenceview-tabs-search-label' ) );
		$searchField = $( '<input>' ).addClass( 'citoid-search' );
		$searchButton = $( '<span>' )
			.toolbarbutton( options )
			.on( 'click', ( e ) => {
				e.preventDefault();
				this.onSearchClick( e.target );
			} );
		$searchButton.find( '.wb-icon' ).addClass( 'oo-ui-icon-search' ); // Add search icon to search button span
		$automatic = $( '<div>' ).addClass( 'wikibase-referencepanel-citoid ' ).uniqueId()
			.append( $searchLabel )
			.append( $searchField )
			.append( $searchButton );

		// Search on enter
		$searchField.on( 'keypress', ( e ) => {
			if ( e.key === 'Enter' ) {
				e.preventDefault();
				this.onSearchClick( e.target );
			}
		} );

		// Disable button if field is empty
		$searchField.on( 'input', ( e ) => {
			e.preventDefault();
			if ( $searchField.val() ) {
				$searchButton.toolbarbutton( 'enable' );
			} else {
				$searchButton.toolbarbutton( 'disable' );
			}
		} );

		// Create automatic tab which links to automatic panel
		automaticSectionLink = '#' + $automatic.attr( 'id' );
		$automaticLink = $( '<a>' )
			.attr( 'href', automaticSectionLink )
			.text( automaticLabel );
		$autoLi = $( '<li>' ).append( $automaticLink );

		// Sets automatic mode when user selects it after selecting another tab
		$automaticLink.on( 'click', () => {
			new mw.Api().saveOption( 'wb-reftabs-mode', 'automatic' ); // for future page views
			mw.user.options.set( 'wb-reftabs-mode', 'automatic' ); // for this page view
		} );

		// Add new tab and citoid panel to reference widget
		$ul.append( $autoLi );
		$refView.append( $automatic );
		$refView.tabs( 'refresh' );

	};

	CitoidTabRenderer.prototype.onSearchClick = function ( target ) {
		var $referenceView = $( target ).closest( '.wikibase-referenceview-new' ),
			value = $referenceView.find( 'input.citoid-search' ).val();

		this.windowManager.openWindow( this.pendingDialog );
		this.pendingDialog.pushPending();
		this.pendingDialog.executeAction( 'waiting' );

		this.citoidClient.search( value )
			.then(
				// success
				( data ) => {
					if ( data[ 0 ] ) {
						this.citeToolReferenceEditor.addReferenceSnaksFromCitoidData(
							data[ 0 ],
							$referenceView[ 0 ]
						);
					}
					$referenceView.tabs( { active: 0 } );
				},
				// failure
				() => {
					this.pendingDialog.popPending();
					this.pendingDialog.executeAction( 'error' );
				}

			).always( () => {
				// Set the manual tab to active, success or not
				$referenceView.tabs( { active: 0 } );
			} );
	};

	wb.CitoidTabRenderer = CitoidTabRenderer;

}( wikibase ) );
