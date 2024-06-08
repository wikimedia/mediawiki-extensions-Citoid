<?php
/**
 * Hooks for Citoid extension
 *
 * @file
 * @ingroup Extensions
 */

namespace MediaWiki\Extension\Citoid;

use ExtensionRegistry;
use MediaWiki\Config\Config;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use MediaWiki\User\User;
use Skin;
use Wikibase\Repo\WikibaseRepo;

class Hooks implements
	ResourceLoaderGetConfigVarsHook,
	BeforePageDisplayHook,
	GetPreferencesHook
{

	/**
	 * Adds extra variables to the global config
	 * @param array &$vars
	 * @param string $skin
	 * @param Config $config
	 */
	public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'citoid' );

		$vars['wgCitoidConfig'] = [
			'citoidServiceUrl' => $config->get( 'CitoidServiceUrl' ),
			'fullRestbaseUrl' => $config->get( 'CitoidFullRestbaseURL' ),
			'isbnScannerEnabled' => $config->get( 'CitoidIsbnScannerEnabled' ),
			'wbFullRestbaseUrl' => $config->get( 'WBCitoidFullRestbaseURL' ),
		];
	}

	/**
	 * Virtual data file of 'ext.citoid.wikibase.init' module.
	 *
	 * @param RL\Context $context
	 * @return string[]
	 */
	public static function getWikibaseInitData( RL\Context $context ) {
		return [
			'toolConfig' => $context->msg( 'citoid-wikibase-config.json' )
				->inContentLanguage()
				->plain(),
		];
	}

	/**
	 * Loads front-end wikibase citoid module
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		if ( !ExtensionRegistry::getInstance()->isLoaded( 'WikibaseRepository' ) ) {
			return;
		}
		$lookup = WikibaseRepo::getEntityNamespaceLookup();
		if ( $lookup->isEntityNamespace( $out->getTitle()->getNamespace() ) ) {
			$services = MediaWikiServices::getInstance();
			$isMobileView = ExtensionRegistry::getInstance()->isLoaded( 'MobileFrontend' ) &&
				$services->getService( 'MobileFrontend.Context' )->shouldDisplayMobileView();
			if ( !$isMobileView ) {
				$out->addModules( 'ext.citoid.wikibase.init' );
			}
		}
	}

	/**
	 * @param User $user
	 * @param array &$preferences
	 */
	public function onGetPreferences( $user, &$preferences ) {
		$preferences['citoid-mode'] = [
			'type' => 'api'
		];
	}
}
