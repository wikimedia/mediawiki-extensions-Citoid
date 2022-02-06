<?php
/**
 * Resource loader module providing extra data from the server to Citoid.
 *
 * Temporary hack for T93800
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2015 Citoid Team and others; see AUTHORS.txt
 * @license MIT
 */

namespace MediaWiki\Extension\Citoid;

use FormatJson;
use ResourceLoader;
use ResourceLoaderContext;
use ResourceLoaderModule;

class CitoidDataModule extends ResourceLoaderModule {

	/** @var string[] */
	protected $targets = [ 'desktop', 'mobile' ];

	/**
	 * @param ResourceLoaderContext $context
	 * @return string
	 */
	public function getScript( ResourceLoaderContext $context ) {
		return 've.init.platform.addMessages(' . FormatJson::encode(
			[
				'citoid-template-type-map.json' =>
					$context->msg( 'citoid-template-type-map.json' )
						->inContentLanguage()
						->plain(),
			],
			(bool)ResourceLoader::inDebugMode()
		) . ');';
	}

	/**
	 * @param ResourceLoaderContext|null $context
	 * @return string[]
	 */
	public function getDependencies( ResourceLoaderContext $context = null ) {
		return [
			'ext.visualEditor.base',
			'ext.visualEditor.mediawiki',
		];
	}

	/**
	 * @return bool
	 */
	public function enableModuleContentVersion() {
		return true;
	}
}
