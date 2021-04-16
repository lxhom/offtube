import { settings } from "./settings.js";
import { call } from "./executor.js";
import { readFileSync } from "fs";

let downloadVideoInformation = videos => {
  let links = [];
  // noinspection SpellCheckingInspection
  videos.forEach(id => links.push(`"youtu.be/${id}"`));
  let command = `${settings.pathToYTDL} ${settings.infoDLOptions} ${links.join(" ")}`;
  console.log(command);
};

let downloadDecider = id => {
  // noinspection SpellCheckingInspection
  call(`${settings.pathToYTDL} ${settings.infoDLOptions} youtu.be/${id}`);
  let video = JSON.parse(String(readFileSync(`../downloads/${id}.info.json`)))
  return video.duration <= settings.maxDuration;
};

function callYTDL(args) {

}

function downloadVideo(videoID) {

}

function downloadPlaylist(playlistLink) {

}

export { downloadVideo, downloadPlaylist };