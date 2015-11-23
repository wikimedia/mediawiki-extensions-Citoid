<?php
/**
 * Resource loader module providing extra data from the server to Citoid.
 *
 * Temporary hack for T93800
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2015 Citoid Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

class CitoidDataModule extends ResourceLoaderModule {

	/* Protected Members */

	protected $origin = self::ORIGIN_USER_SITEWIDE;
	protected $targets = array( 'desktop', 'mobile' );

	/* Methods */

	public function getScript( ResourceLoaderContext $context ) {
		return
			've.init.platform.addMessages(' . FormatJson::encode(
				array(
					'citoid-template-type-map-backup.json' => wfMessage( 'citoid-template-type-map.json' )->plain()
				),
				ResourceLoader::inDebugMode()
			) . ');';
	}

	public function getDependencies( ResourceLoaderContext $context = null ) {
		return array(
			'ext.visualEditor.base',
			'ext.visualEditor.mediawiki',
		);
	}

	public function enableModuleContentVersion() {
		return true;
	}
}
