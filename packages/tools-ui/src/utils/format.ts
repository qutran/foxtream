import prettier from 'prettier/standalone';
import babylon from 'prettier/parser-babylon';

const JS_PREFIX = 'const $ = ';

export function format(input: Object) {
  try {
    return prettier
      .format(`${JS_PREFIX}${JSON.stringify(input)}`, {
        singleQuote: true,
        trailingComma: 'all',
        semi: false,
        parser: 'babel',
        plugins: [babylon],
      })
      .replace(JS_PREFIX, '');
  } catch (ex) {
    console.error(ex);
    return null;
  }
}
