function createReferenceRegex(prefixes: string[]): RegExp {
  const pattern = prefixes.join('|');
  return new RegExp(`^\\{\\{ref_(${pattern})_(.+)\\}\\}$`);
}

function createScopeRegex(scopeNames: string[]): RegExp {
  const pattern = scopeNames.join('|');
  return new RegExp(`^\\{\\{\\$_\\[(${pattern})\\]_(.+)\\}\\}$`);
}

function createInnerReferenceRegex(prefixes: string[]): RegExp {
  const pattern = prefixes.join('|');
  return new RegExp(`^ref_(${pattern})_([a-zA-Z_$][a-zA-Z0-9_$]*)$`);
}

function createInnerScopeRegex(scopeNames: string[]): RegExp {
  const pattern = scopeNames.join('|');
  return new RegExp(`^\\$_\\[(${pattern})\\]_([a-zA-Z_$][a-zA-Z0-9_$]*)$`);
}

export {
  createReferenceRegex,
  createScopeRegex,
  createInnerReferenceRegex,
  createInnerScopeRegex,
};
