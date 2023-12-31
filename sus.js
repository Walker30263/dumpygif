import Pixel from '/pixel.js';

// -------------- Caching sprites at page load ------------

/*
  cache to hold the different "positions" of impostors so we don't
  have to request them from the server every time we color a new impostor
*/

var sprites = {};
var masks;

window.onload = async function() {
  // display welcome "alert" on pageload if they haven't seen it before 
  if (!localStorage.getItem("dontDisplayWelcomeAlert")) {
    const { value: checkboxes } = await Swal.fire({
      title: "Welcome to DumpyGif!",
      icon: "info",
      html: `
        You can use this website to generate a gif of impostors (like pixel art but with impostors) based on an uploaded image. (This website works best on a PC running Chrome. Not fully tested on Safari/iOS yet, but it might work.)
        <br><br>
        To view examples and learn what the different settings mean, check out our <a class="alertLink" href="https://github.com/Walker30263/dumpygif" target="_blank" rel="noopener noreferrer">GitHub Repository</a>! You can also find this at any time by clicking the icon on the bottom right of the page.
        <br><br>
        <input checked id="notificationToggle" type="checkbox" class="welcomeInput">
        <label for="notificationToggle" class="welcomeInputLabel">
          Allow Notifications (since sometimes it might take a while for gifs to generate)
        </label>
        <br><br>
        <input id="neverSeeThisAgain" type="checkbox" class="welcomeInput">
        <label for="neverSeeThisAgain" class="welcomeInputLabel">
          Never see this Welcome message again
        </label>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById("notificationToggle").checked,
          document.getElementById("neverSeeThisAgain").checked
        ]
      },
      iconColor: "#ffffff",
      background: "#c51111",
      color: "#ffffff"
    });
  
    if (checkboxes[0] === true) { // they want notifications 
      localStorage.setItem("notifications", true);
    }
  
    if (checkboxes[1] === true) { // they never want to see this alert again
      localStorage.setItem("dontDisplayWelcomeAlert", true);
    }
  }
  
  for (let i = 1; i <= 6; i++) {
    let impostor = await loadImageBitmap(`assets/gif-images/${i}.png`);
    sprites[i] = impostor;
  }

  //if they want notifs and their browser supports notifs and they haven't granted us permission yet to send notifs
  if ((localStorage.getItem("notifications") == "true") && (typeof Notification !== "undefined") && (Notification.permission !== "granted")) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        let notif = new Notification("Thank you for giving us permission to send notifications!", {
          body: "We promise not to spam you! We will only send notifs if you're on another tab/window when a gif is finished.",
          icon: "assets/logo.png"
        });

        console.log(notif);
      }
    });
  }

  masks = await loadMasks();

  btnGenerate.textContent = "Generate";
  btnGenerate.disabled = false;
}

async function loadMasks() {
  const response = await fetch("assets/masks.json");
  const data = response.json();
  return data;
}

async function loadImageBitmap(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    return imageBitmap;
  } catch(error) {
    console.error(error);
    return null;
  }
}

let status = document.getElementById("status");

class Dumpy {
  constructor(workers, quality) {
    this.gif = new GIF({
      workers: workers,
      quality: quality
    });
  }
  
  //units: pixels
  setOriginalDimensions(height, width) {
    this.originalHeight = height;
    this.originalWidth = width;
  }

  //units: number of impostors
  setDimensions(height, width) {
    this.height = height;
    this.width = width;
    this.impostorHeight = this.originalHeight*this.multiplier/height;
    this.impostorWidth = this.originalWidth*this.multiplier/width;
  }

  // increases the output image size by a factor of "factor" compared to the image that was uploaded
  setMultiplier(factor) {
    this.multiplier = factor;
  }

  setInterval(interval) {
    this.interval = interval;
  }

  setChoreographySettings(data) {
    this.choreographySettings = data;
  }

  setColorCollapseSettings(data) {
    this.colorCollapseSettings = data;
  }

  setPixels(data) {
    this.pixels = data;

    let totalUniqueColors = getTotalUniqueColors(this.pixels);
    
    let numberOfUniqueColors = totalUniqueColors.size;
    
    if (this.colorCollapseSettings.collapse) {
      let N = Math.round(numberOfUniqueColors * (1 - (this.colorCollapseSettings.compressionPercent / 100)));

      //prevent user from compressing image too much
      if (N < 70) {
        N = numberOfUniqueColors;
      }
      
      let topNColors = colorTokenizer(this.pixels, N);
      
      this.pixels = snapImageToNearestColor(this.pixels, topNColors); // bro whaasdlkdsfj

      topNColors = topNColors.map(color => JSON.stringify(color));

      return this.generateFrames(topNColors);
    } else {
      return this.generateFrames(Array.from(totalUniqueColors));
    }
  }

  async generateFrames(colors) {
    return new Promise(async (resolve) => {
      const seedWorker = new Worker("seedBaker.js"); 
      
      status.textContent = "Baking Animations...";
      seedWorker.postMessage([this.height, this.width, this.choreographySettings]);
      
      let dumpy = this;
      
      seedWorker.addEventListener("message", async function(e) {
        seedWorker.terminate();
        
        //for status purposes
        let totalNumberOfColors = colors.length*6;
        let impostorColorsMade = 0;

        let framesCreated = 0;

        let seed = e.data; //seed from the seed worker

        const frameMaker = new Worker("frameMaker.js");
        
        frameMaker.postMessage({
          sprites: sprites,
          masks: masks,
          colors: colors,
          frameGenerationData: {
            seed: seed,
            pixels: dumpy.pixels,
            originalWidth: dumpy.originalWidth,
            originalHeight: dumpy.originalHeight,
            multiplier: dumpy.multiplier,
            height: dumpy.height,
            width: dumpy.width,
            impostorWidth: dumpy.impostorWidth,
            impostorHeight: dumpy.impostorHeight
          }
        });
    
        frameMaker.onmessage = async (e) => {
          if (e.data.finished) {
            if (e.data.taskFinishedWith === "creatingImpostors") {
              status.textContent = `Finished coloring impostors!`;
            } else if (e.data.taskFinishedWith === "creatingFrames") {
              frameMaker.terminate();
            }
          } else {
            if (e.data.newImpostorsColored) {
              impostorColorsMade += 6;
              status.textContent = `Coloring impostors... ${impostorColorsMade}/${totalNumberOfColors}`;
            } else if (e.data.newFrame) {
              let frame = await convertImageBitmapToImage(e.data.newFrame);

              dumpy.gif.addFrame(frame, {
                delay: dumpy.interval
              });
              
              framesCreated++;
              status.textContent = `Creating frames...${framesCreated}/6`;

              if (framesCreated === 6) {
                resolve();
              }
            }
          }
        }
      });
    });
  }

  async generateGif() {
    return new Promise((resolve, reject) => {
      this.gif.on('finished', function(blob) {
        if (document.visibilityState !== "visible") {
          var notification = new Notification("Finished!", {
            body: "Your gif has been generated!",
            icon: "assets/logo.png"
          });

          notification.onclick = function() {
            window.parent.focus();
            notification.close();
          }

          let notifSound = new Audio("assets/notifSound.mp3");
          notifSound.play();
        }
        
        resolve(blob);
      });

      this.gif.render();
    });
  }
}

async function convertImageBitmapToImage(imageBitmap) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    context.drawImage(imageBitmap, 0, 0);

    image.onload = () => {
      resolve(image);
    };

    image.src = canvas.toDataURL();
  });
}

export default Dumpy;

// ---------------------------------------------- color collapse -----------------------------------------

//gets the unique colors in the pixels array (which is the expected input)
function getTotalUniqueColors(arr) {
  let newArr = arr.map((el) => {
    return JSON.stringify(el);
  });

  return new Set(newArr);
}

function colorTokenizer(image, N) {
  let dictionary = {};
  for (var i = 0; i < image.length; i++) {
    let color = JSON.stringify(image[i]);
    
    if (dictionary[color] == undefined) {
      dictionary[color] = 1;
    } else {
      dictionary[color] += 1;
    }
  }

  // get the top N colors
  var topN = [];

  for (var key in dictionary) {
    topN.push(key);
  }

  topN.sort(function(a, b) {
    return dictionary[b] - dictionary[a];
  });

  topN = topN.slice(0, N);

  topN = topN.map(x => new Pixel(x)) // JSON string -> Pixel

  return topN;
}

function snapImageToNearestColor(image, colors) {
  let newImage = [];

  for (let i = 0; i < image.length; i++) {
    newImage.push(snapToNearestColor(image[i], colors));
  }

  return newImage;
}

function snapToNearestColor(pixel, colors) {
  // check if the pixel is already in the list of colors
  if (colors.includes(pixel)) {
    return pixel;
  }

  let minDistance = 765; // start out at maximum distance (Pixel.distance between white and black)
  let closestColor = null;

  for (let i = 0; i < colors.length; i++) {
    let distance = Pixel.distance(pixel, colors[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colors[i];
    }
  }
  
  return closestColor;
}
