require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Facebook video data ගන්න function
async function getFacebookVideo(url) {
  try {
    const options = {
      method: 'GET',
      url: 'https://facebook-video-downloader-api.p.rapidapi.com/get.php',
      params: { url: url },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'facebook-video-downloader-api.p.rapidapi.com'
      }
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch: ' + error.message);
  }
}

// API 1 - Video Download
app.get('/api/video', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required!' });
    }

    const data = await getFacebookVideo(url);
    const qualities = [];
    if (data.sd) qualities.push({ quality: 'SD (360p)', url: data.sd });
    if (data.hd) qualities.push({ quality: 'HD (720p)', url: data.hd });
    if (data.hd_1080) qualities.push({ quality: 'Full HD (1080p)', url: data.hd_1080 });

    res.json({
      success: true,
      title: data.title || 'Facebook Video',
      duration: data.duration || null,
      thumbnail: data.thumbnail || null,
      qualities: qualities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 2 - Audio Download
app.get('/api/audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required!' });
    }

    const data = await getFacebookVideo(url);
    if (!data.audio) {
      return res.status(404).json({ error: 'Audio not available for this video' });
    }

    res.json({
      success: true,
      title: data.title || 'Facebook Audio',
      audioUrl: data.audio,
      thumbnail: data.thumbnail || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health Check
app.get('/', (req, res) => {
  res.json({
    message: 'Facebook Downloader API is running! 🚀',
    endpoints: {
      video: '/api/video?url=FACEBOOK_URL',
      audio: '/api/audio?url=FACEBOOK_URL'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
