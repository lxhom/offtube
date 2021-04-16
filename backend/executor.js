import { execSync } from "child_process"
import { log } from "./log.js";

let call = cmd => {
  log(2, `Executing \`${cmd}\`...`);
  let res = execSync(cmd);
  log(2, `\`${cmd}\` executed.`);
  return res;
}

export { call }