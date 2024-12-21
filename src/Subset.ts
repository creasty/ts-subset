/**
 * Subset type
 *
 * Extracts only the fields specified by S from the structure of T,
 * recursively applying field selection.
 */
export type Subset<T, S extends Selection<T>> = T extends null | undefined
  ? T // If T is nullish, return as-is
  : S extends true
    ? T // If S is true, return the entire T
    : T extends (infer U)[] // If T is an array
      ? S extends true
        ? T // If S is true, return the array as-is
        : S extends Selection<U>
          ? SubsetArray<T, U, S> // If S is an object, extract a subset
          : never
      : T extends object // If T is an object
        ? S extends true
          ? T // If S is true, return the entire object
          : S extends [infer U]
            ? U // If S is a tuple, embed the provided type as-is
            : S extends SelectionObject<T>
              ? SubsetObject<T, S> // If S is an object, extract a subset
              : never
        : T; // For scalar types, return T as-is if S is true

/**
 * Represents the selection type (partial extraction) for T
 */
type Selection<T> = T extends null | undefined
  ? true // Nullish values only allow true
  : T extends (infer U)[]
    ? true | Selection<U> // Arrays allow true or a selection of the element type
    : T extends object
      ? true | SelectionObject<T> | [object] // Objects allow true, a selection object, or an embedded type
      : true; // Scalars only allow true

/**
 * Selection type for an object T
 */
type SelectionObject<T extends object> = { [K in keyof T]?: Selection<T[K]> };

/**
 * Subset type for objects
 */
type SubsetObject<T extends object, S extends SelectionObject<T>> = Flatten<
  {
    [K in keyof S & keyof T as IsOptional<T, K> extends false ? K : never]: S[K] extends Selection<T[K]>
      ? Subset<T[K], S[K]>
      : never;
  } & {
    [K in keyof S & keyof T as IsOptional<T, K> extends true ? K : never]?: S[K] extends Selection<T[K]>
      ? Subset<T[K], S[K]>
      : never;
  }
>;

/**
 * Subset type for arrays
 *
 * Extracts elements of an array T (element type U) based on the selection S.
 *
 * Assumptions: Elements are not nullable (e.g., no U | null).
 * Therefore, T = U[] or U[] | null | undefined are the only cases considered.
 *
 * - S is a FieldSelection<U>, so Subset<U, S> is applied to each element U to create the resulting array.
 * - If T is nullish, the result will include `null | undefined` in addition to the refined array type.
 */
type SubsetArray<T, U, S extends Selection<U>> = T extends U[] | null | undefined
  ? Subset<U, S>[] | Extract<T, null | undefined>
  : never;

/**
 * Flattens an intersection type object
 *
 * Combines intersection types like { k1: T1 } & { k2?: T2 }
 * into a single type { k1: T1; k2?: T2 }.
 */
type Flatten<T> = { [K in keyof T]: T[K] };

/**
 * Determines if a field is optional
 *
 * Checks whether the field K of object T is optional.
 */
type IsOptional<T, K extends keyof T> = object extends { [P in K]: T[P] } ? true : false;
