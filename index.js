const assert = require('assert');
const acorn = require('acorn');
const url = require('url');
const cheerio = require('cheerio');
const walk = require('acorn/dist/walk');
const PageContext = require('./src/PageContext');
const ScriptExecutor = require('./src/ScriptExecutor');

module.exports.computeAnswer = function ({
    content,
    siteUrl
}) {
    assert.equal(typeof content, 'string', 'Expected content to be a string');
    assert.equal(typeof siteUrl, 'string', 'Expected content to be a string');

    const $ = cheerio.load(content);
    const script = $('script').html();
    const parsedScript = acorn.parse(script);

    const setTimeoutNode = findSetTimeout(parsedScript);
    const timeout = setTimeoutNode.arguments[1].value;
    const pageContext = new PageContext();
    pageContext.setUrl(siteUrl);
    const scriptContext = pageContext.create();
    const executor = new ScriptExecutor(scriptContext);
    executor.execute(setTimeoutNode.arguments[0].body.body);
    const params = {
        jschl_vc: $('[name=jschl_vc]').attr('value'),
        pass: $('[name=pass]').attr('value'),
        jschl_answer: String(pageContext.inputObject.getProperty('value')),
    };
    const action = $('#challenge-form').attr('action')
    return {
        action: {
            url: url.format({
                pathname: action,
                query: params
            }),
            path: action,
            query: params,
        },
        waitFor: timeout,
    };
};

function findSetTimeout(script) {
    let node;
    walk.simple(script, {
        CallExpression(currentNode) {
            if (currentNode.callee.name === 'setTimeout') {
                node = currentNode;
            }
        }
    });
    assert(node);
    return node;
}
