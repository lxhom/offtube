<script>
  // noinspection NpmUsedModulesInstalled
  import {onDestroy, onMount} from "Svelte";
  export let placeholder = "/16x9_Transparent.png";
  export let dataName = "src";
  export let speed = 100;
  export let preload = 1.5;
  let wrapper;
  let intervalID;

  console.log($$slots)

  let getAllChildren = parent => {
    let children = [parent];
    [...parent.children].forEach(child => {
      children.push(...getAllChildren(child));
    })
    return children;
  }

  let getLazyImages = parent => getAllChildren(parent).filter(e => e.tagName === "IMG" && e.dataset[dataName] !== undefined)



  onMount(() => {
    intervalID = setInterval(() => {
      let unloadedImages = getLazyImages(wrapper)
      unloadedImages.filter(e => e.src === "").forEach(e => e.src = placeholder)
      let unloadedImagesInViewport = unloadedImages.filter(e => e.getBoundingClientRect().y - visualViewport.height * +preload < 0)
      if (unloadedImagesInViewport.length > 0) {
        let element = unloadedImagesInViewport[0];
        console.log("Lazy loading", [element], element.getBoundingClientRect().y, visualViewport.height * 1.5, element.dataset[dataName])
        element.src = element.dataset[dataName];
        delete element.dataset[dataName];
      }
    }, +speed)
  })

  onDestroy(() => {
    clearInterval(intervalID);
  })
</script>

<div bind:this={wrapper}>
  <slot/>
</div>
