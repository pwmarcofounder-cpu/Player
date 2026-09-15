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
    selfHandleResponse: true, // Yeh zaroori hai response modify karne ke liye
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const contentType = proxyRes.headers['content-type'];
        
        // Sirf HTML, JSON ya text files mein hi text replace karein, images/videos mein nahi
        if (contentType && (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('text/javascript'))) {
            let responseString = responseBuffer.toString('utf8');
            
            // t.me/kuch-bhi ko aapke official link se replace karega
            responseString = responseString.replace(/t\.me\/[a-zA-Z0-9_]+/ig, 't.me/official_marco_22');
            
            // Agar by chance URL me http/https hai toh usko bhi cover karne ke liye
            responseString = responseString.replace(/telegram\.me\/[a-zA-Z0-9_]+/ig, 'telegram.me/official_marco_22');

            // Modified content return karein
            return responseString;
        }
        
        // Agar response koi aur format (jaise image) hai, toh bina change kiye bhejein
        return responseBuffer;
    })
}));

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
