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
    [null]: 'Something has gone wrong, sorry'
}
```
