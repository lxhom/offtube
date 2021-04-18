// noinspection JSUnusedGlobalSymbols

// Default settings. You can edit these.

let settings = {
  pathToYTDL: "ytdl\\youtube-dlc.exe",
  videoDLOptions: "-i " +
      "--output \"../downloads/%(id)s.mp4\" " +
      "--no-mtime " +
      "--write-info-json " +
      "--write-annotations " +
      "--cookies ytdl/cookies.txt " +
      "--write-thumbnail " +
      "--write-auto-sub " +
      "--sub-lang en,de",
  infoDLOptions: "-i " +
      "--output \"../downloads/%(id)s.mp4\" " +
      "--no-mtime " +
      "--write-info-json " +
      "--cookies ytdl/cookies.txt " +
      "--write-thumbnail " +
      "--skip-download",
  pathToChrome: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  chromeDebugPort: 9222,
  port: 4444,
  logLevel: 1,
  maxDuration: 30 /* minutes */ * 60,
  wrapped: false,
  reload: false
};

// DO NOT EDIT THIS PART.

let options = {
  port: {param: ["-p", "--port"], fn: x => +x},
  logLevel: {param: ["-l", "--log"], fn: x => +x},
  testing: {param: ["--t"], fn: () => true},
  wrapped: {param: ["--w"], fn: () => true},
  reload: {param: ["--r"], fn: () => true}
};

let argArrays = [];
process.argv.forEach(arg => {
  if (arg.match(/^-/)) {
    argArrays.push([arg]);
  } else if (argArrays.length !== 0) {
    argArrays[argArrays.length - 1].push(arg);
  }
});

argArrays.forEach(argArray => {
  for (let option in options) {
    options[option].param.forEach(param => {
      if (argArray[0] === param) {
        settings[option] = options[option].fn(argArray.slice(1).join(" "));
      }
    });
  }
});

if (settings.logLevel === 3) {
  let settingStrings = [];
  Object.entries(settings).forEach(pair => settingStrings.push(`${pair[0]}: \`${pair[1]}\``));
  console.log(
      `[${(new Date).toISOString().substr(11, 12)}]`,
      `[debug] [pre-start]`,
      `ArgV: ${process.argv.join(" ")}`,
  );
  console.log(
      `[${(new Date).toISOString().substr(11, 12)}]`,
      `[debug] [pre-start]`,
      `Settings: ${settingStrings.join(", ")}`,
  );
}
export {settings};