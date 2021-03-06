const Scripts = require('../../../scripts');

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
});

describe.each(['prod', 'dev'])('externals [%s]', mode => {
  it('integration', async () => {
    await scripts[mode](async () => {
      await page.goto('http://localhost:3000');
      const result = await page.$eval('#externals', elm => elm.textContent);

      expect(result).toBe('Some external text.');
    });
  });

  // it('component tests', async () => {
  //   await scripts.test(mode);
  // });
});
