/* eslint-disable @typescript-eslint/ban-types */
import { Subset } from "./Subset";
import { expectTypeOf } from "expect-type";

describe("Subset", () => {
  type Nested = Obj & {
    obj: Obj;
    objOpt?: Obj | null | undefined;
  };

  type Item = {
    id: number;
    value: string;
    nested: Nested;
    nestedOpt?: Nested | null | undefined;
  };

  type Obj = {
    number: number;
    numberOpt?: number | null | undefined;
    string: string;
    stringOpt?: string | null | undefined;

    array: Item[];
    arrayOpt?: Item[] | null | undefined;

    nested: Nested;
    nestedOpt?: Nested | undefined | null;
  };

  test("Empty selection: returns an empty object when S is an empty object", () => {
    expectTypeOf<Subset<Obj, {}>>().toEqualTypeOf<{}>();
  });

  test("Scalar fields: preserves optionality and nullability with true selection", () => {
    expectTypeOf<
      Subset<
        Obj,
        {
          number: true;
          numberOpt: true;
        }
      >
    >().toEqualTypeOf<{
      number: number;
      numberOpt?: number | null;
    }>();
  });

  test("Nested object: selects the entire nested object with true", () => {
    expectTypeOf<
      Subset<
        Obj,
        {
          nested: true;
          nestedOpt: true;
        }
      >
    >().toEqualTypeOf<{
      nested: Nested;
      nestedOpt?: Nested | null;
    }>();
  });

  test("Partially selecting nested object fields", () => {
    expectTypeOf<
      Subset<
        Obj,
        {
          nested: {
            number: true;
          };
          nestedOpt: {
            number: true;
          };
        }
      >
    >().toEqualTypeOf<{
      nested: {
        number: number;
      };
      nestedOpt?: {
        number: number;
      } | null;
    }>();
  });

  test("Array fields: selects the entire array when true is specified", () => {
    expectTypeOf<
      Subset<
        Obj,
        {
          array: true;
          arrayOpt: true;
        }
      >
    >().toEqualTypeOf<{
      array: Item[];
      arrayOpt?: Item[] | null;
    }>();
  });

  test("Partially selecting fields in array elements", () => {
    expectTypeOf<
      Subset<
        Obj,
        {
          array: {
            id: true;
          };
          arrayOpt: {
            id: true;
          };
        }
      >
    >().toEqualTypeOf<{
      array: {
        id: number;
      }[];
      arrayOpt?:
        | {
            id: number;
          }[]
        | null;
    }>();
  });

  test("Error: specifying a non-existent field results in a TypeScript error", () => {
    // @ts-expect-error: 'notExist' is not a valid field in Obj
    type _X = Subset<Obj, { notExist: true }>;
  });

  test("Error: specifying an object for a scalar field results in a TypeScript error", () => {
    type _X = Subset<
      Obj,
      // @ts-expect-error: Cannot specify an object for a scalar field
      {
        number: {
          nested: true;
        };
      }
    >;
  });

  test("Error: optional scalar fields cannot have object selections", () => {
    type _X = Subset<
      Obj,
      // @ts-expect-error: Optional scalar fields do not support nested selection
      {
        numberOpt: {
          something: true;
        };
      }
    >;
  });

  test("Selecting a subset of fields from an optional nested object", () => {
    expectTypeOf<
      Subset<
        Obj,
        {
          nestedOpt: {
            obj: {
              string: true;
            };
          };
        }
      >
    >().toEqualTypeOf<{
      nestedOpt?: {
        obj: {
          string: string;
        };
      } | null;
    }>();
  });

  test("Selecting deeply nested fields: extracting fields like nested->obj->array->id", () => {
    expectTypeOf<
      Subset<
        Obj,
        {
          nested: {
            obj: {
              array: {
                id: true;
              };
            };
          };
        }
      >
    >().toEqualTypeOf<{
      nested: {
        obj: {
          array: {
            id: number;
          }[];
        };
      };
    }>();
  });
});
