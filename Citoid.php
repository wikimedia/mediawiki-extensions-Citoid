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
$wgAutoloadClasses['CitoidHooks'] = __DIR__ . '/C.hooks.php';
//$wgAutoloadClasses['SpecialHelloWorld'] = __DIR__ . '/specials/SpecialHelloWorld.php';
$wgMessagesDirs['Citoid'] = __DIR__ . '/i18n';
//$wgExtensionMessagesFiles['CitoidAlias'] = __DIR__ . '/Citoid.i18n.alias.php';

// Register hooks
#$wgHooks['NameOfHook'][] = 'CitoidHooks::onNameOfHook';

// Register special pages
//$wgSpecialPages['HelloWorld'] = 'SpecialHelloWorld';
//$wgSpecialPageGroups['HelloWorld'] = 'other';

// Register modules
$wgResourceModules['ext.Citoid.visualEditor'] = array(
	'scripts' => array(
		'modules/ve.ui.CiteFromURLDialogTool.js',
		'modules/ve.ui.CiteFromURLDialog.js',
	//	'modules/ve.ui.CiteFromURLDialogPage.js',
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

// Set Citoid service URL
// Not currently used
$wgCitoidServiceURL = 'http://citoid.wmflabs.org/';
