/* eslint-disable @typescript-eslint/no-empty-object-type */
// prettier-ignore
type Alphanumeric =
  | "a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"|"i"|"j"|"k"|"l"|"m"
  | "n"|"o"|"p"|"q"|"r"|"s"|"t"|"u"|"v"|"w"|"x"|"y"|"z"
  | "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"
  | "N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z"
  | "0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9";
type RegexChar =
  | "^"
  | "$"
  | "+"
  | "*"
  | "?"
  | "."
  | "["
  | "]"
  | "{"
  | "}"
  | "("
  | ")";

type TakeParam<
  S extends string,
  Acc extends string = "",
> = S extends `${infer C}${infer Rest}`
  ? C extends Alphanumeric
    ? TakeParam<Rest, `${Acc}${C}`>
    : [Acc, `${C}${Rest}`]
  : [Acc, ""];

type IsDynamic<S extends string> = S extends `${string}:${string}`
  ? true
  : S extends `${infer C}${infer Rest}`
    ? C extends RegexChar
      ? true
      : IsDynamic<Rest>
    : false;

type NormalizePart<S extends string> =
  IsDynamic<S> extends true ? {} & string : S;

type Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
      ? A[K]
      : never;
};

type ExtractInlineParams<S extends string> = S extends `${string}:${infer Rest}`
  ? TakeParam<Rest> extends [
      infer Name extends string,
      infer After extends string,
    ]
    ? After extends `(${infer SubOptions})${infer Tail}`
      ? {
          [K in Name]?: ParseUnion<SubOptions>;
        } & ExtractInlineParams<SubOptions> &
          ExtractInlineParams<Tail>
      : { [K in Name]?: string } & ExtractInlineParams<After>
    : {}
  : {};

type ParseUnion<S extends string> = S extends `${infer A}|${infer B}`
  ? NormalizePart<A> | ParseUnion<B>
  : NormalizePart<S>;

type ParamEntry<
  Name extends string,
  Value,
  Optional extends boolean,
> = Optional extends true ? { [K in Name]?: Value } : { [K in Name]: Value };

type ExtractFrom<
  S extends string,
  Optional extends boolean,
> = S extends `${string}:${infer Rest}`
  ? TakeParam<Rest> extends [
      infer Name extends string,
      infer After extends string,
    ]
    ? After extends `(${infer UnionOptions})${infer Tail}`
      ? Merge<
          ParamEntry<Name, ParseUnion<UnionOptions>, Optional>,
          Merge<ExtractInlineParams<UnionOptions>, ExtractFrom<Tail, Optional>>
        >
      : Merge<ParamEntry<Name, string, Optional>, ExtractFrom<After, Optional>>
    : {}
  : {};

type ExtractOptional<S extends string> =
  S extends `${string}{${infer Inner}}${infer After}`
    ? ExtractFrom<Inner, true> & ExtractOptional<After>
    : {};

type RemoveBraces<S extends string> =
  S extends `${infer A}{${string}}${infer B}` ? `${A}${RemoveBraces<B>}` : S;

type ExtractRequired<S extends string> = ExtractFrom<RemoveBraces<S>, false>;

export type PatternParams<S extends string> = Merge<
  ExtractOptional<S>,
  ExtractRequired<S>
>;
