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

	public static function onContentHandlerDefaultModelFor( Title $title, &$model ) {
		if ( $title->inNamespace( NS_MEDIAWIKI ) && $title->getText() === 'Citoid-template-type-map.json' ) {
			$model = CONTENT_MODEL_JSON;
		}

		return true;
	}
}
