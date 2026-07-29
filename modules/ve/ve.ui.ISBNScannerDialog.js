/*!
 * VisualEditor UserInterface ISBNScannerDialog class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global Quagga */

/**
 * @class
 * @extends OO.ui.ProcessDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.ISBNScannerDialog = function VeUiISBNScannerDialog( config ) {
	// Parent constructor
	ve.ui.ISBNScannerDialog.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.ISBNScannerDialog, OO.ui.ProcessDialog );

/* Static Properties */

ve.ui.ISBNScannerDialog.static.name = 'isbnScanner';

ve.ui.ISBNScannerDialog.static.size = 'large';

ve.ui.ISBNScannerDialog.static.title = OO.ui.deferMsg( 'citoid-isbnscannerdialog-title' );

ve.ui.ISBNScannerDialog.static.actions = [
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		// Use 'back' as this dialog usually appears within the Citoid inspector process
		flags: [ 'safe', 'back' ]
	}
];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.ISBNScannerDialog.super.prototype.initialize.apply( this, arguments );

	this.onDetectedListener = this.onDetected.bind( this );
	this.onProcessedListener = this.onProcessed.bind( this );
	this.deviceIndex = null;
	this.facingMode = 'environment';
	this.started = false;
	this.canCycleDevices = !ve.init.platform.constructor.static.isIos();

	this.switchCameraButton = new OO.ui.ButtonWidget( {
		icon: 'switchCamera'
	} );
	this.torchToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'cameraFlash'
	} );

	const cameraTools = new OO.ui.ButtonGroupWidget( {
		classes: [ 've-ui-ISBNScannerDialog-tools' ],
		items: [ this.switchCameraButton, this.torchToggle ]
	} );

	this.switchCameraButton.connect( this, { click: this.onSwitchCameraButtonClick } );
	this.torchToggle.connect( this, { change: this.onTorchToggleChange } );

	this.$viewport = $( '<div>' ).addClass( 've-ui-ISBNScannerDialog-viewport' );
	this.$body.append( this.$viewport, cameraTools.$element );
};

/**
 * Handle click events from the switch camera button
 */
ve.ui.ISBNScannerDialog.prototype.onSwitchCameraButtonClick = function () {
	if ( this.canCycleDevices && this.deviceIndex !== null ) {
		this.deviceIndex = ( this.deviceIndex + 1 ) % this.devices.length;
	} else {
		this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
	}
	this.initCamera();
};

/**
 * Handle change events from the torch toggle button
 *
 * @param {boolean} value Toggle state
 */
ve.ui.ISBNScannerDialog.prototype.onTorchToggleChange = function ( value ) {
	const track = Quagga.CameraAccess.getActiveTrack();
	track.applyConstraints( { advanced: [ { torch: value } ] } );
};

/**
 * Handle detected events from the scanner
 *
 * @param {Object} result Detection result
 */
ve.ui.ISBNScannerDialog.prototype.onDetected = function ( result ) {
	const code = result.codeResult.code;
	if ( code.match( /^97[89]/ ) ) {
		ve.track( 'activity.' + this.constructor.static.name, { action: 'dialog-detected' } );
		this.close( {
			action: 'apply',
			code: code
		} );
	}
};

/**
 * Handle processed events from the scanner
 *
 * @param {Object} result Processing result
 */
ve.ui.ISBNScannerDialog.prototype.onProcessed = function ( result ) {
	if ( result ) {
		const drawingCtx = Quagga.canvas.ctx.overlay;
		const drawingCanvas = Quagga.canvas.dom.overlay;

		if ( result.boxes ) {
			drawingCtx.clearRect(
				0, 0,
				+drawingCanvas.getAttribute( 'width' ), +drawingCanvas.getAttribute( 'height' )
			);
			result.boxes.filter( ( box ) => box !== result.box ).forEach( ( box ) => {
				Quagga.ImageDebug.drawPath( box, { x: 0, y: 1 }, drawingCtx, { color: '#ccc', lineWidth: 2 } );
			} );
		}

		if ( result.box ) {
			Quagga.ImageDebug.drawPath( result.box, { x: 0, y: 1 }, drawingCtx, { color: '#f00', lineWidth: 2 } );
		}

		if ( result.codeResult && result.codeResult.code ) {
			Quagga.ImageDebug.drawPath( result.line, { x: 'x', y: 'y' }, drawingCtx, { color: '#0f0', lineWidth: 3 } );
		}
	}
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.getSetupProcess = function ( data ) {
	// Parent method
	return ve.ui.ISBNScannerDialog.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			ve.track( 'activity.' + this.constructor.static.name, { action: 'dialog-open' } );

			this.torchToggle.setDisabled( true );
			this.switchCameraButton.setDisabled( true );

			this.setupPromise = mw.loader.using( 'quagga2' )
				.then( () => Quagga.CameraAccess.enumerateVideoDevices() )
				.then( ( devices ) => {
					this.devices = devices;

					this.initCamera();

					Quagga.onDetected( this.onDetectedListener );
					Quagga.onProcessed( this.onProcessedListener );

					this.switchCameraButton.setDisabled( this.devices.length < 2 );
				} )
				// Without this the dialog would sit empty forever if the device
				// list can't be read.
				.catch( ( err ) => this.showCameraError( err ) );
		} );
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.getReadyProcess = function ( data ) {
	return ve.ui.ISBNScannerDialog.super.prototype.getReadyProcess.call( this, data )
		.next( () => this.setupPromise );
};

/**
 * Stop the camera
 */
ve.ui.ISBNScannerDialog.prototype.stopCamera = function () {
	if ( this.started ) {
		Quagga.stop();
		this.started = false;
	}
};

/**
 * Initialise the camera
 */
ve.ui.ISBNScannerDialog.prototype.initCamera = function () {
	const constraints = {
		width: 1280,
		height: 720
	};

	if ( this.deviceIndex !== null ) {
		constraints.deviceId = this.devices[ this.deviceIndex ].deviceId;
	} else {
		constraints.facingMode = this.facingMode;
	}

	// Turn off the torch, as switching camera will
	// cause this to happen anyway and we want to
	// keep the UI in sync.
	this.torchToggle.setValue( false );

	this.stopCamera();
	Quagga.init( {
		inputStream: {
			type: 'LiveStream',
			target: this.$viewport[ 0 ],
			constraints: constraints
		},
		locate: true,
		locator: {
			patchSize: 'medium',
			halfSample: true
		},
		numOfWorkers: 0,
		frequency: 10,
		decoder: {
			readers: [ { format: 'ean_reader', config: {} } ]
		}
	}, ( err ) => {
		this.started = true;
		if ( err ) {
			this.showCameraError( err );
			return;
		}
		Quagga.start();
		setTimeout( () => {
			const track = Quagga.CameraAccess.getActiveTrack();
			let capabilities = {};
			if ( typeof track.getCapabilities === 'function' ) {
				capabilities = track.getCapabilities();
			}
			this.torchToggle.setDisabled( !capabilities.torch );
			if ( this.canCycleDevices && this.deviceIndex === null ) {
				// Detect the first selected camera index
				const deviceIndex = this.devices.findIndex( ( device ) => device.label === track.label );
				this.deviceIndex = deviceIndex !== -1 ? deviceIndex : null;
			}
		} );
	} );
};

/**
 * Get the browser's camera permission state
 *
 * @return {Promise} Resolves with 'granted', 'denied' or 'prompt', or with null
 *  if the browser won't tell us
 */
ve.ui.ISBNScannerDialog.prototype.getCameraPermissionState = function () {
	// eslint-disable-next-line compat/compat
	const permissions = navigator.permissions;
	if ( !permissions ) {
		// Older but still technically supported Safari, mostly
		return Promise.resolve( null );
	}
	// If the browser doesn't know about "camera" it might throw
	try {
		return permissions.query( { name: 'camera' } )
			.then( ( status ) => status.state, () => null );
	} catch ( e ) {
		return Promise.resolve( null );
	}
};

/**
 * Report a camera failure to the user
 *
 * Shown in this dialog rather than via OO.ui.alert, which opens on the global
 * window manager and is rejected outright if anything else is open there.
 *
 * @param {Error} err Error from Quagga or getUserMedia
 * @return {Promise} Resolves once the error is shown
 */
ve.ui.ISBNScannerDialog.prototype.showCameraError = function ( err ) {
	const permissionError = err &&
		( err.name === 'NotAllowedError' || err.name === 'SecurityError' );

	if ( !permissionError ) {
		// getUserMedia rejects with a DOMException, which has no renderable
		// message, so always map it.
		this.showErrors( new OO.ui.Error(
			ve.msg( 'citoid-isbnscannerdialog-error', ( err && err.message ) || String( err ) ),
			{ recoverable: false }
		) );
		return Promise.resolve();
	}

	// Which advice is correct depends on whether the browser will ask again, and
	// only the permission state distinguishes that from a refused prompt.
	return this.getCameraPermissionState().then( ( state ) => {
		let message;
		let recoverable = false;
		switch ( state ) {
			case 'prompt':
				// Refused this time, but the browser will still ask again.
				message = ve.msg( 'citoid-isbnscannerdialog-error-permission-prompt' );
				recoverable = true;
				break;
			case 'denied':
				// Turned off for this site, so only a settings change will help.
				message = ve.msg( 'citoid-isbnscannerdialog-error-permission-denied' );
				break;
			case 'granted':
				// Allowed, so something outside the browser is blocking the camera.
				message = ve.msg( 'citoid-isbnscannerdialog-error-permission-granted' );
				break;
			default:
				// Unknown, so give advice that covers being asked and the settings.
				message = ve.msg( 'citoid-isbnscannerdialog-error-permission' );
		}
		this.showErrors( new OO.ui.Error( message, { recoverable } ) );
	} );
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.onDismissErrorButtonClick = function () {
	// Parent method
	ve.ui.ISBNScannerDialog.super.prototype.onDismissErrorButtonClick.apply( this, arguments );

	// The only errors we show are a dead camera, so dismissing should leave rather
	// than reveal an empty viewport.
	this.close();
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.onRetryButtonClick = function () {
	// Deliberately not the parent method: it re-runs the last dialog action, but
	// these errors are shown outside any action, so there is nothing to re-run.
	this.hideErrors();
	this.initCamera();
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.ISBNScannerDialog.super.prototype.getTeardownProcess.call( this, data )
		.next( () => {
			this.stopCamera();
			Quagga.offDetected( this.onDetectedListener );
			Quagga.offProcessed( this.onProcessedListener );
		} );
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.getBodyHeight = function () {
	return 500;
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.ISBNScannerDialog );
