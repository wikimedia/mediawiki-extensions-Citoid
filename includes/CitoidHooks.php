<?php
/**
 * Hooks for Citoid extension
 *
 * @file
 * @ingroup Extensions
 */

use MediaWiki\MediaWikiServices;
/* @phan-suppress-next-line */
use Wikibase\Repo\WikibaseRepo;

class CitoidHooks {

	/**
	 * Adds extra variables to the global config
	 * @param array &$vars
	 * @return true
	 */
	public static function onResourceLoaderGetConfigVars( array &$vars ) {
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'citoid' );

		$vars['wgCitoidConfig'] = [
			'citoidServiceUrl' => $config->get( 'CitoidServiceUrl' ),
			'fullRestbaseUrl' => $config->get( 'CitoidFullRestbaseURL' ),
			'wbFullRestbaseUrl' => $config->get( 'WBCitoidFullRestbaseURL' ),
		];

		return true;
	}

	/**
	 * Loads front-end wikibase citoid module
	 * @param OutputPage &$out
	 * @return true
	 */
	public static function onBeforePageDisplay( OutputPage &$out ) {
		/* @phan-suppress-next-line PhanUndeclaredClassConstant*/
		if ( class_exists( WikibaseRepo::class ) ) {
			/* @phan-suppress-next-line PhanUndeclaredClassMethod*/
			$lookup = WikibaseRepo::getDefaultInstance()->getEntityNamespaceLookup();
			if ( $lookup->isEntityNamespace( $out->getTitle()->getNamespace() ) ) {
				$out->addModules( 'ext.citoid.wikibase.init' );
			}
		}

		return true;
	}

	/**
	 * Register qunit unit tests
	 * @param array &$testModules
	 * @param ResourceLoader &$resourceLoader
	 * @return true
	 */
	public static function onResourceLoaderTestModules(
		array &$testModules,
		ResourceLoader &$resourceLoader
	) {
		if (
			isset( $resourceModules[ 'ext.visualEditor.mediawiki' ] ) ||
			$resourceLoader->isModuleRegistered( 'ext.visualEditor.mediawiki' )
		) {
			$testModules['qunit']['ext.citoid.tests'] = [
				'scripts' => [
					'modules/tests/index.test.js'
				],
				'dependencies' => [
					'ext.citoid.visualEditor',
				],
				'localBasePath' => __DIR__ . '/..',
				'remoteExtPath' => 'Citoid',
			];
		}

		return true;
	}

	/**
	 * @param User $user
	 * @param array &$preferences
	 * @return true
	 */
	public static function onGetPreferences( User $user, array &$preferences ) {
		$preferences['citoid-mode'] = [
			'type' => 'api'
		];

		return true;
	}
}
