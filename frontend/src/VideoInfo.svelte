<!--suppress JSUnresolvedVariable, JSUnusedGlobalSymbols -->
<script context="module">
  let secondsParser = seconds => new Date(seconds * 1000).toISOString().substr(11, 8).replace(/^00:/, "");
  let dateDifInDays = (a, b) => Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - (Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()))) /86400000);

  const parseVideoData = video => {
    let fileEnding = video.thumbnail.substring(video.thumbnail.lastIndexOf("."));
    let thumbnail = "/content/" + video.id + fileEnding;

    let views = "";
    String(video.view_count).split("").reverse().forEach((n, i) => {
      if (i % 3 === 0 && i !== 0) views = "," + views;
      views = n + views;
    });
    let time = secondsParser(video.duration);
    let dateArr = String(video.upload_date).split("");
    dateArr.splice(4, 0, "-");
    dateArr.splice(7, 0, "-");
    let videoAgeInDays = dateDifInDays(new Date(dateArr.join("")), new Date)
    let age;
    if (videoAgeInDays <= 0) {
      age = "Today"
    } else if (videoAgeInDays <= 7) {
      age = `${videoAgeInDays} day${videoAgeInDays === 1 ? "" : "s"} ago`
    } else if (Math.round(videoAgeInDays / 7) <= 4) {
      age = `${Math.round(videoAgeInDays / 7)} week${Math.round(videoAgeInDays / 7) === 1 ? "" : "s"} ago`
    } else if (Math.round(videoAgeInDays / (365.25 / 12)) <= 12) {
      age = `${Math.round(videoAgeInDays / (365.25 / 12))} month${Math.round(videoAgeInDays / (365.25 / 12)) === 1 ? "" : "s"} ago`
    } else {
      age = `${Math.round(videoAgeInDays / 365.25)} year${Math.round(videoAgeInDays / 365.25) === 1 ? "" : "s"} ago`
    }

    let format = video.height + "p" + (video.fps === 30 ? "" : video.fps);
    return {thumbnail, views, time, age, format};
  }
  export { parseVideoData }
</script>
