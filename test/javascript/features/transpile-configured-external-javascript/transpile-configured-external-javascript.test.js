const Scripts = require('../../../scripts');

const scripts = Scripts.setupProjectFromTemplate({
  templateDir: __dirname,
});

describe.each(['prod', 'dev'])(
  'transpiles javascript for configured projects [%s]',
  mode => {
    it('integration', async () => {
      await scripts[mode](async () => {
        await page.goto(`http://localhost:3000`);
        const result = await page.$eval(
          '#transpile-configured-external-javascript',
          elm => elm.textContent,
        );

        expect(result).toBe('External untranspiled dependency.');
      });
    });

    // it('component tests', async () => {
    //   await scripts.test(mode);
    // });
  },
);
