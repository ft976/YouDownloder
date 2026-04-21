import express from 'express';
import yt from 'youtube-dl-exec';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';

function formatDuration(sec?: number) {
  if (!sec) return '0:00';
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to fetch playlist or video details natively without bot detection
  app.get('/api/playlist', async (req, res) => {
    const playlistUrl = req.query.url as string;

    if (!playlistUrl) return res.status(400).json({ error: 'Missing Playlist URL' });

    try {
      const playlist = await yt(playlistUrl, { dumpSingleJson: true, flatPlaylist: true, noWarnings: true }) as any;
      
      res.json({
        title: playlist.title,
        author: playlist.uploader || playlist.channel || 'Unknown',
        thumbnail: playlist.thumbnails?.[playlist.thumbnails.length - 1]?.url || '',
        itemCount: playlist.entries?.length || 0,
        views: playlist.view_count || 0,
        items: (playlist.entries || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          author: item.uploader || item.channel || playlist.uploader,
          url: item.url,
          thumbnail: item.thumbnails?.[item.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
          duration: formatDuration(item.duration),
          durationSec: item.duration || 0
        }))
      });
    } catch (error: any) {
      console.error('Error fetching playlist info:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch playlist info.' });
    }
  });

  // Proxy to initiate download on loader.to
  app.get('/api/loader/download', async (req, res) => {
      try {
        const { url, format } = req.query;
        if (!url || !format) return res.status(400).json({ error: "Missing url or format" });
        
        const loaderRes = await fetch(`https://loader.to/ajax/download.php?start=1&end=1&format=${format}&url=${encodeURIComponent(url as string)}`);
        const loaderData = await loaderRes.json();
        res.json(loaderData);
      } catch (error: any) {
        console.error("Loader Download Error:", error.message);
        res.status(500).json({ error: "Failed to initiate download proxy" });
      }
  });

  // Proxy to check download progress on loader.to
  app.get('/api/loader/progress', async (req, res) => {
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "Missing id" });
        
        const pRes = await fetch(`https://loader.to/ajax/progress.php?id=${id}`);
        const pData = await pRes.json();
        res.json(pData);
      } catch (error: any) {
        console.error("Loader Progress Error:", error.message);
        res.status(500).json({ error: "Failed to fetch progress proxy" });
      }
  });

  // Batch ZIP endpoint
  app.post('/api/zip', async (req, res) => {
    const { files, playlistTitle } = req.body; // [{ url, filename }]
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for zipping' });
    }

    const safeTitle = (playlistTitle || 'playlist').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeTitle}.zip"`,
    });

    const archive = archiver('zip', {
      zlib: { level: 5 } // Optimal balance
    });

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      // We can't really send an error response here because headers are sent
      res.end();
    });

    archive.pipe(res);

    for (const file of files) {
      try {
        const response = await axios({
          method: 'get',
          url: file.url,
          responseType: 'stream'
        });
        archive.append(response.data, { name: file.filename });
      } catch (err) {
        console.error(`Failed to download file for zipping: ${file.url}`, err);
        // Continue with other files
      }
    }

    archive.finalize();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
