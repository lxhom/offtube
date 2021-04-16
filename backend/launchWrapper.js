process.chdir("backend");
import { log } from "./log.js"
import { server } from "./server.js"
try {
  log(2, "Declaring launch wrapper...");
  let start = async (r = false) => {
    try {
      server(r);
    } catch (e) {
      switch (e) {
        case "$restart":
          log(1, "Restarting OffTube...")
          await start(true);
          break;

        default:
          console.log("An error occurred.", e);
          break;
      }
    }
  }

  log(2, "Launch wrapper declared.");
  log(2, "Setting wrapping environment variable...");
  process.env.wrapped = "true";
  log(2, "Wrapping environment variable set.");
  {
    (async () => await start())()
  }
} catch (e) {
  console.log(e)
}