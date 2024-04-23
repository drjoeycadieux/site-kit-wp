/**
 * `modules/ads` data store: adblocker.
 *
 * Site Kit by Google, Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_MODULES } from '../../../googlesitekit/modules/datastore/constants';
import { CORE_USER } from '../../../googlesitekit/datastore/user/constants';

export const selectors = {
	/**
	 * Returns appropriate ad blocker warning message based on modules connection status.
	 *
	 * @since 1.125.0
	 *
	 * @param {Object} state Data store's state.
	 * @return {(string|null|undefined)} The error message string if an ad blocker is active,
	 *                                   `null` if an ad blocker isn't detected,
	 *                                   `undefined` if ad blocker detection has not completed yet.
	 */
	getAdBlockerWarningMessage: Data.createRegistrySelector(
		( select ) => () => {
			const isAdBlockerActive = select( CORE_USER ).isAdBlockerActive();

			if ( undefined === isAdBlockerActive ) {
				return undefined;
			}

			if ( ! isAdBlockerActive ) {
				return null;
			}

			const isModuleConnected =
				select( CORE_MODULES ).isModuleConnected( 'ads' );

			if ( isModuleConnected ) {
				return __(
					'Ad blocker detected; please disable it to get the latest Ads data',
					'google-site-kit'
				);
			}

			return __(
				'Ad blocker detected; please disable it to set up Ads',
				'google-site-kit'
			);
		}
	),
};

export default {
	selectors,
};
