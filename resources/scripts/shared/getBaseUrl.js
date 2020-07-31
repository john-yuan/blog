define([
    'lib/HyperlinkParser',
    'shared/normalizePath'
], function (HyperlinkParser, normalizePath) {
    var BASE_URL = initBaseURL();

    /**
     * Calculate the base URL
     *
     * @returns {string}
     */
    function initBaseURL() {
        var dirname, pathname;
        var relativeBaseURL = window.RELATIVE_BASE_URL || './';
        var link = HyperlinkParser.parse(location.href);
        var dirs = link.pathname.split('/');

        dirs.pop();
        dirname = dirs.join('/');

        if (dirname.charAt(0) !== '/') {
            dirname = '/' + dirname;
        }

        if (dirname.charAt(dirname.length - 1) === '/') {
            pathname = dirname + relativeBaseURL;
        } else {
            pathname = dirname + '/' + relativeBaseURL;
        }

        return link.origin + normalizePath(pathname);
    }

    /**
     * Get the absolute base url
     *
     * @return {string}
     */
    return function getBaseUrl() {
        return BASE_URL;
    }
});
