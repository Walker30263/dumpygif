class Dumpy {
  constructor() {
    
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
    this.impostorHeight = this.originalHeight/height;
    this.impostorWidth = this.originalWidth/width;
  }

  /*
    "impostors" is an object with keys being different colors,
    and each of those keys' keys being 6 different impostors 
    in different "positions" drawn in that color
  */
  setDictionary(impostors) {
    this.impostors = impostors;
  }

  setPixels(data) {
    this.pixels = data;
  }

  async generateFrames(choreographed) {
    return new Promise(async (resolve) => {
      this.images = []; // to store the frames to make the gif from
    
      let seed = seedGenerator(this.height*this.width, !choreographed);
  
      for (let i = 0; i < 6; i++) {
        document.getElementById("status").textContent = `Creating frames...${i+1}/6`;
        let image = await this.generateImage(seed);
        this.images.push(image);
        seed = incrementSeedPositions(seed);
      }

      resolve();
    });
  }

  async generateGif(interval) {
    return new Promise((resolve, reject) => {
      gifshot.createGIF({
        gifWidth: this.originalWidth,
        gifHeight: this.originalHeight,
        images: this.images,
        interval: interval/1000,
        numWorkers: 2,
        sampleInterval: 1
      }, (gif) => {
        if (gif.error) {
          reject(gif.error);
        } else {
          resolve(gif.image);
        }
      });
    });
  }

  // "seed" is an array of positions (numbers from 1-6 corresponding to /gif-images/[number].png) that's height*width long
  async generateImage(seed) {
    return new Promise(async (resolve) => {
      let c = document.createElement("canvas"); //make a temporary canvas to draw the image on
      let ctx = c.getContext("2d");

      c.width = this.originalWidth;
      c.height = this.originalHeight;
      
      for (let row = 0; row < this.height; row++) {
        for (let col = 0; col < this.width; col++) {
          let pixel = this.pixels[row * this.width + col];
          let position = seed[row * this.width + col];
          let impostorDataURL = this.impostors[JSON.stringify(pixel)][position];
          
          let impostor = new Image();
          impostor.src = impostorDataURL;

          await drawImageAsync(ctx, impostor, col * this.impostorWidth, row * this.impostorHeight, this.impostorWidth, this.impostorHeight);
        }
      }

      resolve(c.toDataURL("image/png"));
    });
  }
}

// returns a "length" long array of positions (numbers from [1, 6]), can be randomly generated or not 
function seedGenerator(length, random) {
  let seed = [];
  
  for (let i = 0; i < length; i++) {
    if (random) {
      seed.push(Math.floor((Math.random()*6)+1));
    } else {
      seed.push(1);
    }
  }

  return seed;
}

function incrementSeedPositions(seed) {
  seed.forEach((element, index) => {
    seed[index] = (element % 6) + 1;
  });

  return seed;
}

// helper function that wraps ctx.drawImage :3
async function drawImageAsync(ctx, img, x, y, width, height) {
  return new Promise((resolve, reject) => {
    img.onload = function() {
      ctx.drawImage(img, x, y, width, height);
      resolve();
    };
    
    img.onerror = function() {
      reject(new Error('Failed to load impostor'));
    };
  });
}

export default Dumpy;