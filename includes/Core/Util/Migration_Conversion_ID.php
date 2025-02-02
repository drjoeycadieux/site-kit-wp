<?php
/**
 * Migration for Conversion ID.
 *
 * @package   Google\Site_Kit\Core\Util
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\Util;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Modules\Modules;
use Google\Site_Kit\Core\Storage\Options;
use Google\Site_Kit\Modules\Analytics_4\Settings as Analytics_Settings;
use Google\Site_Kit\Modules\Ads;
use Google\Site_Kit\Modules\Ads\Settings as Ads_Settings;

/**
 * Class Migration_Conversion_ID
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
class Migration_Conversion_ID {
	/**
	 * Target DB version.
	 */
	const DB_VERSION = 'n.e.x.t';

	/**
	 * DB version option name.
	 */
	const DB_VERSION_OPTION = 'googlesitekit_db_version';

	/**
	 * Context instance.
	 *
	 * @since n.e.x.t
	 * @var Context
	 */
	protected $context;

	/**
	 * Options instance.
	 *
	 * @since n.e.x.t
	 * @var Options
	 */
	protected $options;

	/**
	 * Analytics_Settings instance.
	 *
	 * @since n.e.x.t
	 * @var Analytics_Settings
	 */
	protected $analytics_settings;

	/**
	 * Ads_Settings instance.
	 *
	 * @since n.e.x.t
	 * @var Ads_Settings
	 */
	protected $ads_settings;

	/**
	 * Constructor.
	 *
	 * @since n.e.x.t
	 *
	 * @param Context $context Plugin context instance.
	 * @param Options $options Optional. Options instance.
	 */
	public function __construct(
		Context $context,
		Options $options = null
	) {
		$this->context            = $context;
		$this->options            = $options ?: new Options( $context );
		$this->analytics_settings = new Analytics_Settings( $this->options );
		$this->ads_settings       = new Ads_Settings( $this->options );
	}

	/**
	 * Registers hooks.
	 *
	 * @since n.e.x.t
	 */
	public function register() {
		add_action( 'admin_init', array( $this, 'migrate' ) );
	}

	/**
	 * Migrates the DB.
	 *
	 * @since n.e.x.t
	 */
	public function migrate() {
		$db_version = $this->options->get( self::DB_VERSION_OPTION );

		if ( ! $db_version || version_compare( $db_version, self::DB_VERSION, '<' ) ) {
			$this->migrate_analytics_conversion_id_setting();
			$this->activate_ads_module();

			$this->options->set( self::DB_VERSION_OPTION, self::DB_VERSION );
		}
	}

	/**
	 * Migrates the Ads Conversion ID to the new Ads module.
	 *
	 * @since n.e.x.t
	 */
	protected function migrate_analytics_conversion_id_setting() {
		if ( ! $this->analytics_settings->has() ) {
			return;
		}

		$analytics_settings = $this->analytics_settings->get();

		if ( empty( $analytics_settings ) || ! array_key_exists( 'adsConversionID', $analytics_settings ) || empty( $analytics_settings['adsConversionID'] ) ) {
			return;
		}

		$ads_settings = $this->ads_settings->get();

		if ( array_key_exists( 'conversionID', $ads_settings ) && ! empty( $ads_settings['conversionID'] ) ) {
			// If there is already an adsConversionID set in the Ads module, do not overwrite it, remove it from the Analytics module.
			unset( $analytics_settings['adsConversionID'] );
			$this->analytics_settings->set( $analytics_settings );

			return;
		}

		$ads_settings['conversionID'] = $analytics_settings['adsConversionID'];
		$this->ads_settings->set( $ads_settings );

		unset( $analytics_settings['adsConversionID'] );
		$analytics_settings['adsConversionIDMigratedAtMs'] = time();

		$this->analytics_settings->set( $analytics_settings );
	}

	/**
	 * Activates the ads module if the Ads Conversion ID was previously set.
	 *
	 * @since n.e.x.t
	 */
	protected function activate_ads_module() {
		$active_modules = $this->options->get( Modules::OPTION_ACTIVE_MODULES );

		if ( is_array( $active_modules ) && in_array( 'ads', $active_modules, true ) ) {
			return;
		}

		$ads_settings = $this->ads_settings->get();

		// Activate the Ads module if the Ads Conversion ID was previously set
		// and the Ads module is not already active.
		if ( ! empty( $ads_settings['conversionID'] ) ) {
			$active_modules[] = Ads::MODULE_SLUG;
			$this->options->set( Modules::OPTION_ACTIVE_MODULES, $active_modules );
		}
	}
}
