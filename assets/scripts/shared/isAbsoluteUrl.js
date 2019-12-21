define(function () {
    /**
     * Check whether the url is absolute url
     *
     * @param {string} url The url string to check
     * @returns {boolean}
     */
    return function isAbsoluteUrl(url) {
        return /^(?:[a-z][a-z0-9\-\.\+]*:)?\/\//i.test(url);
    }
});
