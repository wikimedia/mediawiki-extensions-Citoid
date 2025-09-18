<?php
/**
 * Hooks for Citoid extension
 *
 * @file
 * @ingroup Extensions
 */

namespace MediaWiki\Extension\Citoid;

use MediaWiki\Config\Config;
use MediaWiki\Config\ConfigFactory;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use MediaWiki\Skin\Skin;
use MediaWiki\User\User;
use MobileContext;
use Wikibase\Lib\Store\EntityNamespaceLookup;

class Hooks implements
	ResourceLoaderGetConfigVarsHook,
	BeforePageDisplayHook,
	GetPreferencesHook
{

	public function __construct(
		private readonly ConfigFactory $configFactory,
		private readonly ExtensionRegistry $extensionRegistry,
		private readonly ?EntityNamespaceLookup $entityNamespaceLookup,
		private readonly ?MobileContext $mobileContext,
	) {
	}

	/**
	 * Adds extra variables to the global config
	 * @param array &$vars
	 * @param string $skin
	 * @param Config $config
	 */
	public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
		$citoidConfig = $this->configFactory->makeConfig( 'citoid' );

		$vars['wgCitoidConfig'] = [
			'citoidServiceUrl' => $citoidConfig->get( 'CitoidServiceUrl' ),
			/** @deprecated since 1.45 */
			'fullRestbaseUrl' => $citoidConfig->get( 'CitoidFullRestbaseURL' ),
			'isbnScannerEnabled' => $citoidConfig->get( 'CitoidIsbnScannerEnabled' ),
			/** @deprecated since 1.45 */
			'wbFullRestbaseUrl' => $citoidConfig->get( 'WBCitoidFullRestbaseURL' ),
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
		if ( !$this->extensionRegistry->isLoaded( 'WikibaseRepository' ) ) {
			return;
		}
		if ( $this->entityNamespaceLookup->isEntityNamespace( $out->getTitle()->getNamespace() ) ) {
			$isMobileView = $this->extensionRegistry->isLoaded( 'MobileFrontend' ) &&
				$this->mobileContext->shouldDisplayMobileView();
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
