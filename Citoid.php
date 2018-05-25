<?php
/**
 * Citoid extension - companion to Citoid service
 *
 * For more info see http://mediawiki.org/wiki/Extension:Citoid
 *
 * @file
 * @ingroup Extensions
 * @author 2014-2015 Marielle Volz and others
 * @license MIT
 */

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'Citoid' );

	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['Citoid'] = __DIR__ . '/i18n';

	/* wfWarn(
		'Deprecated PHP entry point used for Citoid extension. Please use wfLoadExtension '.
		'instead, see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	); */

	return true;
} else {
	die( 'This version of the Citoid extension requires MediaWiki 1.25+' );
}
