process.chdir("backend");


(async () => {
  let error = false;
  let {log} = await import("./backend/log.js");
  let fs = require("fs");
  let childProcess = require("child_process");
  log(2, "[wrapper] Starting OffTube Wrapper...");
  let cleanup = () => {
    try {
      fs.unlinkSync("./started");
    } catch (e) {}

  };
  let launch = async () => {
    try {
      error = await new Promise(resolve => {
        let error = "";
        log(2, "[wrapper] Launching OffTube Server...");
        let process = childProcess.spawn(
            "node",
            ["--trace-uncaught",
              "server.js",
              //...process.argv.splice(2),
              "--w"
            ]
        );
        process.stderr.on("data", data => {
          console.log("#e", data.toString());
          error += data.toString();
        });
        process.stdout.on("data", data => {
          console.log(data.toString().replace(/\n[\s]*$/, ""));
        });
        process.on("exit", () => {
          resolve(error);
        });
      });
      console.log("####e ", error);
      let match = error.match(/\$[a-z]+\$/);
      switch (match) {
        case "$restart$": {
          cleanup();
          error = "restarting";
          console.log("Restarting");
          await launch();
        }
          break;
      }
    } catch (e) {
      error = e;
    }
    cleanup();
  };

  // Fallback server

  // let errPage = String(fs.readFileSync("../frontend/fallback.html"));
  let http = require("http");
  let server = new http.Server();
  server.on("request", (req, res) => {
    switch (req.url) {
      case "/": {
        res.writeHead(200, {"Content-Type": "text/plain; charset=UTF-8"});
        res.write("wip");
        res.end();
      }
        break;
      case "/favicon.ico": {
        res.writeHead(200, {"Content-Type": "text/plain; charset=UTF-8"});
        res.write("no");
        res.end();
      }
        break;
      case "/api/status": {
        console.log(error);
        res.writeHead(200, {"Content-Type": "text/plain; charset=UTF-8", "Access-Control-Allow-Origin": "*"});
        res.write(String(error));
        res.end();
      }
        break;
      case "/restart": {
        res.writeHead(200, {"Content-Type": "text/plain; charset=UTF-8", "Access-Control-Allow-Origin": "*"});
        res.write("Restarting...");
        console.log("restart pls");
        res.end();
      }
        break;
      case "/error": {
        res.writeHead(200, {"Content-Type": "text/html; charset=UTF-8"});
        res.write(String(fs.readFileSync("../frontend/fallback.html")).replace("$ERR$", error));
        res.end();
      }
        break;
    }
  });
  server.listen(0xFA1B);

  cleanup();
  await launch();
})();
