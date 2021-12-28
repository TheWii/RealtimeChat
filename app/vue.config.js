module.exports = {
    outputDir: 'build',
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