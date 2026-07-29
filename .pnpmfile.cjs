module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'next' && pkg.version.startsWith('15.5.')) {
        pkg.dependencies = pkg.dependencies || {}
        pkg.dependencies.postcss = '8.5.18'
      }
      return pkg
    },
  },
}
