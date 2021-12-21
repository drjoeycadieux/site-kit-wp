/**
 * `modules/idea-hub` data store: idea-state tests.
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
 * Internal dependencies
 */
import API from 'googlesitekit-api';
import { MODULES_IDEA_HUB } from './constants';
import {
	createTestRegistry,
	unsubscribeFromAll,
} from '../../../../../tests/js/utils';
import { enabledFeatures } from '../../../features';
import * as fixtures from './__fixtures__';

describe( 'modules/idea-hub idea-state', () => {
	let registry;
	let store;

	const ideaStateFixture = {
		name: 'ideas/7612031899179595408',
		saved: false,
		dismissed: false,
	};
	const ideaHubData = {
		lastIdeaPostUpdatedAt: '123',
	};

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		enabledFeatures.add( 'ideaHubModule' );
		registry = createTestRegistry();
		store = registry.stores[ MODULES_IDEA_HUB ].store;
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	describe( 'actions', () => {
		describe( 'updateIdeaState', () => {
			it( "updates a given idea's state", async () => {
				fetchMock.postOnce(
					/^\/google-site-kit\/v1\/modules\/idea-hub\/data\/update-idea-state/,
					{ body: ideaStateFixture }
				);
				const { response } = await registry
					.dispatch( MODULES_IDEA_HUB )
					.updateIdeaState( ideaStateFixture );

				expect( response ).toEqual( ideaStateFixture );
			} );

			it( 'dispatches an error if the request fails', async () => {
				const errorResponse = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};

				fetchMock.postOnce(
					/^\/google-site-kit\/v1\/modules\/idea-hub\/data\/update-idea-state/,
					{ body: errorResponse, status: 500 }
				);

				const { response, error } = await registry
					.dispatch( MODULES_IDEA_HUB )
					.updateIdeaState( ideaStateFixture );
				expect( console ).toHaveErrored();
				expect( error ).toEqual( errorResponse );
				expect( response ).toEqual( undefined );
			} );
		} );

		describe( 'saveIdea', () => {
			it( "updates a given idea's `saved` state to true", async () => {
				const updatedIdeaState = {
					...ideaStateFixture,
					saved: true,
				};

				fetchMock.postOnce(
					/^\/google-site-kit\/v1\/modules\/idea-hub\/data\/update-idea-state/,
					{ body: updatedIdeaState, status: 200 }
				);

				const { response } = await registry
					.dispatch( MODULES_IDEA_HUB )
					.saveIdea( ideaStateFixture.name );

				expect( response.saved ).toEqual( true );
			} );
		} );

		describe( 'unsaveIdea', () => {
			it( "updates a given idea's `saved` state to false", async () => {
				const updatedIdeaState = {
					...ideaStateFixture,
					saved: false,
				};

				fetchMock.postOnce(
					/^\/google-site-kit\/v1\/modules\/idea-hub\/data\/update-idea-state/,
					{ body: updatedIdeaState, status: 200 }
				);

				const { response } = await registry
					.dispatch( MODULES_IDEA_HUB )
					.unsaveIdea( ideaStateFixture.name );

				expect( response.saved ).toEqual( false );
			} );
		} );

		describe( 'dismissIdea', () => {
			it( "updates a given idea's `dismissed` state to true", async () => {
				const updatedIdeaState = {
					...ideaStateFixture,
					dismissed: true,
				};

				fetchMock.postOnce(
					/^\/google-site-kit\/v1\/modules\/idea-hub\/data\/update-idea-state/,
					{ body: updatedIdeaState }
				);

				const { response } = await registry
					.dispatch( MODULES_IDEA_HUB )
					.dismissIdea( ideaStateFixture.name );

				expect( response.dismissed ).toEqual( true );
			} );
		} );

		describe( 'Activities', () => {
			it( 'sets and removes different values for different activity keys', () => {
				expect( store.getState().activities ).toEqual( {} );

				registry
					.dispatch( MODULES_IDEA_HUB )
					.setActivity( 'foo', 'bar' );

				expect( store.getState().activities ).toEqual( { foo: 'bar' } );

				registry
					.dispatch( MODULES_IDEA_HUB )
					.setActivity( 'bar', 'baz' );

				expect( store.getState().activities ).toEqual( {
					foo: 'bar',
					bar: 'baz',
				} );

				registry.dispatch( MODULES_IDEA_HUB ).removeActivity( 'bar' );

				expect( store.getState().activities ).toEqual( { foo: 'bar' } );

				registry
					.dispatch( MODULES_IDEA_HUB )
					.setActivity( 'bar', 'baz' );

				expect( store.getState().activities ).toEqual( {
					foo: 'bar',
					bar: 'baz',
				} );

				registry.dispatch( MODULES_IDEA_HUB ).removeActivity( 'foo' );

				expect( store.getState().activities ).toEqual( { bar: 'baz' } );

				registry
					.dispatch( MODULES_IDEA_HUB )
					.setActivity( 'fizz', 'buzz' );

				expect( store.getState().activities ).toEqual( {
					bar: 'baz',
					fizz: 'buzz',
				} );

				registry.dispatch( MODULES_IDEA_HUB ).removeActivities( 'baz' );

				expect( store.getState().activities ).toEqual( {
					fizz: 'buzz',
				} );
			} );
		} );

		describe( 'moveIdeaFromNewIdeasToSavedIdeas', () => {
			it( 'moves idea from newIdeas to savedIdeas if it exists', () => {
				registry
					.dispatch( MODULES_IDEA_HUB )
					.receiveGetNewIdeas( fixtures.newIdeas, {
						timestamp: ideaHubData.lastIdeaPostUpdatedAt,
					} );
				registry
					.dispatch( MODULES_IDEA_HUB )
					.receiveGetSavedIdeas( [], {} );

				registry
					.dispatch( MODULES_IDEA_HUB )
					.moveIdeaFromNewIdeasToSavedIdeas(
						fixtures.newIdeas[ 0 ].name
					);

				expect( store.getState().newIdeas ).not.toEqual(
					expect.arrayContaining( [ fixtures.newIdeas[ 0 ] ] )
				);
				expect( store.getState().savedIdeas ).toEqual(
					expect.arrayContaining( [ fixtures.newIdeas[ 0 ] ] )
				);
			} );
		} );

		describe( 'moveIdeaFromSavedIdeasToNewIdeas', () => {
			it( 'moves idea from savedIdeas to newIdeas if it exists', () => {
				registry
					.dispatch( MODULES_IDEA_HUB )
					.receiveGetNewIdeas( [], {} );
				registry
					.dispatch( MODULES_IDEA_HUB )
					.receiveGetSavedIdeas( fixtures.savedIdeas, {
						timestamp: ideaHubData.lastIdeaPostUpdatedAt,
					} );

				expect( store.getState().newIdeas ).toEqual( [] );
				expect( store.getState().savedIdeas ).toEqual(
					fixtures.savedIdeas
				);

				registry
					.dispatch( MODULES_IDEA_HUB )
					.moveIdeaFromSavedIdeasToNewIdeas(
						fixtures.savedIdeas[ 0 ].name
					);

				expect( store.getState().savedIdeas ).not.toEqual(
					expect.arrayContaining( [ fixtures.savedIdeas[ 0 ] ] )
				);
				expect( store.getState().newIdeas ).toEqual(
					expect.arrayContaining( [ fixtures.savedIdeas[ 0 ] ] )
				);
			} );
		} );

		describe( 'removeIdeaFromNewIdeas', () => {
			it( 'removes idea from newIdeas if it exists', () => {
				registry
					.dispatch( MODULES_IDEA_HUB )
					.receiveGetNewIdeas( fixtures.newIdeas, {
						timestamp: ideaHubData.lastIdeaPostUpdatedAt,
					} );

				expect( store.getState().newIdeas ).toEqual(
					fixtures.newIdeas
				);

				registry
					.dispatch( MODULES_IDEA_HUB )
					.removeIdeaFromNewIdeas( fixtures.newIdeas[ 0 ].name );

				expect( store.getState().newIdeas ).not.toEqual(
					expect.arrayContaining( [ fixtures.newIdeas[ 0 ] ] )
				);
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'getIdeaByName', () => {
			it( 'finds and retreives an idea by the given name and list to search', () => {
				registry
					.dispatch( MODULES_IDEA_HUB )
					.receiveGetSavedIdeas( fixtures.savedIdeas, {
						timestamp: ideaHubData.lastIdeaPostUpdatedAt,
					} );

				const [ idea ] = fixtures.savedIdeas;

				expect(
					registry
						.select( MODULES_IDEA_HUB )
						.getIdeaByName( idea.name, 'savedIdeas' )
				).toEqual( idea );
			} );

			it( 'returns `null` for an idea that does not exist with the given name in the search list', () => {
				registry
					.dispatch( MODULES_IDEA_HUB )
					.receiveGetNewIdeas( [], {} );

				expect(
					registry
						.select( MODULES_IDEA_HUB )
						.getIdeaByName( 'ideas/name', 'newIdeas' )
				).toBeNull();
			} );
		} );
	} );
} );
