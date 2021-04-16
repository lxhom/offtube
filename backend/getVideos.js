import puppeteer from "puppeteer-core"
let pup = puppeteer;
import { settings } from "./settings.js"
import { exec } from "child_process"
let sleep = n => new Promise(resolve => setTimeout(resolve, n));

let controller = async (number) => {
  let extBrowser, extPage;
  try {
    let browser = await pup.connect({browserURL: `http://localhost:${settings.chromeDebugPort}`});
    // noinspection JSUnusedAssignment
    extBrowser = browser;
    let page = await browser.newPage();
    // noinspection JSUnusedAssignment
    extPage = page;
    await page.goto('http://youtube.com');
    for (let i = 0; i < Math.floor(number / 6.4); i++) {
      await sleep(1000)
      await page.evaluate(() => scrollTo(0, 9999999))
    }
    let videos = await page.evaluate(() => {
      document.querySelector("#contents").querySelector("ytd-rich-section-renderer").remove();
      let outputArray = [];
      document.querySelectorAll("ytd-rich-grid-media").forEach(video => {
        video = video.firstElementChild;
        if (video.querySelector("#details > #meta > ytd-badge-supported-renderer > .badge-style-type-live-now") != null) { return }
        /* let lengthEl = video.querySelector("ytd-thumbnail > #thumbnail > #overlays > .style-scope > span");
        if (lengthEl == null) { return }
        let timestampArr = lengthEl.innerText.split(":")
        if (timestampArr.length === 3 && timestampArr[0] > 1) { return } */
        let videoID = video.querySelector("ytd-thumbnail > #thumbnail").href.substr(32)
        if (videoID.length !== 11) { return }
        outputArray.push(videoID)
      })
      return outputArray;
    });
    return {videos, page, browser};
  } catch(e) {
    let arr = [];
    arr[-1] = e;
    // noinspection JSUnusedAssignment
    return {videos: arr, page: extPage, browser: extBrowser}
  }
}

let cont = async (number, closeAfter) => {
  let {videos, page, browser} = await controller(number)
  if (closeAfter) {
    await browser.close();
  } else {
    await page.close();
    await browser.disconnect();
  }
  return videos;
}

let getVideos = async number => {
  try {
    let browser = await pup.connect({browserURL: `http://localhost:${settings.chromeDebugPort}`});
    await browser.disconnect()
    return await cont(number, false);
  } catch (e) {
    exec(`"${settings.pathToChrome}" --new-window --remote-debugging-port=${settings.chromeDebugPort}`);
    let browser;
    let tries = 0;
    while (tries < 10 && !browser) {
      tries++;
      await sleep(5000);
      try {
        browser = await pup.connect({browserURL: `http://localhost:${settings.chromeDebugPort}`})
      } catch (e) {}
    }
    await browser.disconnect();
    return await cont(number, true);
  }
}

export { getVideos }

// TESTING

if (settings.testing) {
  (async ()=>{
    let videos = await getVideos(200)
    let str = "ytdl\\youtube-dlc.exe -i " +
        "--output \"../downloads/%(id)s.mp4\" " +
    "--no-mtime " +
    "--write-info-json " +
    "--write-annotations " +
    "--cookies ytdl/cookies.txt " +
    "--write-thumbnail " +
    "--write-auto-sub " +
    "--sub-lang en,de"
    videos.forEach(v => str += " youtu.be/"+v);
    console.log(str)
  })()
}