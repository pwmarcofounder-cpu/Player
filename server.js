const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use('/', createProxyMiddleware({
    target: 'https://pw-player.ai.studio',
    changeOrigin: true,
    secure: false,
    selfHandleResponse: true, // Response modify karne ke liye yeh true hona zaroori hai
    
    onProxyReq: (proxyReq, req, res) => {
        // Target server ko compress data bhejne se rokne ke liye, 
        // taaki link easily replace ho sake aur app crash na ho
        proxyReq.removeHeader('accept-encoding');
    },

    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        // Kisi bhi domain se access allow karne ke liye
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';

        const contentType = proxyRes.headers['content-type'];

        // Sirf text, html ya json files mein hi links replace karein
        if (contentType && (contentType.includes('text') || contentType.includes('application/json'))) {
            try {
                let responseString = responseBuffer.toString('utf8');
                
                // t.me/... aur telegram.me/... ko aapke handle se replace karega
                responseString = responseString.replace(/t\.me\/[a-zA-Z0-9_]+/ig, 't.me/official_marco_22');
                responseString = responseString.replace(/telegram\.me\/[a-zA-Z0-9_]+/ig, 'telegram.me/official_marco_22');
                
                return responseString;
            } catch (err) {
                console.error("Replace karne mein error:", err);
                return responseBuffer;
            }
        }
        
        // Agar image, video ya koi aur file hai toh bina change kiye aage bhej dein
        return responseBuffer;
    })
}));

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
