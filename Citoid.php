<?php
/**
 * Citoid extension - companion to Citoid service
 *
 * For more info see http://mediawiki.org/wiki/Extension:Citoid
 *
 * @file
 * @ingroup Extensions
 * @author 2014-2015 Marielle Volz and others
 * @license The MIT License (MIT); see LICENSE.txt
 */

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'Citoid',
	'author' => array(
		'Marielle Volz',
	),
	'version'  => '0.1.0',
	'url' => 'https://www.mediawiki.org/wiki/Citoid',
	'descriptionmsg' => 'citoid-desc',
	'license-name' => 'MIT',
);

/* Setup */

// Register files
$wgAutoloadClasses['CitoidHooks'] = __DIR__ . '/Citoid.hooks.php';
$wgMessagesDirs['Citoid'] = __DIR__ . '/i18n';

// Register hooks
$wgHooks['ResourceLoaderGetConfigVars'][] = 'CitoidHooks::onResourceLoaderGetConfigVars';
$wgHooks['ContentHandlerDefaultModelFor'][] = 'CitoidHooks::onContentHandlerDefaultModelFor';

// Register modules
$wgResourceModules['ext.citoid.visualEditor'] = array(
	'scripts' => array(
		'modules/ve.ui.CiteFromIdInspectorTool.js',
		'modules/ve.ui.CiteFromIdOptionWidget.js',
		'modules/ve.ui.CiteFromIdInspector.js'
	),
	'styles' => array(
		'modules/ve.ui.CiteFromIdInspector.css'
	),
	'dependencies ' => array(
		'ext.visualEditor.mwreference',
		'json'
	),
	'messages' => array(
		'citoid-520-error',
		'citoid-citeFromIDDialog-lookup-button',
		'citoid-citeFromIDDialog-search',
		'citoid-citeFromIDDialog-search-label',
		'citoid-citeFromIDDialog-search-placeholder',
		'citoid-citeFromIDDialog-search-progress',
		'citoid-citeFromIDDialog-title',
		'citoid-citeFromIDTool-title',
		'citoid-template-type-map.json',
		'citoid-typeMap-config-error',
		'citoid-unknown-error'
	),
	'targets' => array( 'desktop', 'mobile' ),
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'Citoid',
);

$wgVisualEditorPluginModules[] = 'ext.citoid.visualEditor';

/* Configuration */

// Requires https protocol to work in FireFox, but
// Service doesn't need a security cert
$wgCitoidServiceUrl = 'https://localhost:1970/api';

