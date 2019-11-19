const pxToRem = require('postcss-pxtorem');

const rootPath = '/';

const isProduction = process.env.NODE_ENV === 'production';

const {
  npm_package_realmName: realmName,
  npm_package_name: name,
  npm_package_homepage: homepage,
  isOss,
} = process.env;

function generatePublicPath() { // 生成插件路径前缀
  switch (true) {
    case isOss === 'true':
      return `${realmName}/${name}`; // 打包后用于CDN/OSS
    case isProduction:
      return homepage || `/${name}`; // 打包后可直接部署
    default:
      return rootPath; // 打包后为根应用，适用于开发和主域应用
  }
}

module.exports = { // https://cli.vuejs.org/zh/config/#%E5%85%A8%E5%B1%80-cli-%E9%85%8D%E7%BD%AE
  // options...
  publicPath: generatePublicPath(),
  outputDir: `${name}` || 'checkout.dist',
  css: {
    loaderOptions: {
      css: {
        // 这里的选项会传递给 css-loader
      },
      postcss: {
        // 这里的选项会传递给 postcss-loader
        plugins: [pxToRem({
          rootValue: 75,
          propList: ['*'],
          // 注意：如果有使用第三方UI如VUX，则需要配置下忽略选择器不转换。
          // 规则是class中包含的字符串，如vux中所有的class前缀都是weui-。也可以是正则。
          // selectorBlackList: ['weui-'],
        })],
      },
      // 给 sass-loader 传递选项
      sass: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.scss` 这个文件
        data: '@import "@/assets/styleSheet/variables.scss";',
      },
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule('yml')
      .test(/\.ya?ml$/)
      .use('json')
      .loader('json-loader')
      .end()
      .use('yaml')
      .loader('yaml-loader')
      .end();

    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader')
      .end()
      .use('yaml')
      .loader('yaml-loader')
      .end();
  },
  devServer: {
    port: '8084',
    proxy: {
      '/api': {
        // target: 'http://192.168.3.1:5001', // 本地
        target: 'https://www.up.top', // 生产
        changeOrigin: true,
        pathRewrite: {
          '^/': '', // rewrite...,
        },
      },
    },
  },
  transpileDependencies: [/* 'proxy-polyfill' */],
};
