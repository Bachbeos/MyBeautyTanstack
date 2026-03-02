export type ID<
  TDomain extends string,
  TPrimitive extends string | number | bigint = string
> = TPrimitive & { readonly __brand: TDomain };

export function toId<TDomain extends string, TPrimitive extends string | number | bigint>(
  value: TPrimitive
): ID<TDomain, TPrimitive> {
  return value as ID<TDomain, TPrimitive>;
}
