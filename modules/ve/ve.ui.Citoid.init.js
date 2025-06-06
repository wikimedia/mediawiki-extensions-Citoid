let map;
// Don't create tool unless the configuration message is present
try {
	map = JSON.parse( mw.message( 'citoid-template-type-map.json' ).plain() );
} catch ( e ) {}

// Check map has all required keys if no default template is supplied
// eslint-disable-next-line no-underscore-dangle
if ( map && !map._default ) {

	// New Zotero types: make optional temporarily for backwards compatibility phab:T383667
	const optionalMappings = [
		'dataset',
		'preprint',
		'standard'
	];

	const missingOptionalMappings = optionalMappings.filter( ( key ) => !map[ key ] );
	if ( missingOptionalMappings.length ) {
		mw.log.warn( 'Mapping(s) missing from citoid-template-type-map.json: ' + missingOptionalMappings.join( ', ' ) );
	}

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

	const missingRequiredMappings = requiredMappings.filter( ( key ) => !map[ key ] );
	if ( missingRequiredMappings.length ) {
		mw.log.warn( 'Required mapping(s) missing from citoid-template-type-map.json, unregistering tool: ' + missingRequiredMappings.join( ', ' ) );
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

	const modifiedToolbarGroups = [];

	mw.hook( 've.newTarget' ).add( ( target ) => {
		const toolbarGroups = target.constructor.static.toolbarGroups;

		if ( modifiedToolbarGroups.includes( toolbarGroups ) ) {
			return;
		}
		if ( ve.init.mw.MobileArticleTarget && target instanceof ve.init.mw.MobileArticleTarget ) {
			// Place at the top of the insert group on mobile
			const insertGroup = toolbarGroups.find(
				( toolbarGroup ) => toolbarGroup.name === 'insert' ||
				// Name used in CX.
				// TODO: Change this to 'insert'
				toolbarGroup.name === 'extra'
			);
			if ( insertGroup ) {
				insertGroup.forceExpand = [
					'citoid',
					...( insertGroup.forceExpand || [] )
				];
				insertGroup.promote = [
					'citoid',
					...( insertGroup.promote || [] )
				];
			} else {
				// TODO: Remove once mobile insert menu is deployed (T382454)
				const index = toolbarGroups.findIndex( ( toolbarGroup ) => toolbarGroup.name === 'link' );
				if ( index !== -1 ) {
					toolbarGroups.splice( index, 0, {
						name: 'citoid',
						include: [ 'citoid' ]
					} );
				}
			}
		} else {
			// The citoid tool replaces the cite group in the toolbar,
			// if it exists, or it will appear in the catch-all group.
			const index = toolbarGroups.findIndex( ( toolbarGroup ) => toolbarGroup.name === 'cite' );
			if ( index !== -1 ) {
				toolbarGroups[ index ] = {
					name: 'citoid',
					include: [ 'citoid' ]
				};
			}
		}

		modifiedToolbarGroups.push( toolbarGroups );
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
