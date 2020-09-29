/**
 * Country and Time Zone utilities.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
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
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { countries } from './countries-data';

export const allCountries = countries.default.country;

export const timeZonesByCountryCode = allCountries.reduce( ( map, country ) => {
	map[ country.countryCode ] = country.timeZone;

	return map;
}, {} );

export const countriesByCode = keyBy( allCountries, 'countryCode' );

export const countryCodesByTimezone = allCountries.reduce( ( map, country ) => {
	country.timeZone.forEach( ( { timeZoneId } ) => map[ timeZoneId ] = country.countryCode ); // eslint-disable-line sitekit/camelcase-acronyms

	return map;
}, {} );

export const countriesByTimeZone = allCountries.reduce( ( map, country ) => {
	country.timeZone.forEach( ( { timeZoneId } ) => { // eslint-disable-line sitekit/camelcase-acronyms
		map[ timeZoneId ] = country; // eslint-disable-line sitekit/camelcase-acronyms
	} );
	return map;
}, {} );
