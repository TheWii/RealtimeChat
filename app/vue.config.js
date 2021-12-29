
module.exports = {
    outputDir: 'build',
    publicPath: '/',
    devServer: {
        proxy: {
            '^/socket.io': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                ws: true
            },
            '^/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
}