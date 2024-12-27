const versionRegexes = [
  [/^version\s+=\s+['"]([\d.]+)['"]/m, (version) => `version = "${version}"`],
  [
    /GRAMMAR_VERSION\s*=\s*v([\d.]+)/,
    (version) => `GRAMMAR_VERSION=v${version}`,
  ],
  [/\bVERSION\s+['"]([\d.]+)['"]/, (version) => `VERSION "${version}"`],
  [
    /['"]version['"]\s*:\s*['"]([\d.]+)['"]/,
    (version) => `"version": "${version}"`,
  ],
];

module.exports.readVersion = function(contents) {
  for (const versionRegex of versionRegexes) {
    if (versionRegex.length > 0 && versionRegex[0] instanceof RegExp) {
      const matches = versionRegex[0].exec(contents);
      if (matches !== null) {
        return matches[1];
      }
    } else {
      throw new Error('Wrong regex table entry!');
    }
  }
  throw new Error('Failed to read the version field - is it present?');
};

module.exports.writeVersion = function(contents, version) {
  for (const versionRegex of versionRegexes) {
    if (
      versionRegex.length > 1 &&
      versionRegex[0] instanceof RegExp &&
      versionRegex[1] instanceof Function
    ) {
      const matches = versionRegex[0].exec(contents);
      if (matches !== null) {
        return contents.replace(versionRegex[0], versionRegex[1](version));
      }
    } else {
      throw new Error('Wrong regex table entry!');
    }
  }
  throw new Error('Failed to read the version field - is it present?');
};
