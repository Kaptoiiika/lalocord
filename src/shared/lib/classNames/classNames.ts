export function classNames(
  ...args: (string | undefined | Record<string, unknown>)[]
): string | undefined {
  const fullClasses = args.map((cn) => {
    if (!cn) return;
    if (typeof cn === 'string') return cn;

    return Object.entries(cn)
      .filter(([, condition]) => Boolean(condition))
      .map(([name]) => name)
      .join(' ');
  });

  return fullClasses.join(' ').trim();
}
