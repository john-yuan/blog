define(function () {
    /**
     * Remove the relative part of the path
     *
     * @param {string} path The path to normalize
     * @returns {string} Returns the normalized path
     */
    return function normalizePath(path) {
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
});
