const isProduct = process.env.NODE_ENV == 'production'
const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  productionSourceMap: false,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'LiminoWallet'
    },
    // standalone: {
    //   template: 'public/browser-extension.html',
    //   entry: './src/standalone/main.ts',
    //   title: 'Standalone',
    //   filename: 'index.html'
    // }
  },
  pluginOptions: {
    i18n: {
      locale: 'yes',
      fallbackLocale: 'yes',
      localeDir: 'popup/language',
      includeLocales: true,
      runtimeOnly: true,
      enableInSFC: false,
      enableLegacy: true,
      compositionOnly: true,
      fullInstall: true
    },
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/scripts/background.ts'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/scripts/content-script.ts'
            ]
          }
        }
      }
    }
  },
  configureWebpack: config => {
    if (isProduct) {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
    config.devtool = 'source-map'
    config.node = {
      global: false
    }
    config.plugins.push(new webpack.DefinePlugin({
      global: "window"
    }))
    config.plugins.push(new CopyWebpackPlugin([
      {
        from:path.resolve(__dirname,'src/scripts/inject-script.js') ,//想要复制的文件夹
        to:path.resolve(__dirname,'dist/js/inject-script.js'), //复制在哪个文件夹//复制在哪个文件夹
        toType: "file",
     }
    ]))
  },
  chainWebpack: config => {
    // config.resolve.alias.set("vue-i18n",'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js')
    config.module
    .rule("i18n")
    .test(/\.(json5?|ya?ml)$/)
    .include.add(path.resolve(__dirname, "src/popup/language"))
    .end()
    .type("javascript/auto")
    .use("i18n")
    .loader("@intlify/vue-i18n-loader")
    .end();


  }
  
}
