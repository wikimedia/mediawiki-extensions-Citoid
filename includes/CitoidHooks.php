<?php
/**
 * Hooks for Citoid extension
 *
 * @file
 * @ingroup Extensions
 */

use MediaWiki\MediaWikiServices;
use Wikibase\Repo\WikibaseRepo;

class CitoidHooks {

	/**
	 * Adds extra variables to the global config
	 * @param array &$vars
	 */
	public static function onResourceLoaderGetConfigVars( array &$vars ) {
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'citoid' );

		$vars['wgCitoidConfig'] = [
			'citoidServiceUrl' => $config->get( 'CitoidServiceUrl' ),
			'fullRestbaseUrl' => $config->get( 'CitoidFullRestbaseURL' ),
			'wbFullRestbaseUrl' => $config->get( 'WBCitoidFullRestbaseURL' ),
		];
	}

	/**
	 * Virtual data file of 'ext.citoid.wikibase.init' module.
	 *
	 * @param ResourceLoaderContext $context
	 * @return string[]
	 */
	public static function getWikibaseInitData( ResourceLoaderContext $context ) {
		return [
			'toolConfig' => $context->msg( 'citoid-wikibase-config.json' )
				->inContentLanguage()
				->plain(),
		];
	}

	/**
	 * Loads front-end wikibase citoid module
	 * @param OutputPage &$out
	 */
	public static function onBeforePageDisplay( OutputPage &$out ) {
		if ( class_exists( WikibaseRepo::class ) ) {
			$lookup = WikibaseRepo::getEntityNamespaceLookup();
			if ( $lookup->isEntityNamespace( $out->getTitle()->getNamespace() ) ) {
				$out->addModules( 'ext.citoid.wikibase.init' );
			}
		}
	}

	/**
	 * @param User $user
	 * @param array &$preferences
	 */
	public static function onGetPreferences( User $user, array &$preferences ) {
		$preferences['citoid-mode'] = [
			'type' => 'api'
		];
	}
}
