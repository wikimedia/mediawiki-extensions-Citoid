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

}
