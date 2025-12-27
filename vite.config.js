import { defineConfig } from 'vite';
import { resolve } from 'path';
import glsl from 'vite-plugin-glsl' // 👈 追加

export default defineConfig({

  // GitHub Pagesのリポジトリ名（決まっていれば書く。決まってなければ '/' でOK）
  base: '/my-effects-repo/',
  plugins: [glsl()],
  build: {
    rollupOptions: {
      input: {
        // トップページ
        main: resolve(__dirname, 'index.html'),
        // エフェクトページ（増えたらここに追記していくスタイル）
        effect1: resolve(__dirname, 'src/effect1/index.html'),
        effect2: resolve(__dirname, 'src/effect2/index.html'),
        effect3: resolve(__dirname, 'src/effect3/index.html'),
        effect4: resolve(__dirname, 'src/effect4/index.html'),
        effect5: resolve(__dirname, 'src/effect5/index.html'),
        effect6: resolve(__dirname, 'src/effect6/index.html'),
        effect7: resolve(__dirname, 'src/effect7/index.html'),
        effect8: resolve(__dirname, 'src/effect8/index.html'),
      },
    },
  },
});
