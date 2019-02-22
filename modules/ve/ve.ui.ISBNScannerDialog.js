/*!
 * VisualEditor UserInterface ISBNScannerDialog class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global Quagga */

/**
 * Dialog for searching for and selecting a language.
 *
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

	var cameraTools = new OO.ui.ButtonGroupWidget( {
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
	var track = Quagga.CameraAccess.getActiveTrack();
	track.applyConstraints( { advanced: [ { torch: value } ] } );
};

/**
 * Handle detected events from the scanner
 *
 * @param {Object} result Detection result
 */
ve.ui.ISBNScannerDialog.prototype.onDetected = function ( result ) {
	var code = result.codeResult.code;
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
		var drawingCtx = Quagga.canvas.ctx.overlay;
		var drawingCanvas = Quagga.canvas.dom.overlay;

		if ( result.boxes ) {
			drawingCtx.clearRect(
				0, 0,
				+drawingCanvas.getAttribute( 'width' ), +drawingCanvas.getAttribute( 'height' )
			);
			result.boxes.filter( function ( box ) {
				return box !== result.box;
			} ).forEach( function ( box ) {
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
		.next( function () {
			var dialog = this;

			ve.track( 'activity.' + this.constructor.static.name, { action: 'dialog-open' } );

			this.torchToggle.setDisabled( true );
			this.switchCameraButton.setDisabled( true );

			this.setupPromise = mw.loader.using( 'quagga2' ).then( function () {
				Quagga.CameraAccess.enumerateVideoDevices().then( function ( devices ) {
					dialog.devices = devices;

					dialog.initCamera();

					Quagga.onDetected( dialog.onDetectedListener );
					Quagga.onProcessed( dialog.onProcessedListener );

					dialog.switchCameraButton.setDisabled( dialog.devices.length < 2 );

				} );
			} );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.getReadyProcess = function ( data ) {
	return ve.ui.ISBNScannerDialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			return this.setupPromise;
		}, this );
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
	var dialog = this,
		constraints = {
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
	}, function ( err ) {
		dialog.started = true;
		if ( err ) {
			OO.ui.alert( err ).then( function () {
				dialog.close();
			} );
			return;
		}
		Quagga.start();
		setTimeout( function () {
			var track = Quagga.CameraAccess.getActiveTrack();
			var capabilities = {};
			if ( typeof track.getCapabilities === 'function' ) {
				capabilities = track.getCapabilities();
			}
			dialog.torchToggle.setDisabled( !capabilities.torch );
			if ( dialog.canCycleDevices && dialog.deviceIndex === null ) {
				// Detect the first selected camera index
				dialog.devices.some( function ( device, index ) {
					if ( device.label === track.label ) {
						dialog.deviceIndex = index;
						return true;
					}
					return false;
				} );
			}
		} );
	} );
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.ISBNScannerDialog.super.prototype.getTeardownProcess.call( this, data )
		.next( function () {
			this.stopCamera();
			Quagga.offDetected( this.onDetectedListener );
			Quagga.offDetected( this.onProcessedListener );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.ISBNScannerDialog.prototype.getBodyHeight = function () {
	return 500;
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.ISBNScannerDialog );
