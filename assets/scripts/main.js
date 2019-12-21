define([
    'lib/zepto',
    'shared/getBaseUrl',
    'shared/updateTragetOfExternalLink'
], function ($, getBaseUrl, updateTragetOfExternalLink) {
    require.config({
        baseUrl: getBaseUrl() + 'assets/scripts'
    });

    updateTragetOfExternalLink($('.container'));
});
