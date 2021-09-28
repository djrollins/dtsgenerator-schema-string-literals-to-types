# Schema to Type mapping generator for DTS generated types

This plugin will generate a type `SchemaName` that is a union of string
literals for all of the Schema names in defined in the API specification. It
will also provide means of mapping string literal names to the type definitions.

The intention is to use these types to wrap a `openapi-enforcer` validator in
type-safe manner.

This is incredibly experimental and the tests cannot yet be trusted, so do not
use this in production.

# Install

```
yarn add --dev dtsgenerator-schema-string-literals-to-types
```

# Usage

`dtsgen.json`
```json
{
    "plugins": {
         "dtsgenerator-schema-string-literals-to-types": true
    }
}
```

# Development

```
yarn build
yarn test
```

## Stacks

- TypeScript
- eslint
- prettier

## Files

- `index.ts`: plugin main file
- `test/snapshot_test.ts`: test main file. should not edit this file.
- `test/post_snapshots/`: post process test patterns. Please add folder if you need.

## yarn scripts

### main scripts

- `yarn build`: transpile this plugin. This command need before publishing this plugin.
- `yarn test`: test this plugin with coverage.
- `yarn clean`: remove all compiled files.

### sub scripts

- `yarn watch`: watch editing files for compile.
- `yarn lint:fix`: fix lint error automatically.
- `yarn test:update-snapshot`: update snapshot files for unit test.
- `yarn coverage`: report to [coveralls](https://coveralls.io/). Need coveralls configuration file.
