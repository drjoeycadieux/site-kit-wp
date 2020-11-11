/**
 * Internal dependencies
 */
import extractForSparkline from '../extract-for-sparkline';

const valuesToTest = [
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		1,
		[
			[
				'1/1/2019',
				1,
			],
			[
				'1/2/2019',
				4,
			],
		],
	],
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		2,
		[
			[
				'1/1/2019',
				2,
			],
			[
				'1/2/2019',
				5,
			],
		],
	],
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		3,
		[
			[
				'1/1/2019',
				3,
			],
			[
				'1/2/2019',
				6,
			],
		],
	],
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		0,
		[
			[
				'1/1/2019',
				'1/1/2019',
			],
			[
				'1/2/2019',
				'1/2/2019',
			],
		],
	],
];

const columnIndexValuesToTest = [
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		0,
		[
			[ '1/1/2019', '1/1/2019' ], [ '1/2/2019', '1/2/2019' ],
		],
	],
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		1,
		[
			[ 1, '1/1/2019' ], [ 4, '1/2/2019' ],
		],
	],
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		2,
		[
			[ 2, '1/1/2019' ], [ 5, '1/2/2019' ],
		],
	],
	[
		[
			[
				'1/1/2019',
				1,
				2,
				3,
			],
			[
				'1/2/2019',
				4,
				5,
				6,
			],
		],
		3,
		[
			[ 3, '1/1/2019' ], [ 6, '1/2/2019' ],
		],
	],
];

describe( 'extractForSparkline', () => {
	it.each( valuesToTest )( 'for start date %s and end date %s should returns %s', ( data, column, expected ) => {
		expect( extractForSparkline( data, column ) ).toStrictEqual( expected );
	} );

	it.each( columnIndexValuesToTest )( 'for start date %s and columnIndex %s it should return %s', ( data, columnIndex, expected ) => {
		expect( extractForSparkline( data, 0, columnIndex ) ).toStrictEqual( expected );
	} );

	it( 'returns data from an index passed as a string', () => {
		const data = [
			{ key: 'foo', value: 123 },
			{ key: 'bar', value: 456 },
		];
		expect( extractForSparkline( data, 'value', 'key' ) ).toStrictEqual( [ [ 'foo', 123 ], [ 'bar', 456 ] ] );
	} );

	it( 'returns data from an index passed with dot separators', () => {
		const data = [
			{
				a: {
					b: { key: 'foo', value: 123 },
				},
			},
			{
				a: {
					b: { key: 'bar', value: 456 },
				},
			},
		];
		expect( extractForSparkline( data, 'a.b.value', 'a.b.key' ) ).toStrictEqual( [ [ 'foo', 123 ], [ 'bar', 456 ] ] );
	} );
} );
