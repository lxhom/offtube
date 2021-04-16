<script>
  import Thumbnail from "./Home/Thumbnail.svelte";
  let getVideos = async () => {
    let res = await fetch("/api/videos");
    let text = await res.text();
    text = JSON.stringify(JSON.parse(text).sort(() => Math.floor(Math.random() * 2) - 1))
    let res2 = await fetch("/api/bulkVideos", {method: "POST", body: text})
    let text2 = await res2.text()
    return JSON.parse(text2);
  }
</script>
{#await getVideos()}
  Loading...
{:then results}
  <div style="width: 100%">
    {#each results as video}
      <Thumbnail id={video.id} video={video} />
    {/each}
  </div>
{/await}
