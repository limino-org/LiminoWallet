const isProduct = process.env.NODE_ENV == 'production'
const webpack = require('webpack')
module.exports = {
  productionSourceMap: !isProduct,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'LiminoWallet'
    },

    standalone: {
      template: 'public/browser-extension.html',
      entry: './src/standalone/main.ts',
      title: 'Standalone',
      filename: 'index.html'
    }
  },
  pluginOptions: {
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
  if(isProduct){
    config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
}
  // config.optimization.splitChunks = {
  //   chunks: 'all',
  //   minSize: 20000,
  //   maxAsyncRequests: 10,
  //   maxInitialRequests: 10,
  //   enforceSizeThreshold: 50000,
  //   cacheGroups: {
  //     libs: {
  //       name: 'chunk-libs',
  //       test: /[\\/]node_modules[\\/]/,
  //       priority: 10,
  //       chunks: 'initial'
  //     },
  //     commons: {
  //       name: 'chunk-commons',
  //       minChunks: 2,
  //       priority: 0,
  //       reuseExistingChunk: true
  //     },
  //     vant: {
  //       name: 'vant',
  //       priority: 20,
  //       test: /[\\/]node_modules[\\/]vant[\\/]/
  //     },
  //     ethers: {
  //       name: 'ethers',
  //       priority: 20,
  //       test: /[\\/]node_modules[\\/]ethers[\\/]/
  //     },
  //     moment: {
  //       name: 'moment',
  //       priority: 20,
  //       test: /[\\/]node_modules[\\/]moment[\\/]/
  //     },
  //     element_plus: {
  //       name: 'element_plus',
  //       priority: 20,
  //       test: /[\\/]node_modules[\\/]element-plus[\\/]/
  //     },
  //     web3: {
  //       name: 'web3',
  //       priority: 20,
  //       test: /[\\/]node_modules[\\/]web3[\\/]/
  //     },
  //     vuex_persistedstate:{
  //       name:"vuex-persistedstate",
  //       priority: 20,
  //       test: /[\\/]node_modules[\\/]vuex-persistedstate[\\/]/
  //     },
  //     ethereumjs:{
  //       name: "ethereumjs",
  //       priority: 20,
  //       test: /[\\/]node_modules[\\/]@ethereumjs[\\/]/
  //     }
      
  //   }
  // }
  // config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
  //   maxChunks: 15,
  // }),)

},

}
