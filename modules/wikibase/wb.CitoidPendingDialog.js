( function ( wb ) {

	'use strict';

	function CitoidPendingDialog( config ) {
		CitoidPendingDialog.super.call( this, config );
	}

	OO.inheritClass( CitoidPendingDialog, OO.ui.ProcessDialog );

	CitoidPendingDialog.static.name = 'CitoidPendingDialog';
	CitoidPendingDialog.static.title = OO.ui.deferMsg( 'citoid-wb-pendingdialog-title' );

	CitoidPendingDialog.static.actions = [
		{ action: 'waiting', modes: 'edit', label: 'Searching' },
		{ action: 'accept', modes: 'error', label: 'Dismiss' }
	];

	CitoidPendingDialog.prototype.initialize = function () {
		CitoidPendingDialog.super.prototype.initialize.apply( this, arguments );

		this.waitingPanel = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false,
			text: mw.msg( 'citoid-wb-pendingdialog-message' )
		} );
		this.errorPanel = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false,
			text: mw.msg( 'citoid-wb-pendingdialog-error' )
		} );

		this.stackLayout = new OO.ui.StackLayout( {
			items: [ this.waitingPanel, this.errorPanel ]
		} );

		this.stackLayout.setItem( this.waitingPanel );
		this.$body.append( this.stackLayout.$element );

	};

	CitoidPendingDialog.prototype.getSetupProcess = function ( data ) {
		return CitoidPendingDialog.super.prototype.getSetupProcess.call( this, data )
			.next( function () {
				this.actions.setMode( 'waiting' );
			}, this );
	};

	CitoidPendingDialog.prototype.getActionProcess = function ( action ) {
		var dialog = this;
		if ( action === 'waiting' ) {
			this.actions.setMode( 'waiting' );
			this.stackLayout.setItem( this.waitingPanel );
		} else if ( action === 'error' ) {
			this.popPending();
			this.actions.setMode( 'error' );
			this.stackLayout.setItem( this.errorPanel );
		} else if ( action === 'accept' ) {
			return new OO.ui.Process( function () {
				dialog.close( {
					action: action
				} );
			} );
		}
		return CitoidPendingDialog.super.prototype.getActionProcess.call( this, action );
	};

	CitoidPendingDialog.prototype.getBodyHeight = function () {
		return this.stackLayout.getCurrentItem().$element.outerHeight( true );
	};

	wb.CitoidPendingDialog = CitoidPendingDialog;

}( wikibase ) );
