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
		'modules/ve.ui.CiteFromIDDialogTool.js',
		'modules/ve.ui.CiteFromIDDialog.js'
	),
	'styles' => array(
	),
	'dependencies ' => array(
		'json'
	),
	'messages' => array(
		'citoid-520-error',
		'citoid-citeFromIDDialog-search',
		'citoid-citeFromIDDialog-search-label',
		'citoid-citeFromIDDialog-search-placeholder',
		'citoid-citeFromIDDialog-search-progress',
		'citoid-citeFromIDDialog-title',
		'citoid-citeFromIDTool-title',
		'citoid-typeMap-config-error',
		'citoid-template-type-map.json'
	),
	'targets' => array( 'desktop' ), //mwreferences doesn't work in mobile currently
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'Citoid',
);

$wgVisualEditorPluginModules[] = 'ext.Citoid.visualEditor';

/* Configuration */

// Requires https protocol to work in FireFox, but
// Service doesn't need a security cert
$wgCitoidServiceUrl = 'https://localhost:1970/api';

