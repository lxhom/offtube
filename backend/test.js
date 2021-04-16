console.log("lol", process.env.wrapped)
let num = Math.random()
console.log(num)

let child_process = require("child_process");
po = new Promise(async r => {
  await child_process.exec("nano");
  r()
})

let http = require("http");
let server = new http.Server();
console.log("####")
server.on("request", (req, res) => {
  res.writeHead(200, {"Content-Type": "text/plain; charset=UTF-8"});
  res.write("wip");
  res.end();
})

server.listen(8000)