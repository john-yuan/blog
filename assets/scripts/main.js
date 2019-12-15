$(function () {
    'use strict';

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
     * Remove the relative part of the path
     *
     * @param {string} path The path to normalize
     * @returns {string} Returns the normalized path
     */
    function normalizePath(path) {
        var arr1 = [];
        var arr2, name, i, l, first;

        // Make sure path is string
        path = (path === null || path === undefined) ? '' : ('' + path);

        arr2 = path.split('/');
        first = arr2[0];

        for (i = 0, l = arr2.length; i < l; i += 1) {
            name = arr2[i];

            if (name === '..') {
                arr1.pop();
            } else if (name !== '.') {
                arr1.push(name);
            }
        }

        if (first === '' && arr1[0] !== '') {
            arr1.unshift('');
        }

        return arr1.join('/');
    }

    /**
     * Check whether the url is absolute url
     *
     * @param {string} url The url string to check
     * @returns {boolean}
     */
    function isAbsoluteURL(url) {
        return /^(?:[a-z][a-z0-9\-\.\+]*:)?\/\//i.test(url);
    }

    /**
     * Check whether the url is start with `mailto:`
     *
     * @param {string} url The url string to check
     * @returns {boolean}
     */
    function isMailToURL(url) {
        return url.toLowerCase().indexOf('mailto:') === 0;
    }

    /**
     * Set the `target` attribute of the external link to `_blank`
     *
     * @param {Zepto} $container The container node
     */
    function updateTragetOfExternalLink($container) {
        $container.find('a').each(function () {
            var $this = $(this);
            var href = $this.attr('href');
            var baseLink, thisLink;

            if (isAbsoluteURL(href) && !isMailToURL(href)) {
                if (!$this.attr('target')) {
                    baseLink = HyperlinkParser.parse(BASE_URL);
                    thisLink = HyperlinkParser.parse(href);

                    if (baseLink.origin !== thisLink.origin) {
                        $this.attr('target', '_blank');
                    }
                }
            }
        });
    }

    updateTragetOfExternalLink($('.container'));
});
