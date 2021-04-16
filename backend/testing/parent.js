import {spawnSync} from "child_process"

setTimeout(()=>process.env.test = "skunk", 5000)
spawnSync("node", ["--trace-uncaught", "child.js"], {stdio: [process.stdin, process.stdout]})