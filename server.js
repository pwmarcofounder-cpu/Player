const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use('/', createProxyMiddleware({
    target: 'https://pw-player-1.ai.studio',
    changeOrigin: true,
    secure: false,
    onProxyRes: function (proxyRes, req, res) {
        // Kisi bhi domain se access allow karne ke liye
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
