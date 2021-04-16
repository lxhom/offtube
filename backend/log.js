import { settings } from "./settings.js";

let levels = ["important", "normal", "expanded", "debug"];
levels[-1] = "disabled"

let log = (level, message) => {
  if (level <= settings.logLevel) {
    console.log(
      `[${(new Date).toISOString().substr(11,12)}]`,
      `[${levels[level]}]`,
      message
    )
  }
}

export { levels, log };