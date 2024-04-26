/**
 * Ads Partner Ads Experience (PAX) Embedded App component.
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
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useInterval } from 'react-use';

/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_USER } from '../../../googlesitekit/datastore/user/constants';
import { AdBlockerWarning } from './common';
import CTA from '../../../components/notifications/CTA';
import { CORE_SITE } from '../../../googlesitekit/datastore/site/constants';
import PreviewBlock from '../../../components/PreviewBlock';
const { useSelect } = Data;

export default function PAXEmbeddedApp( {
	// eslint-disable-next-line no-unused-vars
	displayMode = 'default',
	onLaunch,
} ) {
	const [ launchGoogleAdsAvailable, setLaunchGoogleAdsAvailable ] = useState(
		typeof global?.google?.ads?.integration?.integrator?.launchGoogleAds ===
			'function'
	);
	const [ hasLaunchedPAXApp, setHasLaunchedPAXApp ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ launchError, setLaunchError ] = useState( undefined );

	const siteName = useSelect( ( select ) =>
		select( CORE_SITE ).getSiteName()
	);
	const siteURL = useSelect( ( select ) =>
		select( CORE_SITE ).getReferenceSiteURL()
	);

	const instanceID = useInstanceId( PAXEmbeddedApp, 'PAXEmbeddedApp' );

	const newPromise = async () => {};

	const callbackWithArgs = useCallback( ( name, callback = newPromise() ) => {
		return async ( ...args ) => {
			await global.console.debug( `Callback for: ${ name }`, {
				args,
				return: callback,
			} );

			return callback;
		};
	}, [] );

	const isAdBlockerActive = useSelect( ( select ) => {
		return select( CORE_USER ).isAdBlockerActive();
	} );

	const paxAppRef = useRef();

	const elementID = useMemo( () => {
		return `googlesitekit-pax-embedded-app-${ instanceID }`;
	}, [ instanceID ] );

	const paxConfig = useMemo( () => {
		return {
			...( global?._googlesitekitPAXConfig || {} ),
			clientConfig: {
				contentContainer: `#${ elementID }`,
			},
		};
	}, [ elementID ] );

	const paxServices = useMemo( () => {
		return {
			authenticationService: {
				get: callbackWithArgs( 'authenticationService:get', {
					accessToken:
						global?._googlesitekitPAXConfig?.authAccess
							?.oauthTokenAccess,
					authuser: '0',
				} ),
				fix: callbackWithArgs( 'authenticationService:fix', {
					retryReady: true,
				} ),
			},
			businessService: {
				getBusinessInfo: callbackWithArgs(
					'businessService:getBusinessInfo',
					{
						businessName: siteName,
						// Part of the API for PAX.
						// eslint-disable-next-line sitekit/acronym-case
						businessUrl: siteURL,
					}
				),
				fixBusinessInfo: callbackWithArgs(
					'businessService:fixBusinessInfo',
					{
						retryReady: true,
					}
				),
			},
			conversionTrackingService: {
				getSupportedConversionLabels: callbackWithArgs(
					'conversionTrackingService:getSupportedConversionLabels',
					{
						conversionLabels: [
							'purchase',
							'subscribe',
							'add_to_cart',
							'begin_checkout',
							'book_appointment',
							'contact',
							'request_quote',
							'phone_call_leads',
							'get_directions',
							'submit_lead_form',
							'sign_up',
						],
					}
				),
			},
			termsAndConditionsService: {
				notify: callbackWithArgs(
					'termsAndConditionsService:notify',
					{}
				),
			},
		};
	}, [ callbackWithArgs, siteName, siteURL ] );

	const launchPAXApp = useCallback( async () => {
		try {
			paxAppRef.current =
				await global.google.ads.integration.integrator.launchGoogleAds(
					paxConfig,
					paxServices
				);

			setIsLoading( false );

			onLaunch?.();
		} catch ( error ) {
			setLaunchError( error );
		}
	}, [ paxConfig, paxServices, onLaunch ] );

	useInterval( () => {
		if ( ! launchGoogleAdsAvailable || hasLaunchedPAXApp ) {
			return;
		}

		if (
			typeof global?.google?.ads?.integration?.integrator
				?.launchGoogleAds === 'function'
		) {
			setLaunchGoogleAdsAvailable( true );
		}
	}, 50 );

	useEffect( () => {
		if ( launchGoogleAdsAvailable && ! hasLaunchedPAXApp ) {
			setHasLaunchedPAXApp( true );

			launchPAXApp();
		}
	}, [
		hasLaunchedPAXApp,
		isLoading,
		launchGoogleAdsAvailable,
		launchPAXApp,
	] );

	return (
		<div className="googlesitekit-pax-embedded-app">
			{ isAdBlockerActive && <AdBlockerWarning /> }

			{ !! launchError && !! launchError?.message?.length && (
				<CTA
					title={ __( 'Google Ads error', 'google-site-kit' ) }
					description={ launchError?.message }
					error
				/>
			) }

			{ isLoading && <PreviewBlock width="100%" height="240px" /> }

			<div id={ elementID } />
		</div>
	);
}

PAXEmbeddedApp.propTypes = {
	displayMode: PropTypes.oneOf( [ 'default', 'reporting', 'setup' ] ),
	onLaunch: PropTypes.func,
};
