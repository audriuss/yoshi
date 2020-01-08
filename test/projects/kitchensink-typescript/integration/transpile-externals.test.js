const { initTest } = require('../../../utils');

describe('external unprocessed modules', () => {
  it('transpiles javascript for configured projects', async () => {
    await initTest('transpile-configured-external-javascript');

    const result = await page.$eval(
      '#transpile-configured-external-javascript',
      elm => elm.textContent,
    );

    expect(result).toBe('External untranspiled dependency.');
  });
});
