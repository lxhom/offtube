<!--suppress JSUnresolvedVariable, HtmlUnknownTarget, ES6CheckImport -->
<script>
  import { parseVideoData } from "../../frontend/src/VideoInfo.svelte"
  // let dmyToDate = (d, m, y) => new Date(y, m-1, d-1, 38);
  export let id;
  export let video;
  let thumbnail, views, time, age, format, lazyElement;

  let updater = async () => {
    let res = await fetch(`/content/${id}.info.json`);
    let text = await res.text();
    video = JSON.parse(text);
    let data = parseVideoData(video);
    thumbnail = data.thumbnail;
    views = data.views;
    time = data.time;
    age = data.age;
    format = data.format;
  }
</script>



<style>
  #thumb-container {
      width: 100%;
      height: 100%;
      position: relative;
      text-align: center;
  }
  #timestamp {
      position: absolute;
      bottom: 12px;
      right: 8px;
      background: #0008;
      backdrop-filter: blur(2px);
      border-radius: 2px;
      padding: 2px 3px;
      color: #ddd;
      font-weight: bolder;
      font-size: 12px;
  }
  #thumbnail {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
  }
  #placeholder {
      width: 100%;
      position: relative;
  }
  #container {
      padding: 5px;
      margin-bottom: 5px;
      border-bottom: 2px solid black;
  }
  #video-info {
      font-size: 12px;
  }
  #title {
      font-size: 15px;
  }
</style>



<div id="container">
  {#await updater()}
    Loading...
  {:then _res}
    <div on:click={() => location.set(`?watch=${id}`)}>
      <div id="thumb-container">
        <div id="image-container">
          <img id="placeholder" src="/16x9_Transparent.png" alt="Placeholder">
          <img id="thumbnail" data-src={thumbnail} alt={video.title}>
        </div>
        <div id="timestamp">{format} • {time}</div>
      </div>
      <div>
        <div id="title">
          {video.title}
        </div>
        <div id="video-info">
          {video.uploader} • {views} views • Uploaded {age}
        </div>
      </div>
    </div>
  {/await}
</div>