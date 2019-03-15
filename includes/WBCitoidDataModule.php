<?php
/**
 * Resource loader module providing extra data from the server to Citoid
 * in wikibase.
 *
 * Temporary hack for T93800
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2015 Citoid Team and others; see AUTHORS.txt
 * @license MIT
 */

class WBCitoidDataModule extends ResourceLoaderModule {

	/** @var string[] */
	protected $targets = [ 'desktop', 'mobile' ];

	/**
	 * @param ResourceLoaderContext $context
	 * @return string
	 */
	public function getScript( ResourceLoaderContext $context ) {
		return 'mw.messages.set(' . FormatJson::encode(
			[
				'citoid-wikibase-config.json' =>
					$context->msg( 'citoid-wikibase-config.json' )
						->inContentLanguage()
						->plain(),
			],
			ResourceLoader::inDebugMode()
		) . ');';
	}

	/**
	 * @return bool
	 */
	public function enableModuleContentVersion() {
		return true;
	}
}
