// vite.config.js
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import { resolve } from 'path';
import postcss from 'postcss';
import type { PluginOption, ResolvedConfig } from 'vite';
import { defineConfig } from 'vite';
import engines from './src/config.js';

function libInjectCss(): PluginOption {
  const fileRegex = /\.(scss)$/;
  const injectCode = (code: string) =>
    `function styleInject(css,ref){if(ref===void 0){ref={}}var insertAt=ref.insertAt;if(!css||typeof document==="undefined"){return}var head=document.head||document.getElementsByTagName("head")[0];var style=document.createElement("style");style.type="text/css";if(insertAt==="top"){if(head.firstChild){head.insertBefore(style,head.firstChild)}else{head.appendChild(style)}}else{head.appendChild(style)}if(style.styleSheet){style.styleSheet.cssText=css}else{style.appendChild(document.createTextNode(css))}};styleInject(\`${code}\`)`;
  const template = `console.warn("__INJECT__")`;

  let viteConfig: ResolvedConfig;
  const css: string[] = [];
  return {
    name: 'lib-inject-css',

    apply: 'build',

    configResolved(resolvedConfig: ResolvedConfig) {
      viteConfig = resolvedConfig;
    },

    transform(code: string, id: string) {
      if (fileRegex.test(id)) {
        css.push(code);
        return {
          code: '',
        };
      }
      if (
        // @ts-ignore
        id.includes(viteConfig.build.lib.entry)
      ) {
        return {
          code: `${code}
          ${template}`,
        };
      }
      return null;
    },

    async writeBundle(_: any, bundle: any) {
      for (const file of Object.entries(bundle)) {
        const { root } = viteConfig;
        const outDir: string = viteConfig.build.outDir || 'dist';
        const fileName: string = file[0];
        const filePath: string = resolve(root, outDir, fileName);

        try {
          let data: string = await fs.promises.readFile(filePath, {
            encoding: 'utf8',
          });
          const result = await postcss([autoprefixer]).process(css);
          if (data.includes(template)) {
            data = data.replace(template, injectCode(result.css));
          }

          await fs.promises.writeFile(filePath, data);
        } catch (e) {
          console.error(e);
        }
      }
    },
  };
}

const prependUserScriptHeader = () => ({
  name: 'prepend-user-script-header',
  generateBundle(_, bundle) {
    const cwd = process.cwd();
    const match = engines
      .filter((e) => !e.disabled)
      .map((engine) => {
        const U = new URL(engine.url);
        const domain = U.hostname.split('.').slice(-2).join('.');

        return `@match        *://${domain}${U.pathname}*\n@match        *://*.${domain}${U.pathname}*`;
      });

    const deDup = (arr: string[]) => [...new Set(arr)];

    const matchStr = deDup(match).join('\n');

    const UserScriptHeader = fs
      .readFileSync(resolve(cwd, 'src/UserScriptHeader.txt'), 'utf8')
      .trim()
      .replace('{{match}}', matchStr)
      .split('\n')
      .map((line) => '// ' + line.trim())
      .join('\n');

    for (const chunk of Object.values(bundle) as any[]) {
      if (chunk.code) {
        chunk.code = `${UserScriptHeader}\n\n${chunk.code}`;
      }
    }
  },
});

export default defineConfig({
  plugins: [libInjectCss(), prependUserScriptHeader()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'metasearch',
      fileName: 'metasearch',
      formats: ['iife'],
    },
    minify: false,
  },
});
