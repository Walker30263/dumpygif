/* credit: @python9160 on GitHub for most of this */

onmessage = (e) => {
  let height = e.data[0];
  let width = e.data[1];
  let cData = e.data[2];

  let seed = seedGenerator(height, width, cData);
  postMessage(seed);
}

// returns a 2d array of positions (numbers from [1, 6]), can be randomly generated or generated with choreography in mind
function seedGenerator(height, width, cData) {
  //temporarily fill the seed array with 0s
  let seed = Array(height).fill(0).map(() => Array(width).fill(0));
  
  if (cData.choreography) {
    if (cData.type == "basic") {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          seed[i][j] = 1;
        }
      }
    } else if (cData.type == "wave") {
      setState(0, continuousLinearRipple(cData.direction, 0.1), seed);
    } else if (cData.type == "ripple") {
      setState(0, continuousRadialRipple([Math.round(height/2), Math.round(width/2)], 0.1), seed);
    }
  } else { 
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        seed[i][j] = (Math.floor((Math.random()*6)+1));
      }
    }
  }

  return seed;
}

// Note: you need to have the discretize and chosen ripple function imported

function setState(t = 0, rippleout, state) {
  let z, range;
  [z, range] = rippleout
  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state[0].length; j++) {
      state[i][j] = discretize(z(i, j, t), range)
    }
  }
}

function continuousRadialRipple(center, ripplespeed) {
  function z(x, y, t) {
    return Math.sin(Math.sqrt((x - center[0])**2 + (y - center[1])**2) - ripplespeed*t) // use ripplespeed*-t for phase shift
  }
  return [z, [-1.0, 1.0]] // return a function that takes x, y, and t as arguments and returns a value
}

function continuousLinearRipple(mode, ripplespeed) { // start is either "left-to-right", "right-to-left", "top-to-bottom", or "bottom-to-top
  function z(x, y, t) {
    if (mode == "vertical") {
      return Math.sin(x - ripplespeed*t);
    } else if (mode == "horizontal") {
      return Math.sin(y - ripplespeed*t);
    }
  }
  return [z, [-1.0, 1.0]]
}

function discretize(value, range) {
  // linearly map the value from the given domain to the codomain [1, 6]
  
  let [min, max] = range;
  let newmin = 1;
  let newmax = 6;
  return Math.round((value - min) / (max - min) * (newmax - newmin) + newmin);
}
