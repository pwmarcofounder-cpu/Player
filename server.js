const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use('/', createProxyMiddleware({
    target: 'https://player-nextstudy.ai.studio',
    changeOrigin: true,
    secure: false,
    selfHandleResponse: true,
    
    // Request target tak pahunchne se pehle modify karein
    onProxyReq: (proxyReq, req, res) => {
        // Gzip compression ko disable karne ke liye taaki text easily read ho sake
        proxyReq.removeHeader('accept-encoding');
        
        // Fake User-Agent set karein taaki target server isko bot na samjhe
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    },

    // Response user tak aane se pehle intercept karein
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        // CORS allow karein
        proxyRes.headers['access-control-allow-origin'] = '*';

        const contentType = proxyRes.headers['content-type'];
        
        // Sirf HTML/JSON/JS files ko hi modify karein
        if (contentType && (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('text/javascript'))) {
            try {
                let responseString = responseBuffer.toString('utf8');
                
                // Telegram links replace karein
                responseString = responseString.replace(/t\.me\/[a-zA-Z0-9_]+/ig, 't.me/official_marco_22');
                responseString = responseString.replace(/telegram\.me\/[a-zA-Z0-9_]+/ig, 'telegram.me/official_marco_22');
                
                return responseString;
            } catch (err) {
                console.error('Text replacement error:', err);
                return responseBuffer; // Error aane par original data bhej de
            }
        }
        
        // Agar image/video hai toh bina change kiye pass karein
        return responseBuffer;
    })
}));

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
