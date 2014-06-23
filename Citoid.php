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
	'url' => 'https://www.mediawiki.org/wiki/Extension:Citoid',
	'descriptionmsg' => 'citoid-desc',
);

/* Setup */

// Register files
$wgAutoloadClasses['CitoidHooks'] = __DIR__ . '/C.hooks.php';
$wgAutoloadClasses['SpecialHelloWorld'] = __DIR__ . '/specials/SpecialHelloWorld.php';
$wgMessagesDirs['Citoid'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['CitoidAlias'] = __DIR__ . '/Citoid.i18n.alias.php';

// Register hooks
#$wgHooks['NameOfHook'][] = 'CitoidHooks::onNameOfHook';

// Register special pages
$wgSpecialPages['HelloWorld'] = 'SpecialHelloWorld';
$wgSpecialPageGroups['HelloWorld'] = 'other';

// Register modules
$wgResourceModules['ext.Citoid.foo'] = array(
	'scripts' => array(
		'modules/ext.Citoid.foo.js',
	),
	'styles' => array(
		'modules/ext.Citoid.foo.css',
	),
	'messages' => array(
	),
	'dependencies' => array(
	),

	'localBasePath' => __DIR__,
	'remoteExtPath' => 'Citoid',
);


/* Configuration */

// Enable Foo
#$wgCitoidEnableFoo = true;
