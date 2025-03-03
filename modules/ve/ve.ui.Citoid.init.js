let map;
// Don't create tool unless the configuration message is present
try {
	map = JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
} catch ( e ) {}

// Check map has all required keys
if ( map ) {
	const requiredMappings = [
		'artwork',
		'audioRecording',
		'bill',
		'blogPost',
		'book',
		'bookSection',
		'case',
		'computerProgram',
		'conferencePaper',
		'dictionaryEntry',
		'document',
		'email',
		'encyclopediaArticle',
		'film',
		'forumPost',
		'hearing',
		'instantMessage',
		'interview',
		'journalArticle',
		'letter',
		'magazineArticle',
		'manuscript',
		'map',
		'newspaperArticle',
		'patent',
		'podcast',
		'presentation',
		'radioBroadcast',
		'report',
		'statute',
		'thesis',
		'tvBroadcast',
		'videoRecording',
		'webpage'
	];

	const missingMappings = requiredMappings.filter( ( key ) => !map[ key ] );
	if ( missingMappings.length ) {
		mw.log.warn( 'Mapping(s) missing from citoid-template-type-map.json: ' + missingMappings.join( ', ' ) );
		map = undefined;
	}
}

// Expose
ve.ui.mwCitoidMap = map;

( function () {
	// If there is no template map ("auto") or citation tools ("manual")
	// don't bother registering Citoid at all.
	if ( !( ve.ui.mwCitoidMap || ve.ui.mwCitationTools.length ) ) {
		// Unregister the tool
		ve.ui.toolFactory.unregister( ve.ui.CitoidInspectorTool );
		return;
	}

	/* Command */
	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'citoid', 'citoid', 'open', { supportedSelections: [ 'linear' ] }
		)
	);

	/* Sequence */
	ve.ui.sequenceRegistry.register(
		new ve.ui.Sequence( 'wikitextRef', 'citoid', '<ref', 4 )
	);

	/* Trigger */
	// Unregister Cite's trigger
	ve.ui.triggerRegistry.unregister( 'reference' );
	ve.ui.triggerRegistry.register(
		'citoid', { mac: new ve.ui.Trigger( 'cmd+shift+k' ), pc: new ve.ui.Trigger( 'ctrl+shift+k' ) }
	);

	/* Command help */
	// This will replace Cite's trigger on insert/ref
	// "register" on commandHelpRegistry is more of an "update", so we don't need to provide label/sequence.
	ve.ui.commandHelpRegistry.register( 'insert', 'ref', {
		trigger: 'citoid'
	} );

	/* Setup tools and toolbars */

	// HACK: Find the position of the current citation toolbar definition
	// and manipulate it.

	// Unregister regular citation tools so they don't end up in catch-all groups
	for ( const name in ve.ui.toolFactory.registry ) {
		const toolClass = ve.ui.toolFactory.lookup( name );
		if (
			name === 'reference' || name.indexOf( 'reference/' ) === 0 ||
			toolClass.prototype instanceof ve.ui.MWCitationDialogTool
		) {
			ve.ui.toolFactory.unregister( toolClass );
		}
	}

	function fixTarget( target ) {
		const toolbarGroups = target.static.toolbarGroups;
		// Instead of using the rigid position of the group,
		// downgrade this hack from horrific to somewhat less horrific by
		// looking through the object to find what we actually need
		// to replace. This way, if toolbarGroups are changed in VE code
		// we won't have to manually change the index here.
		toolbarGroups.some( ( toolbarGroup, i ) => {
			// Replace the previous cite group with the citoid tool.
			// If there is no cite group, citoid will appear in the catch-all group
			if ( toolbarGroup.name === 'cite' ) {
				toolbarGroups[ i ] = {
					name: 'citoid',
					include: [ 'citoid' ]
				};
				return true;
			}
			return false;
		} );
	}

	for ( const fixName in ve.init.mw.targetFactory.registry ) {
		fixTarget( ve.init.mw.targetFactory.lookup( fixName ) );
	}

	ve.init.mw.targetFactory.on( 'register', ( n, target ) => {
		fixTarget( target );
	} );

	// Add a "Replace reference" action to reference and citation dialogs
	function extendDialog( dialogClass ) {
		const getActionProcess = dialogClass.prototype.getActionProcess;
		dialogClass.prototype.getActionProcess = function ( action ) {
			if ( action === 'replace' ) {
				return new OO.ui.Process( () => {
					this.close( { action: action } ).closed.then( () => {
						const surface = this.getManager().getSurface();
						surface.execute( 'citoid', 'open', true );
					} );
				} );
			}
			return getActionProcess.call( this, action );
		};
		// Clone the array, so that we don't add this action to some unrelated parent class
		dialogClass.static.actions = [
			...dialogClass.static.actions,
			{
				action: 'replace',
				label: OO.ui.deferMsg( 'citoid-action-replace' ),
				icon: 'quotes',
				modes: [ 'edit' ]
			}
		];
	}
	extendDialog( ve.ui.MWReferenceDialog );
	extendDialog( ve.ui.MWCitationDialog );

}() );
