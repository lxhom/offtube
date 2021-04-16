<script>
  // noinspection HttpUrlsUsage
  console.log("BRUHHHHHHHHHHHHH")
  let url = `http://${location.hostname}:${0xFA1B}/`
  setInterval(async ()=>{
    try {
      let res = await fetch(url + "api/status")
      let text = await res.text();
      // noinspection EqualityComparisonWithCoercionJS
      if (text != "false") {
        location.href = url + "error" // FUCK YOU
      }
    } catch(e) {}
  }, 1000)
</script>