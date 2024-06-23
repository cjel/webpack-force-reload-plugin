const { glob }                   = require('glob')
const HtmlWebpackPlugin          = require('html-webpack-plugin');

class WebpackForceReload {
  constructor(options = {}) {
    let that = this;
    this.options = options;
    this.resolvedFiles = [];
    console.debug(this.options);
    glob.glob(
      this.options.files,
      {
        cwd: this.options.cwd
      },
      function(err, matches) {
        console.debug(matches);
        _.forEach(matches, function(value) {
          var resolvedFile = path.resolve(value);
          that.resolvedFiles.push(resolvedFile);
        }
      );
    });
    console.debug(this.resolvedFiles);
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
          if (this.globalDevServer && forceReload) {
            this.globalDevServer.sendMessage(
              this.globalDevServer.webSocketServer.clients,
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
