const _                          = require('lodash');
const HtmlWebpackPlugin          = require('html-webpack-plugin');
const path                       = require("path");
const { glob }                   = require('glob');

class WebpackForceReload {
  constructor(options = {}) {
    let that = this;
    this.options = options;
    this.resolvedFiles = [];
    glob.glob(
      this.options.files,
      {
        cwd: this.options.cwd
      },
      function(err, matches) {
        _.forEach(matches, function(value) {
          var resolvedFile = path.resolve(value);
          that.resolvedFiles.push(resolvedFile);
        });
      }
    );
  }
  apply (compiler) {
    compiler.hooks.compilation.tap('WebpackForceReload', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).afterEmit.tapAsync(
        'WebpackForceReload',
        (data, cb) => {
          let forceReload = false;
          if (compiler.modifiedFiles) {
            compiler.modifiedFiles.forEach((file) => {
              if (this.resolvedFiles.includes(file)) {
                forceReload = true;
              }
            });
          }
          let devServer = this.options.devServer();
          if (devServer && forceReload) {
            devServer.sendMessage(
              devServer.webSocketServer.clients,
              "static-changed"
            );
          }
          cb(null, data)
        }
      )
    })
  }
}

module.exports = WebpackForceReload;
