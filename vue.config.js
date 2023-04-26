console.warn('process.env.VUE_APP_NODE_ENV ', process.env.VUE_APP_NODE_ENV)
const isProduct = process.env.VUE_APP_NODE_ENV == 'production' || process.env.VUE_APP_NODE_ENV == 'test'
console.log('isProduct', isProduct)
const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  productionSourceMap: isProduct ? false : true,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'LiminoWallet'
    },
    home: {
      template: 'public/home.html',
      entry: './src/popup/home.ts',
      title: 'LiminoWallet'
    },
  },
  pluginOptions: {
    i18n: {
      fallbackLocale: 'yes',
      localeDir: 'popup/language',
      includeLocales: true,
      runtimeOnly: true,
      enableInSFC: false,
      enableLegacy: false,
      compositionOnly: true,
      fullInstall: true
    },
    browserExtension: {
      components: {
        // background: true,
        contentScripts: true
      },
      componentOptions: {
        // background: {
        //   entry: 'src/scripts/background.js',
        //   output: 'dist/background.js'
        // },
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
    // config.externals = {
    //   'bitcore-lib':"bitcore-lib"
    // }
    config.devtool = isProduct ? 'nosources-source-map' : 'source-map'
    config.node = {
      global: false
    }
    config.plugins.push(new webpack.DefinePlugin({
      global: "window"
    }))
    config.plugins.push(new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/scripts/inject-script.js'),
        to: path.resolve(__dirname, 'dist/js/inject-script.js'),
        toType: "file",
      },
      // {
      //   from: path.resolve(__dirname, 'src/scripts/background.js'),
      //   to: path.resolve(__dirname, 'dist/background.js'),
      //   toType: "file",
      // },
      // {
      //   from: path.resolve(__dirname, 'src/scripts/modules'),
      //   to: path.resolve(__dirname, 'dist/modules'),
      // },
    ]))
    if (isProduct) {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = [
        "console.log"
      ];

    }
  },
  chainWebpack: config => {
    config.optimization.minimize(true);
    // if(isProduct){
    //   config.output.filename('assets/js/[name].[hash].js').chunkFilename('assets/js/[name].[hash].js').end()
    // }
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
