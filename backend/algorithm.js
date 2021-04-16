import { getDownloadAge } from "./downloads.js";

let scores = {
  unclickedWatching: -10,
  unclickedRewatch: -5,
  watched: -10,
  downloadAgeDay: -3,
  unclickedRecommendation: -2,
  randomness: +3,
  rewatch: +20,
  continueWatching: +25,
  watching: +50,
}

let functions = {
  unclickedWatching: id => {
    return 0;
  },
  unclickedRewatch: id => {
    return 0;
  },
  watched: id => {
    return 0;
  },
  downloadAgeDay: getDownloadAge,
  unclickedRecommendation: id => {
    return 0;
  },
  randomness: Math.random,
  rewatch: id => {
    return 0;
  },
  continueWatching: id => {
    return 0;
  },
  watching: id => {
    return 0;
  },
}

let calcRecommendation = id => {
  let score = 0;
  Object.keys(scores).forEach(key => {
    console.log(key, functions[key])
    score += functions[key](id) * scores[key];
  })
  return score;
}

calcRecommendation("dQw4w9WgXcQ")
