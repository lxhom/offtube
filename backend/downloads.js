import fs from "fs";

let getDownloadedVideos = () => {
  let files = fs.readdirSync("../downloads/");
  files = files.filter(filename => filename.match(/.info.json$/));
  let videos = [];
  files.forEach(file => videos.push(file.replace(/.info.json$/, "")));
  return videos;
}

let getVideoData = id => {
  id = id.replace(/[^0-9a-zA-Z_-]/g, "");
  let infoFile = fs.readFileSync(`../downloads/${id}.info.json`);
  let video = JSON.parse(String(infoFile));
  let downloadDirectory = fs.readdirSync("../downloads/");
  if (downloadDirectory.includes(`${id}.mp4`)) {
    video.downloaded = "true";
  } else if (downloadDirectory.includes(`${id}.mp4.part`)) {
    video.downloaded = "partial";
  } else {
    video.downloaded = "false"
  }
  "abr,acodec,age_limit,album,alt_title,artist,asr,automatic_captions,average_rating,channel_url,creator,display_id,end_time,episode_number,ext,extractor,extractor_key,format,format_note,formats,fulltitle,http_headers,is_live,license,player_url,playlist,playlist_index,protocol,release_date,release_year,season_number,series,start_time,thumbnails,track,url,webpage_url,webpage_url_basename,_filename,vcodec".split(",").forEach(prop => delete video[prop])
  return video;
}

let getAvailableSubtitles = id => {
  id = id.replace(/[^0-9a-zA-Z_-]/g, "");
  let files = fs.readdirSync("../downloads/");
  return files.filter(file => file.includes(id) && file.includes(".vtt"))
}

let isDownloaded = id => {
  let downloaded = getDownloadedVideos();
  return downloaded.includes(id);
}

let getDownloadAge = id => {
  id = id.replace(/[^0-9a-zA-Z_-]/g, "");
  let oneDay = 1000 * 60 * 60 * 24;
  let currentDate = new Date;
  let downloadDate = fs.statSync(`../downloads/${id}.mp4`).birthtime;
  return (currentDate - downloadDate) / oneDay
}

export { getDownloadedVideos, getVideoData, isDownloaded, getAvailableSubtitles, getDownloadAge }