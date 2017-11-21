const superagent = require('superagent');

const bypass = require('../index');


describe('integration test', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000000;
    it('should handle a request', () => {
        const agent = superagent.agent();
        const url = 'http://kissanime.ru/';

        function sendRequest(requestUrl, headers) {
            return agent.get(requestUrl)
                .set(Object.assign({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'keep-alive',
                }, headers));
        }

        return sendRequest(url)
            .then(fail)
            .catch((e) => {
                expect(e.status).toBe(503);
                const body = e.response.text;
                console.log(e.response.req._headers);
                console.log(e.response.headers);

                const answer = bypass.computeAnswer({
                    content: body,
                    siteUrl: url
                });
                return new Promise((res) => setTimeout(res, answer.waitFor + 1000))
                    .then(() => sendRequest(url + answer.action.url.substring(1), {
                        Referer: url,
                    }))
                    .catch(e => {
                        console.log(e.response.req._headers);
                        console.log(e.response.headers);
                        throw e;
                    })
                    .then((res) => {
                        expect(res.text).toMatch(/Watch anime online in high quality/);
                    });
            });
    });
});
