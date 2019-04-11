[![npm version](https://badge.fury.io/js/%40netsells%2Flaravel-api-parser.svg)](https://badge.fury.io/js/%40netsells%2Flaravel-api-parser)
[![Build Status](https://travis-ci.com/netsells/laravel-api-parser.svg?branch=master)](https://travis-ci.com/netsells/laravel-api-parser)
[![codecov](https://codecov.io/gh/netsells/laravel-api-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/netsells/laravel-api-parser)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/netsells/laravel-api-parser/master)](https://stryker-mutator.github.io)

# Laravel API Parser

Parse responses from Laravel API REST endpoints and extract meaningful errors
related to your form fields

## Installation

```
yarn add @netsells/laravel-api-parser
```

## Usage

Note: it currently only works with `axios` response objects or any object with
the same duck type.

Import the `ResponseParser` class and instantiate it, passing in any custom
options you would like to use

```javascript
import ResponseParser from '@netsells/laravel-api-parser';

const responseParser = new ResponseParser();

const response = await axios.post('/foo/bar', data);

const errors = responseParser.getErrors(response);
```

The `getErrors` returns an object containing the errors for the fields passed
in. It may also return an object with a key of `null` representing a generic
error for the entire response, rather than a single field.

For a 422 error it may return:

```javascript
{
    email: 'You must enter a valid email'
}
```

For a 500 error it will return:

```javascript
{
    [null]: 'Something went wrong, sorry about that'
}
```

## Customisation

### Config

When instantiating the class, you can pass in an object with the following keys
to override certain behaviour

#### fallbackErrorMessage

The error message used as the last resort, when no other errors could be parsed.

```javascript
new ResponseParser({
    fallbackErrorMessage: 'Woops, something went wrong! Please try again later',
});
```

### Overrides

You can override the ResponseParser class to change the functionality of it.

When parsing errors, `getErrors` will look for a function based on the status of
the response, e.g. `getErrorsFor404` for a `404` status. If this doesn't exist,
it will fallback to a function for the range of the status, in this case
`getErrorsFor4XX`. Finally if that doesn't exist, it will return the fallback
error message.

So if you wanted to added custom errors for 404 responses, you could do this:

```javascript
import ResponseParser from '@netsells/laravel-api-parser';

class MyResponseParser extends ResponseParser {
    getErrorsFor404() {
        return {
            [null]: 'Not found!',
        };
    }
}

const responseParser = new MyResponseParser();

const response = await axios.get('/my-model/12'); // doesn't exist

const errors = responseParser.getErrors(response); // { [null]: 'Not found!' }
```

## Contributing

Pull requests are welcome! Ensure each PR includes a test case (which would fail
without your changes) and that your build passes.
