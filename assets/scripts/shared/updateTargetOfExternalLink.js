define([
    'lib/zepto',
    'lib/HyperlinkParser',
    'shared/getBaseUrl',
    'shared/isAbsoluteUrl',
    'shared/isMailToUrl'
], function ($, HyperlinkParser, getBaseUrl, isAbsoluteUrl, isMailToUrl) {
    /**
     * Set the `target` attribute of the external link to `_blank`
     *
     * @param {Zepto} $container The container node
     */
    return function updateTargetOfExternalLink($container) {
        $container.find('a').each(function () {
            var $this = $(this);
            var href = $this.attr('href');
            var baseLink, thisLink;

            if (isAbsoluteUrl(href) && !isMailToUrl(href)) {
                if (!$this.attr('target')) {
                    baseLink = HyperlinkParser.parse(getBaseUrl());
                    thisLink = HyperlinkParser.parse(href);

                    if (baseLink.origin !== thisLink.origin) {
                        $this.attr('target', '_blank');
                    }
                }
            }
        });
    }
});
