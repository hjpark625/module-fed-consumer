const path = require('path')
const { DefinePlugin } = require('webpack')
const { ModuleFederationPlugin } = require('webpack').container
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const deps = require('./package.json').dependencies

module.exports = (env, args) => {
  const isProduction = args.mode === 'production'
  return {
    mode: args.mode,
    cache: false,
    devtool: args.mode === 'development' ? 'source-map' : false,
    target: 'web',
    entry: path.resolve(__dirname, 'src/bootstrap.ts'),
    output: {
      publicPath: 'auto',
      filename: 'static/js/[name].[contenthash:8].js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.vue', '.jsx', '.js', '.json', '.ts', '.tsx'],
      alias: {
        vue: '@vue/runtime-dom',
        '@': path.resolve(__dirname, 'src')
      }
    },
    experiments: {
      topLevelAwait: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: ['@babel/preset-react', '@babel/preset-typescript']
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            reactivityTransform: true
          }
        },
        {
          test: /\.scss$/,
          use: [isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.css$/,
          use: [isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader', 'css-loader']
        }
      ]
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction
            },
            output: {
              comments: false
            }
          }
        })
      ],
      splitChunks: {
        chunks: 'all', // 모든 종류의 청크에 대해 코드 스플릿팅 적용
        minSize: 20000, // 최소 20KB가 넘는 모듈만 분리
        minChunks: 1, // 모듈이 최소 1개의 청크에서 사용될 때 분리
        maxAsyncRequests: 30, // 비동기 요청 청크 최대 수
        maxInitialRequests: 30, // 초기 로딩 청크 최대 수
        automaticNameDelimiter: '~', // 이름 구분자
        cacheGroups: {
          defaultVendors: {
            test: /[\\/\]node_modules[\\/]/,
            priority: -10
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true // 이미 분리된 청크 재사용 여부
          }
        }
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      new DefinePlugin({
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      }),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        filename: 'index.html'
      }),
      isProduction
        ? new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css'
          })
        : undefined,
      new ModuleFederationPlugin({
        name: 'consumer',
        remotes: {
          provider: 'provider@http://localhost:3000/remoteEntry.js'
        },
        shared: {
          ...deps,
          react: {
            singleton: true,
            requiredVersion: deps.react
          },
          'react-dom': {
            singleton: true,
            requiredVersion: deps['react-dom']
          }
        }
      })
    ],
    devServer: {
      port: 3001,
      historyApiFallback: true,
      compress: true,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      static: {
        directory: path.join(__dirname, 'dist')
      }
    }
  }
}
