<!--suppress HtmlUnknownTarget -->
<svelte:head>
  <script>
    location.set = url => {
      history.pushState({}, "", url);
      window.scrollTo(0,0)
      window.onpopstate(new PopStateEvent(""))
    }
  </script>
</svelte:head>

<script>
  import Home from "./Home.svelte"
  import Watch from "./Watch.svelte"
  import Loading from "./Loading.svelte"
  import Reloader from "./Reloader.svelte"
  // import Lazy from "./Lazy.svelte"
  // import Thumbnail from "./Home/Thumbnail.svelte";
  import Test from "./Test.svelte"

  let route = Loading;
  window.onpopstate = window.onload = () => {
    let getParams = () => {
      let params = [];
      location.search.substr(1).split("&").forEach(str => {
        params.push(str.split("="))
      });
      return params;
    }
    if (getParams()[0][0] === "") {
      route = Home
    } else {
      let aliases = {
        w: "watch",
        h: "home"
      }
      if (aliases[getParams()[0][0]]) {
        history.pushState({}, "", location.search.replace(getParams()[0][0], aliases[getParams()[0][0]]));
      }
      let componentMap = {
        watch: Watch,
        home: Home,
        test: Test
      }
      route = componentMap[getParams()[0][0]];
    }
  }
</script>
<!--DEBUG-
<div>
  <div on:click={() => location.set("?watch")}>Set search to ?watch</div>
  <div on:click={() => location.set("?home")}>Set search to ?home</div>
  <div on:click={() => location.set("?w")}>Set search to ?w</div>
  <div on:click={() => location.set("?h")}>Set search to ?h</div>
  <div on:click={() => location.set("?")}>Set search to ?</div>
  <div on:click={() => location.set("/")}>Set search to nothing</div>
  <div on:click={() => route = Watch}>Set route to Watch</div>
  <div on:click={() => route = Home}>Set route to Home</div>
</div>
-DEBUG-->
<Reloader/>
<svelte:component this={route} />
