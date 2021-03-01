import ResponseParser, { APIErrorMessages } from '~/index';

const FALLBACK_ERROR_MESSAGE = 'Something went wrong, sorry about that';
const FALLBACK_ERROR = Object.freeze({
    [null]: FALLBACK_ERROR_MESSAGE,
});

describe('APIErrorMessages', () => {
    it('exists', () => {
        expect(APIErrorMessages).toBeTruthy();
    });

    it('assigns values when instantiated', () => {
        expect(new APIErrorMessages({ foo: 'bar' })).toEqual(expect.objectContaining({
            foo: 'bar',
        }));
    });

    it('supports toJSON', () => {
        expect(new APIErrorMessages({ foo: 'bar' }).toJSON()).toEqual({
            foo: 'bar',
        });
    });

    it('is immutable', () => {
        const errors = new APIErrorMessages({ foo: 'bar' });

        expect(() => {
            errors.foo = 'test';
        }).toThrow();
    });

    it('is iterable', () => {
        const errors = new APIErrorMessages({ foo: '1', bar: '2' });

        expect(Object.keys(errors)).toEqual(['foo', 'bar']);
    });
});

describe('ResponseParser', () => {
    let responseParser;

    it('exists', () => {
        expect(ResponseParser).toBeTruthy();
    });

    describe('when extended and instantiated', () => {
        let ExtendedResponseParser;

        beforeEach(() => {
            ExtendedResponseParser = class extends ResponseParser {
                getErrorsFor404() {
                    return {
                        [null]: 'Not found!',
                    };
                }
            };

            responseParser = new ExtendedResponseParser();
        });

        it('uses the possible new functions for errors', () => {
            expect(responseParser.getErrors({ status: 404, data: {} }).toJSON())
                .toEqual({
                    [null]: 'Not found!',
                });
        });
    });

    describe('when instantiated', () => {
        beforeEach(() => {
            responseParser = new ResponseParser();
        });

        describe('throwErrors', () => {
            describe('falsy', () => {
                it('does not throw', () => {
                    expect(() => {
                        responseParser.throwErrors(null);
                    })
                        .not.toThrow();
                });
            });

            describe('2XX', () => {
                [200, 201, 299].forEach(status => {
                    it(`does not throw for ${ status }`, () => {
                        expect(() => {
                            responseParser.throwErrors({ status, data: {} });
                        })
                            .not.toThrow();
                    });
                });
            });

            describe('4XX', () => {
                const GENERIC_ERROR_MESSAGE = 'Something is very wrong.';
                const GENERIC_ERROR = Object.freeze({
                    [null]: GENERIC_ERROR_MESSAGE,
                });

                [400, 422, 499].forEach(status => {
                    describe('when passed a message only', () => {
                        it(`throws the message as a generic error for ${ status }`, () => {
                            expect(() => {
                                responseParser.throwErrors({
                                    status,
                                    data: {
                                        message: GENERIC_ERROR_MESSAGE,
                                    },
                                })
                            }).toThrow(APIErrorMessages);
                        });
                    });
                });
            });
        });

        describe('getErrors', () => {
            it('returns a generic error for an unknown status', () => {
                expect(responseParser.getErrors({ status: null, data: {} }).toJSON())
                    .toEqual(FALLBACK_ERROR);
            });

            describe('2XX', () => {
                [200, 201, 299].forEach(status => {
                    it(`returns an empty object for ${ status }`, () => {
                        expect(responseParser.getErrors({ status, data: {} }).toJSON())
                            .toEqual({});
                    });
                });
            });

            describe('falsy', () => {
                it('returns null', () => {
                    expect(responseParser.getErrors(null))
                        .toEqual(null);
                });
            });

            describe('4XX', () => {
                const GENERIC_ERROR_MESSAGE = 'Something is very wrong.';
                const GENERIC_ERROR = Object.freeze({
                    [null]: GENERIC_ERROR_MESSAGE,
                });

                [400, 422, 499].forEach(status => {
                    describe('when passed a message only', () => {
                        it(`returns a the message as a generic error for ${ status }`, () => {
                            expect(responseParser.getErrors({
                                status,
                                data: {
                                    message: GENERIC_ERROR_MESSAGE,
                                },
                            }).toJSON()).toEqual(GENERIC_ERROR);
                        });
                    });

                    describe('when passed no usable error messages', () => {
                        it(`returns a fallback error for ${ status }`, () => {
                            expect(responseParser.getErrors({ status, data: {} }).toJSON())
                                .toEqual(FALLBACK_ERROR);
                        });
                    });

                    describe('when passed an array of array of errors', () => {
                        it(`returns the errors as a generic error for ${ status }`, () => {
                            expect(responseParser.getErrors({
                                status,
                                data: {
                                    errors: [['Foo'], ['Bar']],
                                },
                            }).toJSON())
                                .toEqual({
                                    [null]: 'Foo, Bar',
                                });
                        });
                    });

                    describe('when passed errors for specific fields', () => {
                        it(`returns the errors for those fields for ${ status }`, () => {
                            expect(responseParser.getErrors({
                                status,
                                data: {
                                    errors: {
                                        foo: 'Required',
                                        bar: 'Must be an email',
                                    },
                                },
                            }).toJSON())
                                .toEqual({
                                    foo: 'Required',
                                    bar: 'Must be an email',
                                });
                        });
                    });

                    describe('when passed arrays of errors for specific fields', () => {
                        it(`returns the errors for those fields for ${ status }`, () => {
                            expect(responseParser.getErrors({
                                status,
                                data: {
                                    errors: {
                                        foo: ['Required'],
                                        bar: ['Required', 'Must be an email'],
                                    },
                                },
                            }).toJSON())
                                .toEqual({
                                    foo: 'Required',
                                    bar: 'Required, Must be an email',
                                });
                        });
                    });
                });
            });

            describe('5XX', () => {
                [500, 504, 599].forEach(status => {
                    it(`returns a generic error for ${ status }`, () => {
                        expect(responseParser.getErrors({ status, data: {} }).toJSON())
                            .toEqual(FALLBACK_ERROR);
                    });
                });
            });
        });
    });
});
