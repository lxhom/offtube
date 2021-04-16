<script>
    let yeet = () => {
      fetch("/api/crash")
    }
</script>

<button on:click={yeet}>YEET THE SERVER</button>