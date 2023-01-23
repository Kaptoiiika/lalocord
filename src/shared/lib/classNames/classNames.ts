export type classNamesMods = Record<string, boolean | string | undefined>

export function classNames(
  cls: string | (string | undefined)[] | undefined,
  mods: classNamesMods = {}
): string | undefined {
  const unionClasses = Array.isArray(cls)
    ? cls.filter((value) => Boolean(value)).join(" ")
    : cls

  const variableClasses = Object.entries(mods)
    .filter(([, value]) => Boolean(value))
    .map(([className]) => className)
    .join(" ")

  const fullClasses = [unionClasses, variableClasses].join(" ")

  return fullClasses.trim()
}
