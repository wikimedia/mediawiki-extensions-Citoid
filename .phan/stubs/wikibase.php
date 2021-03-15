<?php

/**
 * Minimal set of classes necessary to fulfill needs of parts of Citoid relying on
 * the Wikibase extension.
 * @codingStandardsIgnoreFile
 */

namespace Wikibase\Repo {
	class WikibaseRepo {
		static function getDefaultInstance(): self {
		}
		static function getEntityNamespaceLookup(): \Wikibase\Lib\Store\EntityNamespaceLookup {
		}
	}
}

namespace Wikibase\Lib\Store {
	class EntityNamespaceLookup {
		function isEntityNamespace( int $ns ): bool {
		}
	}
}
