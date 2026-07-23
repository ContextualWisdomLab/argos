function readPackage(pkg, context) {
  if (pkg.dependencies && pkg.dependencies['next']) {
    pkg.dependencies['next'] = '^15.5.21';
  }
  if (pkg.dependencies && pkg.dependencies['sharp']) {
    pkg.dependencies['sharp'] = '^0.35.0';
  }
  if (pkg.dependencies && pkg.dependencies['postcss']) {
    pkg.dependencies['postcss'] = '^8.5.12';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
