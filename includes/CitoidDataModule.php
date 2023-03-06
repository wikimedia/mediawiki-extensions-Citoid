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

use MediaWiki\ResourceLoader as RL;

class CitoidDataModule extends RL\Module {

	/** @var string[] */
	protected $targets = [ 'desktop', 'mobile' ];

	/**
	 * @param RL\Context $context
	 * @return string
	 */
	public function getScript( RL\Context $context ) {
		return 've.init.platform.addMessages(' . $context->encodeJson(
			[
				'citoid-template-type-map.json' =>
					$context->msg( 'citoid-template-type-map.json' )
						->inContentLanguage()
						->plain(),
			]
		) . ');';
	}

	/**
	 * @param RL\Context|null $context
	 * @return string[]
	 */
	public function getDependencies( RL\Context $context = null ) {
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
