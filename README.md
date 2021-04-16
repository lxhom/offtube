# OffTube

## OffTube is basically YouTube, but offline.

Here's a quick overview what OffTube does:

OffTube itself is technically only a wrapper for the OffTube Backend which uses the OffTube frontend. The wrapper does this:

- Start the backend server asynchronously
- Start another HTTP Server on port `0xFA1B` (64027 in Base 10, short for **Fal**l**b**ack)
- Run a Status API & Page on the new HTTP Server
- Run a Restart API which can revive the backend if it crashes
- Run a Logging API which sends the logs of the backend

The backend does a lot more:

- Serve the frontend
- Serve videos as a Stream
- Run a Status API
- Run a Video Info API
- Run a Bulk Video API
- Run a Subtitle API
- Reload on Changes to the server source files
- Download Videos from YT with metadata
- Start a Chrome Browser or attach to a Chrome browser to download YT's Video Recommendations
- Automate the whole downloading process
- Recommend videos according to my own algorithm

And the frontend... does basically what the YT frontend does. It has a few extra features though:

- Manage downloads
- Manually start downloads
- Navigate to the Wrapper's HTTP Server when the backend crashes, which displays a Windows-10 style Bluescreen

I use the following languages/libraries/tools etc. in my project:

- The Wrapper is written in plain Node.JS, with 0 additional libraries to be as failsafe as possible.
- The Backend is written in Node.JS with Express. It uses a few tools/libs:
    - Express for the Server itself and API's
        - Express Static for static files
    - Puppeteer for Browser Control to download Recommendations
    - youtube-dl to download the YT videos
- The Frontend is written in Svelte with my own router
