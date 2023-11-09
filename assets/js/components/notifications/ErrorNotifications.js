/**
 * ErrorNotifications component.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import AuthError from './AuthError';
import UnsatisfiedScopesAlert from './UnsatisfiedScopesAlert';
import UnsatisfiedScopesAlertGTE from './UnsatisfiedScopesAlertGTE';
import InternalServerError from './InternalServerError';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import {
	CORE_USER,
	FORM_TEMPORARY_PERSIST_PERMISSION_ERROR,
} from '../../googlesitekit/datastore/user/constants';
import { CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import { READ_SCOPE as TAGMANAGER_READ_SCOPE } from '../../modules/tagmanager/datastore/constants';
import { CORE_FORMS } from '../../googlesitekit/datastore/forms/constants';
import BannerNotification from './BannerNotification';
const { useSelect } = Data;

export default function ErrorNotifications() {
	const isAuthenticated = useSelect( ( select ) =>
		select( CORE_USER ).isAuthenticated()
	);

	// These will be `null` if no errors exist.
	const setupErrorCode = useSelect( ( select ) =>
		select( CORE_SITE ).getSetupErrorCode()
	);
	const setupErrorMessage = useSelect( ( select ) =>
		select( CORE_SITE ).getSetupErrorMessage()
	);
	const existingPermissionError = useSelect( ( select ) =>
		select( CORE_USER ).getPermissionScopeError()
	);
	const persistedPermissionsError = useSelect( ( select ) =>
		select( CORE_FORMS ).getValue(
			FORM_TEMPORARY_PERSIST_PERMISSION_ERROR,
			'permissionsError'
		)
	);
	const setupErrorRedoURL = useSelect( ( select ) => {
		if ( persistedPermissionsError?.data ) {
			return select( CORE_USER ).getConnectURL( {
				additionalScopes: persistedPermissionsError?.data?.scopes,
				redirectURL:
					persistedPermissionsError?.data?.redirectURL ||
					global.location.href,
			} );
		}
		if (
			setupErrorCode === 'access_denied' &&
			! persistedPermissionsError?.data &&
			existingPermissionError
		) {
			// If `existingPermissionError` have data it implies it is not due to the `plugin setup`, and CTA
			// should not render. This is explained in more detail in comment bellow in hidding the label part.
			return null;
		}

		return select( CORE_SITE ).getSetupErrorRedoURL();
	} );
	const errorTroubleshootingLinkURL = useSelect( ( select ) =>
		select( CORE_SITE ).getErrorTroubleshootingLinkURL( {
			code: setupErrorCode,
		} )
	);
	const ga4ModuleConnected = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleConnected( 'analytics-4' )
	);
	const hasTagManagerReadScope = useSelect( ( select ) =>
		select( CORE_USER ).hasScope( TAGMANAGER_READ_SCOPE )
	);

	const showUnsatisfiedScopesAlertGTE =
		ga4ModuleConnected && ! hasTagManagerReadScope;

	let title = __( 'Error connecting Site Kit', 'google-site-kit' );
	let ctaLabel = __( 'Redo the plugin setup', 'google-site-kit' );

	if ( setupErrorCode === 'access_denied' ) {
		title = __( 'Permissions Error', 'google-site-kit' );
		if ( persistedPermissionsError?.data ) {
			ctaLabel = __( 'Grant permission', 'google-site-kit' );
		} else if (
			! persistedPermissionsError?.data &&
			existingPermissionError
		) {
			// If there is `existingPermissionError` it implies that the 'access denied' error isn't shown
			// because of the plugin setup. If the plugin setup permission had been denied,
			// this would be empty. Therefore, no call-to-action should be displayed at this point,
			// as it would only request the generic analytics read permission without resolving the actual issue.
			ctaLabel = null;
		}
	}

	return (
		<Fragment>
			<InternalServerError />
			<AuthError />
			{ setupErrorMessage && (
				<BannerNotification
					id="setup_error"
					type="win-error"
					title={ title }
					description={ setupErrorMessage }
					isDismissible={ false }
					ctaLink={ setupErrorRedoURL }
					ctaLabel={ ctaLabel }
					learnMoreLabel={ __( 'Get help', 'google-site-kit' ) }
					learnMoreURL={ errorTroubleshootingLinkURL }
				/>
			) }
			{ ! setupErrorMessage && isAuthenticated && (
				<Fragment>
					{ ! showUnsatisfiedScopesAlertGTE && (
						<UnsatisfiedScopesAlert />
					) }
					{ showUnsatisfiedScopesAlertGTE && (
						<UnsatisfiedScopesAlertGTE />
					) }
				</Fragment>
			) }
		</Fragment>
	);
}
