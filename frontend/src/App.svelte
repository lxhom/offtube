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
<Thumbnail id="1fC4eCqPq-A" />
<Thumbnail id="1fC4eCqPq-A" />
<Thumbnail id="1fC4eCqPq-A" />
<Thumbnail id="1fC4eCqPq-A" />
<Thumbnail id="1fC4eCqPq-A" />
<Thumbnail id="1fC4eCqPq-A" />
<Thumbnail id="1fC4eCqPq-A" />

<Lazy>
  <div>
    1
  </div>
  <div>
    2
  </div>
  <div>
    3
  </div>
  <div>
    4
  </div>
  <img data-src="/content/gATTVL6KiRI.webp" alt="test">
  <img data-src="/content/4KjdfcxEei0.webp" alt="test">
  <img data-src="/content/GCI7hBJiw1Y.webp" alt="test">
  <img data-src="/content/GDURQl8owKI.webp" alt="test">
  <img data-src="/content/GvMbLvY1XuE.webp" alt="test">
  <img data-src="/content/77ZF50ve6rs.webp" alt="test">
  <img data-src="/content/79kRAhU9oyc.webp" alt="test">
  <img data-src="/content/6lt_WrwdjdY.webp" alt="test">
  <img data-src="/content/6q6OsQq6aj8.webp" alt="test">
  <img data-src="/content/2O-9RmuiXog.webp" alt="test">
  <img data-src="/content/16aCaYOCjrw.webp" alt="test">
  <img data-src="/content/0z-MtpJdyps.webp" alt="test">
  <img data-src="/content/0A4YYsnkhP8.webp" alt="test">
  <img data-src="/content/dQw4w9WgXcQ.webp" alt="test">
  <img data-src="/content/dQw4w9WgXcQ.webp" alt="test">
  <img data-src="/content/dQw4w9WgXcQ.webp" alt="test">
  <img data-src="/content/dQw4w9WgXcQ.webp" alt="test">
</Lazy>
<Lazy>
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
  <Thumbnail id="1fC4eCqPq-A" />
</Lazy>
<Test data={{p1: 6, p2: 5}} />

-DEBUG-->
<Reloader/>
<svelte:component this={route} />
