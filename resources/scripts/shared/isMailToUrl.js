define(function () {
    /**
     * Check whether the url is start with `mailto:`
     *
     * @param {string} url The url string to check
     * @returns {boolean}
     */
    return function isMailToUrl(url) {
        return url.toLowerCase().indexOf('mailto:') === 0;
    }
});
