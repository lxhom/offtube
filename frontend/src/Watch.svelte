<!--suppress HtmlUnknownTarget, JSUnusedGlobalSymbols -->
<script>
  import {onDestroy} from "svelte";
  let uidGen = () => "######".replace(/#/g, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890_="[Math.floor(Math.random()*65)]) // 69 billion possibilities should be enough :lennyface:
  let watchUID = uidGen()
  let currentTime, paused, duration;
  let id = (new URLSearchParams(location.search)).get('watch')
  let src = '/stream/' + id
  let subtitleFetcher = async ()=>{
    let res = await fetch("/api/subtitles/" + id)
    return JSON.parse(await res.text())
  }
  let lastPosition = -1;
  let reWatchOnPlay = false;
  let checkReWatch = curTime => {
    if (curTime === undefined) return;
    if (reWatchOnPlay && curTime !== duration) {
      watchUID = uidGen()
      console.log("Rewatch detected")
      reWatchOnPlay = false
    }
    if (duration === curTime) {
      reWatchOnPlay = true;
    }
    lastPosition = curTime;
  }
  let reWatchInterval = setInterval(() => checkReWatch(currentTime), 500)
  let postInterval = setInterval(() => {
    if (!paused && currentTime) {
      fetch("/api/watching", {method: "POST", body: JSON.stringify({
          id: id,
          watches: [
            watchUID
          ],
          time: currentTime
        })})
    }
  }, 2500)
  onDestroy(() => {clearInterval(reWatchInterval); clearInterval(postInterval)})
</script>

<style>
  video {
      width: 100%;
  }
  .wrapper {
      position: fixed;
      bottom: 20px;
      right: 20px;
  }
  .wrapper > div > span {
      padding: 5px;
      border-left: 2px solid black;
      border-right: 2px solid black;
      border-top: 2px solid black;
      border-radius: 2px;
  }
</style>
<div class="wrapper">
  <video id="videoPlayer" controls autoplay bind:currentTime bind:paused bind:duration>
    <source {src} type="video/mp4">
    {#await subtitleFetcher() then subtitles}
      {#each subtitles as subtitle}
        <track kind="captions" src={"/content/" + subtitle} srclang={subtitle.split(".")[1]}>
      {/each}
    {/await}
  </video>
</div>
