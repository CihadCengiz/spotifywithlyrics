require('dotenv').config();
// const path = require('path');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const lyricsFinder = require('lyrics-finder');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const { createProxyMiddleware } = require('http-proxy-middleware');
// const buildPath = path.join(__dirname, 'build');


const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// app.use(express.static(buildPath));
app.use('/api', createProxyMiddleware({target: 'http://spotifywithlyrics.cihadcengiz.com', changeOrigin: true}));



app.post('/refresh', (req,res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken,
    })

    spotifyApi.refreshAccessToken().then(
        (data) => {
            res.json({
                accessToken: data.body.accessToken,
                expiresIn: data.body.expiresIn
            })
        }).catch(() => {
            res.sendStatus(400)
        })
})

app.post('/login', (req, res) => {
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    })

    spotifyApi.authorizationCodeGrant(code).then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
    })
    .catch((err) => {
        console.log(err)
        res.sendStatus(400)
    })
})

app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist, req.query.track) || "No Lyrics Found"
    res.json({lyrics})
})

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });