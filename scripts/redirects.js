var fs = require('fs');
var glob = require('glob');
var join = require('path').join;

var multidep = require('../multidep');
var utils = require('../node_scripts/utils');

var MASTER = 'master';

var aframeVersions = multidep.versions.developer.map(function (version) {
  if (version.constructor === Array) { return version[1]; }
  return version;
});
aframeVersions.push(MASTER);

hexo.extend.generator.register('community-short-url-redirects', function () {
  return expandRedirectObjs([
    ['github/', hexo.config.github.imersysdocs.url],
    ['repo/', hexo.config.github.imersysdocs.url],

    ['twitter/', hexo.config.twitter.url],

    ['stack-overflow/', hexo.config.stack_overflow.aframe.url],
    ['stackoverflow/', hexo.config.stack_overflow.aframe.url],
    ['help/', hexo.config.stack_overflow.aframe.url],
    ['ask/', hexo.config.stack_overflow.aframe.url],
    ['questions/', hexo.config.stack_overflow.aframe.url]
  ]);
});

hexo.extend.generator.register('docs-redirects', function () {
  var redirectObjs = [
    getDocRootRedirectObjs(),
    getPreVersionedRedirectObjs(),
    getComponentSectionRedirectObjs()
  ];
  redirectObjs.push([
    ['docs/', 'docs/introducao/'],
    ['docs/ambia360/', 'docs/ambia360/'],
  ]);

  // Flatten arrays since `redirectObjs` is an array of arrays of arrays. We just want a flat
  // array of [<from>, <to>]s.
  return expandRedirectObjs([].concat.apply([], redirectObjs));
});

/**
 * To enable more convenient data structure.
 * [fromPath, toPath] to {path: fromPath, data: redirect(hexo, toPath)}
 */
function expandRedirectObjs (redirectObjs) {
  return redirectObjs.map(function expand(redirectObj) {
    return {path: redirectObj[0], data: utils.createRedirectResponse(hexo, redirectObj[1])};
  });
}

/**
 * Redirects from '/docs/<version>/' to '/docs/<version>/guias/'.
 */
function getDocRootRedirectObjs () {
  return aframeVersions.map(function getRedirectObj (version) {
    return ['docs/' + version + '/', 'docs/' + version + '/introducao/'];
  });
}

/**
 * Redirects from '/docs/<version>/plataforma/' to '/docs/<version>/core/component.html'.
 */
function getComponentSectionRedirectObjs () {
  return aframeVersions.map(function getRedirectObj (version) {
    return ['docs/' + version + '/plataforma/', 'docs/' + version + '/core/component.html'];
  });
}

/**
 * Get documentation paths from before docs were versioned (started versioning at 0.3.0).
 * In order to create redirects from old path structure to new path structure.
 *
 * For example:
 *   Redirect from docs/guide/getting-started.html -> docs/0.2.0/guide/getting-started.html
 *
 * And do that for every page in 0.2.0.
 */
function getPreVersionedRedirectObjs () {
  var paths = glob.sync('.multidep/aframe-0.2.0/node_modules/aframe/docs/**/*.md');
  return paths.map(function getRedirectObj (path) {
    // `path` looks like `.multidep/aframe-0.2.0/node_modules/aframe/docs/<folder>/<file>.md`.
    // Pull out the last three paths and s/md/html (=> docs/<folder>/<file>.html).
    path = path.split('/').slice(-3).join('/').replace('.md', '.html');
    // Then create the redirect.
    return [path, path.replace('docs/', 'docs/0.2.0/')];
  });
}
