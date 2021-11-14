(function (factory, root) {
    if (typeof define === 'function' && define.amd) {
        define(factory)
    } else {
        root.parseXML = factory()
    }
})(function () {
    return function parseXML(xml) {
        var source = typeof xml === 'string' ? xml : ('' + xml);
        var ch = '';
        var pos = -1;
        var max = source.length;
        var rootNode = new Node();
        var parentNode = rootNode;

        rootNode.nodeName = '#root';
        rootNode.nodeType = 'ROOT';

        function Node() {
            this.nodeName = '';
            this.nodeType = '';
            this.attributes = {};
            this.childNodes = [];
            this.textContent = '';
        }

        function at(pos) {
            return source.charAt(pos);
        }

        function is(c) {
            return c === ch;
        }

        function not(c) {
            return c !== ch;
        }

        function ws(c) {
            return c === ' ' || c === '\t' || c === '\r' || c === '\n';
        }

        function more() {
            return pos < max;
        }

        function trim() {
            while (more() && ws(ch)) {
                advance();
            }
        }

        function advance(n) {
            pos += (n || 1);
            ch = pos < max ? at(pos) : '';
            return ch;
        }

        function peek(n) {
            var s, p;

            if (!n || n === 1) {
                s = (pos + 1) < max ? at(pos + 1) : '';
            } else {
                s = '';
                p = pos + 1;
                while (n > 0 && p < max) {
                    s += at(p);
                    n -= 1;
                    p += 1;
                }
            }

            return s;
        }

        function text() {
            var t = '';
            var p3, p4, p5;
            while (not('<') && more()) {
                if (is('&')) {
                    p3 = peek(3).toLowerCase();
                    p4 = peek(4).toLowerCase();
                    p5 = peek(5).toLowerCase();

                    if (p3 === 'lt;') {
                        t += '<';
                        advance(4);
                    } else if (p3 === 'gt;') {
                        t += '>';
                        advance(4);
                    } else if (p4 === 'amp;') {
                        t += '&';
                        advance(5);
                    } else if (p5 === 'apos;') {
                        t += '\'';
                        advance(6);
                    } else if (p5 === 'quot;') {
                        t += '"';
                        advance(6);
                    } else {
                        t += '&';
                        advance();
                    }
                } else {
                    t += ch;
                    advance();
                }
            }
            return t.replace(/\s+$/, '');
        }

        function name() {
            var n = '';
            while (!ws(ch) && not('>') && more()) {
                n += ch;
                advance();
            }
            return n;
        }

        function endName() {
            var n = '';
            while (not('>') && more()) {
                n += ch;
                advance();
            }
            return n;
        }

        function string(q) {
            var s = '';

            advance();

            while (more()) {
                if (ch === q) {
                    advance();
                    break;
                } else if (ch === '\\') {
                    advance();
                    if (ch === 't') {
                        s += '\t';
                    } else if (ch === 'r') {
                        s += '\r';
                    } else if (ch === 'n') {
                        s += '\n';
                    } else {
                        s += ch;
                    }
                    advance();
                } else {
                    s += ch;
                    advance();
                }
            }

            return s;
        }

        function attr() {
            var attrs = {};
            var name;

            while (not('>') && more()) {
                trim();

                if (is('>')) {
                    break;
                } else {
                    name = '';
                    while (not('=') && not('>') && !ws(ch) && more()) {
                        name += ch;
                        advance();
                    }
                    if (name === '') {
                        throw new SyntaxError('attribute name can not be empty');
                    }
                    if (is('=')) {
                        advance();
                        if (ch !== '"' && ch !== '\'') {
                            throw new SyntaxError('unexpected: ' + ch + ' ' +
                                'should be \' or "');
                        }
                        attrs[name] = string(ch);
                    } else if (is('>') || ws(ch)) {
                        attrs[name] = true;
                    }
                }
            }

            return attrs;
        }

        function findNextNode() {
            var node, nodeName;

            trim();

            if (is('<')) {
                advance();
                if (is('/')) {
                    advance();
                    nodeName = endName();
                    if (nodeName === parentNode.nodeName) {
                        advance();
                        node = parentNode;
                        parentNode = node.parentNode;
                        delete node.parentNode;
                        findNextNode();
                    } else {
                        throw new SyntaxError('unexpected </' + nodeName +
                            '> should be </' + parentNode.nodeName + '>');
                    }
                } else {
                    node = new Node();
                    node.nodeName = name();
                    node.attributes = attr();
                    node.nodeType = 'NODE';
                    node.parentNode = parentNode;
                    parentNode.childNodes.push(node);

                    if (not('>')) {
                        throw new SyntaxError('unexpected: ' + ch);
                    } else {
                        advance();
                        parentNode = node;
                        findNextNode();
                    }
                }
            } else if (not('')) {
                node = new Node();
                node.nodeName = '#text';
                node.nodeType = 'TEXT';
                node.textContent = text();
                parentNode.childNodes.push(node);
                findNextNode();
            }
        }

        advance();
        findNextNode();

        return rootNode;
    }
}, this);
