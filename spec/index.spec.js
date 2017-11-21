const bypass = require('../index.js');
const fs = require('fs');
const path = require('path');

describe('Bypass', () => {
    const testCases = [{
        url: 'http://kissanime.ru/',
        content: fs.readFileSync(path.join(__dirname, 'fixtures/payload1.html'), 'utf-8'),
        expected: {
            action: {
                url: '/cdn-cgi/l/chk_jschl?jschl_vc=29bf5e64f8d20ea85c5f24d6e0e748e5&pass=1511234173.599-1XH471IYyF&jschl_answer=61314',
                path: '/cdn-cgi/l/chk_jschl',
                query: {
                    jschl_vc: '29bf5e64f8d20ea85c5f24d6e0e748e5',
                    pass: '1511234173.599-1XH471IYyF',
                    jschl_answer: '61314',
                },
            },
            waitFor: 4000,
        },
    }, {
        url: 'http://kissanime.ru/',
        content: fs.readFileSync(path.join(__dirname, 'fixtures/payload2.html'), 'utf-8'),
        expected: {
            action: {
                url: '/cdn-cgi/l/chk_jschl?jschl_vc=9c1424704bf3f8d8dd4a7c10691d31fa&pass=1511655962.653-wNGE144V9/&jschl_answer=592032',
                path: '/cdn-cgi/l/chk_jschl',
                query: {
                    jschl_vc: '9c1424704bf3f8d8dd4a7c10691d31fa',
                    pass: '1511655962.653-wNGE144V9/',
                    jschl_answer: '592032',
                },
            },
            waitFor: 4000,
        },
    }];

    testCases.forEach((testCase) => {
        it('should provide a result', () => {
            const result = bypass.computeAnswer({
                content: testCase.content,
                siteUrl: testCase.url,
            });

            expect(result).toEqual(testCase.expected);
        });
    });
});
