<!--suppress HtmlUnknownTarget -->
<script>
  let paused;
  let id = (new URLSearchParams(location.search)).get('watch')
  let src = '/stream/' + id
  let subtitleFetcher = async ()=>{
    let res = await fetch("/api/subtitles/" + id)
    return JSON.parse(await res.text())
  }
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
  <video id="videoPlayer" controls autoplay bind:paused>
    <source {src} type="video/mp4">
    {#await subtitleFetcher() then subtitles}
      {#each subtitles as subtitle}
        <track kind="captions" src={"/content/" + subtitle} srclang={subtitle.split(".")[1]}>
      {/each}
    {/await}
  </video>
</div>
