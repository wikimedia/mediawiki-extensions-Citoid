<?php
/**
 * Citoid extension - companion to Citoid service
 *
 * For more info see http://mediawiki.org/wiki/Extension:Citoid
 *
 * @file
 * @ingroup Extensions
 * @author mvolz, 2014
 * @license GNU General Public Licence 2.0 or later
 */

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'Citoid',
	'author' => array(
		'mvolz',
	),
	'version'  => '0.0.0',
	'url' => 'https://www.mediawiki.org/wiki/Citoid',
	'descriptionmsg' => 'citoid-desc',
);

/* Setup */

// Register files
$wgAutoloadClasses['CitoidHooks'] = __DIR__ . '/Citoid.hooks.php';
$wgMessagesDirs['Citoid'] = __DIR__ . '/i18n';

// Register hooks
$wgHooks['ResourceLoaderGetConfigVars'][] = 'CitoidHooks::onResourceLoaderGetConfigVars';

// Register modules
$wgResourceModules['ext.Citoid.visualEditor'] = array(
	'scripts' => array(
		'modules/ve.ui.CiteFromURLDialogTool.js',
		'modules/ve.ui.CiteFromURLDialog.js'
	),
	'styles' => array(
	),
	'messages' => array(
		'citoid-citeFromURLDialog-search-placeholder',
		'citoid-citeFromURLDialog-search-label',
		'citoid-citeFromURLDialog-search',
		'citoid-citeFromURLDialog-search-progress',
		'citoid-citeFromURLTool-title',
		'citoid-citeFromURLDialog-title'
	),
	'targets' => array( 'desktop'), //mwreferences doesn't work in mobile currently
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'Citoid',
);

$wgVisualEditorPluginModules[] = 'ext.Citoid.visualEditor';

/* Configuration */

// Requires https protocol to work in FireFox, but
// Service doesn't need a security cert
$wgCitoidServiceUrl = 'https://localhost:1970';

