<!--suppress JSUnresolvedVariable -->
<script>
  let id = "";
  let src, title, uploader;
  let updater = async (id) => {
    let res = await fetch(`/content/${id}.info.json`);
    let text = await res.text()
    let video;
    try {
      video = JSON.parse(text)
    } catch (e) {
      title = "Failed"
      src = "data:"
      uploader = "Failed"
    }
    console.log(video)
    let fileEnding = video.thumbnail.substring(video.thumbnail.lastIndexOf("."))
    src = "/content/" + id + fileEnding;
    title = video.fulltitle;
    uploader = video.uploader;
  }
  $: updater(id);
</script>
<img {src} alt="thumbnail" width="360"><br>
Title: {title}<br>
Uploader: {uploader}<br>
<label for="selector">Video: </label><select id="selector" bind:value={id}>
  <option value="">Select something</option>
  <option value="dQw4w9WgXcQ">Rick Roll</option>
  <option value="aICoVi621_I">Daily Dose</option>
</select>
