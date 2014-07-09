//---------- CiteFromURL tool ------------------

ve.ui.CiteFromURLDialogTool = function VeUiCiteFromURLDialogTool( toolGroup, config ) {
	OO.ui.Tool.call( this, toolGroup, config );
};

OO.inheritClass( ve.ui.CiteFromURLDialogTool, OO.ui.Tool );

ve.ui.CiteFromURLDialogTool.static.name = 'citefromurl';
ve.ui.CiteFromURLDialogTool.static.icon = 'ref-cite-web';
ve.ui.CiteFromURLDialogTool.static.title = mw.msg( 'citoid-citeFromURLTool-title' );

ve.ui.CiteFromURLDialogTool.prototype.onSelect = function () {
	this.toolbar.getSurface().execute( 'window', 'open', 'citefromurl', null );
};

ve.ui.CiteFromURLDialogTool.prototype.onUpdateState = function () {
	this.setActive( false );
};

ve.ui.toolFactory.register( ve.ui.CiteFromURLDialogTool );
