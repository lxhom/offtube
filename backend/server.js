import express from "express";
import expressStatic from "express-static";
import { settings } from "./settings.js";
import { log } from "./log.js";
import url from "url";
import { getDownloadedVideos, getVideoData, getAvailableSubtitles, setWatchMetadata } from "./videos.js";
import fs from "fs";

log(1, "Starting OffTube...");

log(2, "Initializing Express app...");
const app = express();
log(2, "Express app initialized.");

log(2, "Registering request logging handler...");
app.use((req, _res, next) => {
  log(3, `Got request for ${req.url}.`);
  next();
});
log(2, "Request logging handler registered.");

log(2, "Registering POST handler...");
app.use((req, res, next) => {
  if (req.method === "POST") {
    req.body = "";
    req.on('data', data => req.body += data);
    req.on('end', () => next());
  } else {
    next();
  }
});
log(2, "POST handler registered.");

log(2, "Registering API handlers...");
app.get("/api/status", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.send('{"started":true}');
});

app.get("/api/videos", (req, res) => {
  log(3, `Got video request, serving...`);
  res.send(JSON.stringify(getDownloadedVideos()));
});

app.get("/api/video/:id", (req, res) => {
  let id = req.params.id;
  res.send(JSON.stringify(getVideoData(id)));
});

app.post("/api/bulkVideos", (req, res) => {
  let videoArray;
  videoArray = JSON.parse(req.body);
  let result = [];
  videoArray.forEach(id => {
    result.push(getVideoData(id));
  });
  res.send(JSON.stringify(result));
});

app.get("/api/subtitles/:id", (req, res) => {
  let id = req.params.id;
  res.send(JSON.stringify(getAvailableSubtitles(id)));
});

app.get("/api/crash", () => {
  process.kill(process.pid)
})

app.post("/api/watching", (req, res) => {
  let data = JSON.parse(req.body);
  setWatchMetadata(data);
  res.send('{"sent": "true"}');
})
log(2, "API handlers registered.");

log(2, "Registering home page handler...");
app.use((req, _res, next) => {
  let urlObject = new url.URL(req.protocol + "://" + req.hostname + req.url);
  if (urlObject.pathname === "/") {
    urlObject.pathname = "/index.html";
    log(3, `Detected path as /, changing the request URL internally from ${req.protocol + "://" + req.hostname + req.url} to ${urlObject.href}.`);
    req.url = urlObject.href;
  }
  next();
});
log(2, "Home page handler registered.");

log(2, "Registering Streaming service...");
app.get("/stream/:video_id", (req, res) => {
  // noinspection JSUnresolvedVariable
  let videoId = req.params.video_id;
  if (!req.headers.range) {
    res.status(400).send("Range header not found. Are you streaming the video?");
  }
  let videoPath = `../downloads/${videoId}.mp4`;
  let videoSize = fs.statSync(videoPath).size;

  let chunkSize = 10 ** 6; // 1MB
  let start = Number(req.headers.range.replace(/\D/g, ""));
  let end = Math.min(start + chunkSize, videoSize - 1);

  let contentLength = end - start + 1;
  let headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4"
  };

  res.writeHead(206, headers);

  fs.createReadStream(videoPath, {start, end}).pipe(res);
});
log(2, "Streaming service registered.");

log(2, "Creating & registering new Express Static instance for content...");
let downloadStatic = expressStatic("../downloads/", {});
log(2, "New Express Static instance for content created.");
app.use((req, res, next) => {
  let urlObject = new url.URL(req.protocol + "://" + req.hostname + req.url);
  if (urlObject.pathname.match(/^\/content\//)) {
    urlObject.pathname = urlObject.pathname.replace("/content", "");
    log(3, `Detected content request, changing the request URL internally from ${req.protocol + "://" + req.hostname + req.url} to ${urlObject.href}.`);
    req.url = urlObject.href;
    log(3, "Passing the request to the content Express Static instance.");
    // noinspection JSValidateTypes
    downloadStatic(req, res, next);
  } else {
    next();
  }
});
log(2, "New Express Static instance for content registered.");

log(2, "Registering Express Static...");
// noinspection JSCheckFunctionSignatures
app.use(expressStatic("../frontend/public/", {}));
log(2, "Express Static registered.");

app.listen(settings.port, () => log(1, `OffTube started on port ${settings.port}.`));

if (settings.reload) {
  log(1, "Live Reload enabled.")
  let path = process.argv[1];
  if (!path.endsWith(".js")) {
    path += ".js";
  }
  fs.watchFile(path, () => {
    log(1, "Reloading...")
    throw "$restart$";
  });
}