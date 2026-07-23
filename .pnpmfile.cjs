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
  if (pkg.dependencies && pkg.dependencies['@hono/node-server']) {
    pkg.dependencies['@hono/node-server'] = '^2.0.10';
  }
  if (pkg.dependencies && pkg.dependencies['fast-uri']) {
    pkg.dependencies['fast-uri'] = '^3.1.4';
  }
  if (pkg.dependencies && pkg.dependencies['body-parser']) {
    pkg.dependencies['body-parser'] = '^2.3.0';
  }
  if (pkg.dependencies && pkg.dependencies['brace-expansion']) {
    pkg.dependencies['brace-expansion'] = '^1.1.16';
  }
  if (pkg.dependencies && pkg.dependencies['js-yaml']) {
    pkg.dependencies['js-yaml'] = '^4.3.0';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
