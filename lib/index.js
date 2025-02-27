var _ = require("lodash");

module.exports = function(nunjucks) {
    return function I18nExtension(options) {
        this.tags = ['trans'];

        options = _.defaults(options || {}, {
            translations: {},
            locale: "__locale__"
        });

        var translate = function(defaultText, textId, kwargs) {
            kwargs = kwargs || {};

            var locale = this.ctx[options.locale];
            var text = (options.translations[locale] || {})[textId]  || defaultText;

            // Replace arguments
            _.each(kwargs, function(value, arg) {
                text = text.replace(arg, value);
            });

            return text;
        }

        this.parse = function(parser, nodes, lexer) {
            var tok = parser.nextToken();
            var args = parser.parseSignature(null, true);
            parser.advanceAfterBlockEnd(tok.value);
            var body = parser.parseUntilBlocks('endtrans');
            parser.advanceAfterBlockEnd();
            return new nodes.CallExtension(this, 'run', args, [body]);
        };

        this.run = function(context, textId, kwargs) {
            kwargs = kwargs || {};
            body = _.last(arguments);

            var text = translate.call(context, body(), textId, kwargs);
            return new nunjucks.runtime.SafeString(text);
        };

        // Add filter
        options.env.addFilter("trans", translate);
    };
};
