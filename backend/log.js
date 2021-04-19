import { settings } from "./settings.js";

let levels = ["important", "normal", "expanded", "debug"];
levels[-1] = "disabled"

let log = (level, message) => {
  if (level <= settings.logLevel) {
    let date = new Date;
    console.log(
      `[${date.toLocaleTimeString()}.${date.getMilliseconds()}]`,
      `[${levels[level]}]`,
      message
    )
  }
}

export { levels, log };