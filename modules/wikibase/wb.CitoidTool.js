( function ( wb ) {

	'use strict';

	function CitoidTool( config ) {
		this.config = config;

		this.citoidClient = new wb.CitoidClient();
		this.citoidToolReferenceEditor = null;
		this.citoidTabRenderer = null;
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

	CitoidTool.prototype.initAutomaticTab = function ( referenceView ) {
		var $refView = $( referenceView ),
			reference = this.getReferenceFromView( referenceView );

		this.citoidTabRenderer.renderTab( referenceView );

		// Disable tabs for existing references
		if ( reference ) {
			$refView.tabs( 'disable', 1 );
			$refView.tabs( { active: 0 } );
		// Switch to automatic tab if new reference is being created
		} else {
			$refView.tabs( 'enable', 1 );
			$refView.tabs( { active: 1 } );
			$refView.find( 'input.citoid-search' ).trigger( 'focus' );
			$refView.find( 'span.wikibase-citoid-search' ).toolbarbutton( 'disable' );
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
