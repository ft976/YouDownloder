# 🎥 YouDownloader03

A professional, high-performance web application for downloading YouTube videos and playlists. Inspired by advanced download managers, this tool offers a seamless experience with real-time progress tracking, multiple format support, and cloud-based processing.

![Application Preview](https://picsum.photos/seed/youtube-downloader/1200/600)

## 🚀 Core Features

- **Single Video Downloader:** Paste any YouTube video URL to analyze and download in seconds.
- **Playlist Downloader:** Supports full YouTube playlists. Automatically fetches all items and allows for batch downloading.
- **High-Quality Output:** Support for 1080p, 720p, 480p, and 360p video resolutions.
- **Precision Audio Extraction:** Extract audio in MP3, M4A, FLAC, and WAV formats.
- **Real-Time Progress Tracking:** Watch your downloads prepare and progress in real-time with an interactive UI.
- **Download History:** A persistence-based history panel to keep track of your downloads and re-trigger them easily.
- **Cloud Proxy Processing:** Uses specialized cloud processors to bypass bot detection and ensure high-speed downloads.

## 🛠️ Tech Stack

### Frontend
- **React 19:** State-of-the-art UI library for a reactive experience.
- **Vite:** Next-generation frontend tooling for blazing-fast development and builds.
- **Tailwind CSS:** Modern utility-first CSS framework for a sleek, dark-themed UI.
- **Motion (Framer Motion):** Industry-standard animation library for fluid transitions and interactions.
- **Lucide React:** Beautiful, consistent icon set.

### Backend
- **Node.js & Express:** Robust server-side environment.
- **youtube-dl-exec:** Native wrapper for `yt-dlp` to fetch rich metadata without triggering bot protections.
- **Vite Integration:** Seamlessly integrated Vite middleware for development mode.

## 🧠 Core Concepts

### 1. Unified Analysis Engine
The application uses a hybrid approach for metadata. For single videos, it leverages YouTube's `oembed` for instant previews, while using a robust `yt-dlp` backend for comprehensive playlist parsing. This ensures the best balance between speed and data richness.

### 2. Async Preparation Workflow
Unlike traditional direct-stream downloaders that might stall your browser, this app uses an **Asynchronous Preparation Workflow**:
1. **Request:** The user selects a format and queues a download.
2. **Initialize:** The backend proxies the request to a high-speed preparation server.
3. **Poll:** The frontend periodically polls the preparation state.
4. **Finalize:** Once the cloud processor finishes transcoding, the user receives a direct download link.

### 3. Persistent User State
The application uses `localStorage` to manage a "History" of downloads. This state is synchronized with the browser, ensuring that users can return later and see what they've previously downloaded without requiring a complex database setup.

## 🚥 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone or Download** the project files.
2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the App

1. **Development Mode:**
   Starts the Express server with Vite middleware and HMR enabled.
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

## 📂 Project Structure

- `src/App.tsx`: The primary frontend component containing all UI and download logic.
- `server.ts`: The Express backend handling API requests and proxying downloads.
- `src/index.css`: Global styles using Tailwind CSS.
- `vite.config.ts`: Configuration for React and Tailwind plugins.

## 🛡️ Security & Performance

- **Referrer Isolation:** All external thumbnails are loaded with `referrerPolicy="no-referrer"` to ensure visibility across different hosting environments.
- **Input Sanitization:** Playlist and Video IDs are validated to prevent resource poisoning attacks.
- **Lazy Polling:** Progress polling logic efficiently stops when no active tasks are present to save system resources.

---

Built with ❤️ for a better media experience.
