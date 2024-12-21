# ts-subset

[![npm version](https://badge.fury.io/js/ts-subset.svg)](https://www.npmjs.com/package/ts-subset) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript utility for creating type-safe subsets of objects. Inspired by GraphQL's Fragment, this library allows you to deeply extract specific fields from complex object types.

## Why `ts-subset`?

Working with deeply nested objects can be overwhelming. Whether you're dealing with APIs, large data structures, or complex schemas, selecting only the necessary fields while preserving TypeScript type safety can simplify your code and reduce runtime errors.

With `ts-subset`, you can:

- Select specific fields, even from deeply nested structures.
- Use reusable "fragments" to define and embed pre-defined selections in other types.
- Select the entire object with true when needed.
- Preserve optional and nullable fields in the resulting type.
- Safely narrow down types to what you actually need.

##⠀Installation

```sh
npm install ts-subset
```

## Usage

Here's how to use `Subset<T, S>` to extract specific fields from your types:

```typescript
import { Subset } from "ts-subset";

// Example object types
type Obj = {
  id: number;
  nested: Nested;
  nestedOpt?: Nested | null;
  items: Nested[];
};
type Nested = {
  id: number;
  details: {
    name: string;
    age?: number | null;
  };
};

// Define the subset selection
type ObjFragment = Subset<Obj, {
  id: true;
  nested: {
    details: {
      name: true;
    };
  };
  nestedOpt: {
    details: {
      name: true;
    };
  };
  items: {
    details: {
      name: true;
    };
  };
}>;
// The resulting type:
// {
//   id: number;
//   nested: { details: { name: string } };
//   nestedOpt?: { details: { name: string } } | null;
//   items: { details: { name: string } }[];
// }
```

--------------------------------------------------------------------------------

## Features

### Select Entire Objects

When `true` is specified for an object field, the entire object is selected:

```typescript
type Obj = {
  id: number;
  details: {
    name: string;
    age?: number | null;
  };
};

type ObjFragment = Subset<Obj, {
  details: true;
}>;
// Result:
// {
//   details: { name: string; age?: number | null };
// }
```

### Select Optional and Nullable Fields

The library preserves the optional (`?`) and nullable (`| null`, `| undefined`) properties of your types:

```typescript
type Obj = {
  id: number;
  optionalField?: string;
  nullableField: string | null;
};

type ObjFragment = Subset<Obj, {
  id: true;
  optionalField: true;
  nullableField: true;
}>;
// Result:
// {
//   id: number;
//   optionalField?: string;
//   nullableField: string | null;
// }
```

### Handle Arrays

Extract specific fields from arrays while keeping their structure:

```typescript
type Obj = {
  items: { id: number; value: string }[];
};

type ObjFragment = Subset<Obj, {
  items: { id: true };
}>;
// Result:
// {
//   items: { id: number }[];
// }
```

### Work with Deeply Nested Structures

Select fields from deeply nested objects:

```typescript
type Obj = {
  nested: {
    level1: {
      level2: {
        field: string;
        other: string;
      };
      other: string;
    };
  };
};

type ObjFragment = Subset<Obj, {
  nested: {
    level1: {
      level2: {
        field: true;
      };
    };
  };
}>;
// Result:
// {
//   nested: {
//     level1: {
//       level2: {
//         field: string;
//       };
//     };
//   };
// }
```

### Use Embedded Fragments (Reusable Selections)

You can define reusable "fragments" (pre-defined selections) and embed them into other types using a tuple notation `[Type]`.

```typescript
type Obj = {
  id: number;
  nested: Nested;
  nestedOpt?: Nested | null;
};
type Nested = {
  id: number;
  details: {
    name: string;
    age?: number | null;
  };
};

// Define a reusable fragment
type NestedFragment = Subset<Nested, {
  id: true;
}>;

// Use the fragment in another selection
type ObjFragment = Subset<Obj, {
  id: true;
  nested: [NestedFragment]; // Embed the fragment
  nestedOpt: [NestedFragment]; // Embed the fragment
}>;
// Result:
// {
//   id: number;
//   nested: { id: number };
//   nested?: { id: number } | null;
// }
```

> Note: The embedded type is not validated against the original field's type. See the limitations section for more details.

--------------------------------------------------------------------------------

### Limitations

While `ts-subset` is powerful, it has some limitations:

- **Embedding fragments requires manual validation**: When embedding pre-defined fragments using `[Type]`, the embedded type is not validated against the field's original type. For example:
    ```typescript
    type Obj = { field: { id: number } };

    type OtherFragment = { invalid: string }; // Doesn't match `Obj["field"]` type

    type Error = Subset<Obj, { field: [OtherFragment] }>; // No compile-time error
    // Result:
    // { field: { invalid: string } }
    ```
    This is a limitation of TypeScript's type system and cannot be enforced. Users must ensure the embedded fragment is compatible with the target field.
- **Cannot transform values**: This library is purely for type refinement. It does not provide runtime transformations.
- **No support for conditional or computed fields**: Types like `Record<string, any>` or mapped types (`{ [key: K]: T }`) are not supported for selection.
- **No runtime validation**: `ts-subset` operates entirely at the type level. It does not enforce selections or transformations at runtime.

### License

MIT
