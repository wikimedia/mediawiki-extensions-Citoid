<?php
/**
 * Hooks for Citoid extension
 *
 * @file
 * @ingroup Extensions
 */

class CitoidHooks {

	/**
	 * Adds extra variables to the global config
	 */
	public static function onResourceLoaderGetConfigVars( array &$vars ) {
		global $wgCitoidServiceUrl;

		$vars['wgCitoidConfig'] = array(
			'citoidServiceUrl' => $wgCitoidServiceUrl
		);

		return true;
	}

	/**
	 * Register qunit unit tests
	 */
	public static function onResourceLoaderTestModules(
		array &$testModules,
		ResourceLoader &$resourceLoader
	) {
		if (
			isset( $resourceModules[ 'ext.visualEditor.mediawiki' ] ) ||
			$resourceLoader->isModuleRegistered( 'ext.visualEditor.mediawiki' )
		) {
			$testModules['qunit']['ext.citoid.tests'] = array(
				'scripts' => array(
					'modules/tests/index.test.js'
					),
				'dependencies' => array(
					'ext.citoid.visualEditor',
				),
				'localBasePath' => __DIR__,
				'remoteExtPath' => 'Citoid',
			);
		}

		return true;
	}

	public static function onGetPreferences( User $user, array &$preferences ) {
		$preferences['citoid-mode'] = array(
			'type' => 'api'
		);
		return true;
	}
}
