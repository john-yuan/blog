define([
    'lib/zepto',
    'shared/getBaseUrl',
    'shared/updateTargetOfExternalLink'
], function ($, getBaseUrl, updateTargetOfExternalLink) {
    require.config({
        baseUrl: getBaseUrl() + 'resources/scripts'
    });

    updateTargetOfExternalLink($('.container'));
});
