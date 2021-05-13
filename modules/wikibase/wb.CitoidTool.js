( function ( wb ) {

	'use strict';

	function CitoidTool( config ) {
		this.config = config;

		this.citoidClient = new wb.CitoidClient();
		this.citoidToolReferenceEditor = null;
		this.citoidTabRenderer = null;

		this.tabNames = [ 'manual', 'automatic' ];
	}

	CitoidTool.prototype.init = function () {
		var self = this;

		if ( !mw.config.exists( 'wbEntityId' ) ) {
			return;
		}

		// eslint-disable-next-line no-jquery/no-global-selector
		$( '.wikibase-entityview' )
			.on( 'referenceviewafterstartediting', function ( e ) {
				self.initAutomaticTab( e.target );
			} );

		this.pendingDialog = new wb.CitoidPendingDialog( {
			size: 'small'
		} );

		this.windowManager = new OO.ui.WindowManager();

		$( document.body ).append( this.windowManager.$element );

		this.windowManager.addWindows( [ this.pendingDialog ] );

		this.citoidToolReferenceEditor = new wb.CitoidToolReferenceEditor( self.config, self.windowManager, self.pendingDialog );
		this.citoidTabRenderer = new wb.CitoidTabRenderer(
			self.config,
			self.citoidClient,
			self.citoidToolReferenceEditor,
			self.windowManager,
			self.pendingDialog
		);
	};

	/**
	 * Gets the index of the tab from the name of the tab mode
	 *
	 * @param  {string} mode  name of the mode, i.e. 'automatic' or 'manual'
	 * @return {number}          integer representing tab position, or null if it doesn't exist
	 */
	CitoidTool.prototype.getTabIDFromMode = function ( mode ) {
		if ( mode ) {
			var tabID = this.tabNames.indexOf( mode );
			return ( tabID > -1 ) ? tabID : null;
		} else {
			return null;
		}
	};

	/**
	 * Gets the name of the tab from the index of the tab
	 *
	 * @param  {number}      id     index of mode, representing tab position
	 * @return {string}          name of the tab
	 */
	CitoidTool.prototype.getModeFromTabID = function ( id ) {
		return this.tabNames[ id ];
	};

	/**
	 * Gets mode preference, if set
	 *
	 * @return {string} mode name, i.e. 'manual' or 'automatic'
	 */
	CitoidTool.prototype.getModePreference = function () {
		var mode = mw.user.options.get( 'wb-reftabs-mode' );
		return mode;
	};

	/**
	 * Set mode for this page view only
	 *
	 * @param {string} mode     mode name, i.e. 'manual' or 'automatic'
	 */
	CitoidTool.prototype.setModePreference = function ( mode ) {
		mw.user.options.set( 'wb-reftabs-mode', mode );
	};

	CitoidTool.prototype.initAutomaticTab = function ( referenceView ) {
		var mode, tabID,
			$refView = $( referenceView ),
			reference = this.getReferenceFromView( referenceView );

		this.citoidTabRenderer.renderTab( referenceView );

		// Disable automatic tab for existing references
		if ( reference ) {
			$refView.tabs( 'disable', 1 );
			$refView.tabs( { active: 0 } );
		// Switch to automatic tab if new reference is being created and user preference has not been set
		} else {

			// Enable automatic tab
			$refView.tabs( 'enable', 1 );

			// Check user preference for preferred active tab, otherwise use automatic
			mode = this.getModePreference();
			if ( !mode ) {
				mode = 'automatic';
				this.setModePreference( mode );
			}

			// Set active tab according to user preference
			tabID = this.getTabIDFromMode( mode );
			$refView.tabs( { active: tabID } );

			if ( mode === 'automatic' ) {
				$refView.find( 'input.citoid-search' ).trigger( 'focus' );
				$refView.find( 'span.wikibase-citoid-search' ).toolbarbutton( 'disable' );
			}
		}
	};

	CitoidTool.prototype.getReferenceFromView = function ( referenceView ) {
		var refView;
		// not a reference view change
		if ( !referenceView ) {
			return null;
		}

		refView = $( referenceView ).data( 'referenceview' );

		return refView.value();
	};

	wb.CitoidTool = CitoidTool;

}( wikibase ) );
