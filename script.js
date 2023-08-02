/*
  I am incredibly sorry to anyone who is reading this spaghetti code,
  I tried to comment to the best of my ability </3 

  Feel free to suggest ways to make this more efficient 
*/

import Pixel from '/pixel.js';

import Dumpy from '/sus.js';
let gifmaker;

let numberOfImpostors = document.getElementById("numberOfImpostors");
let gifSpeed = document.getElementById("gifSpeed");
let enlargeOutput = document.getElementById("enlargeOutput");
let imageInput = document.getElementById("imageInput");
let btnGenerate = document.getElementById("btnGenerate");
let btnHelp = document.getElementById("btnHelp");
let status = document.getElementById("status");
let loader = document.getElementById("loader");
let outputImage = document.getElementById("outputImage");
let btnDownload = document.getElementById("btnDownload");

let choreographed = document.getElementById("choreographed");
let basicC = document.getElementById("basicC");
let rippleC = document.getElementById("rippleC");
let waveC = document.getElementById("waveC");

let colorCollapse = document.getElementById("colorCollapse");
let compressionPercent = document.getElementById("compressionPercent");
let compressionPercentDisplay = document.getElementById("compressionPercentDisplay");
let compressionPercentContainer = document.getElementById("compressionPercentContainer");

var startTime;
var endTime;

//when the generate button is clicked...
btnGenerate.addEventListener("click", async function(e) {
  e.preventDefault(); //prevent page from reloading

  gifmaker = new Dumpy();
  
  if (imageInput.files.length === 0) {
    alert("Please upload an image to sussify!");
    return;
  }

  startTime = new Date().getTime();

  btnGenerate.disabled = true;
  btnGenerate.textContent = "Generating...";
  
  status.style.display = "block";
  status.textContent = "Loading Image...";

  loader.style.display = "block";

  output.style.display = "none";

  let reader = new FileReader();
  
  reader.onload = async function(event) {
    let img = new Image();
    status.textContent = "Coloring impostors...";
    img.onload = async function() {
      gifmaker.setInterval(gifSpeed.value);
      gifmaker.setMultiplier(enlargeOutput.value / 100);
      gifmaker.setOriginalDimensions(img.height, img.width);
      gifmaker.setChoreographySettings(getChoreographyData());
      gifmaker.setColorCollapseSettings(getColorCollapseData());

      //this will determine the number of impostors we have in the output gif
      let resizedDimensions = resizeImage(img.height, img.width, numberOfImpostors.value);
      gifmaker.setDimensions(resizedDimensions.height, resizedDimensions.width);
      
      let tempCanvas = document.createElement("canvas");
      let tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = resizedDimensions.width;
      tempCanvas.height = resizedDimensions.height;
      tempCtx.drawImage(img, 0, 0, resizedDimensions.width, resizedDimensions.height);
      
      var imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      
      let pixels = [];
      
      for (let i = 0; i < imgData.data.length; i += 4) {
        let pixel = new Pixel(imgData.data[i], imgData.data[i+1], imgData.data[i+2], imgData.data[i+3]);
        pixels.push(pixel);
      }

      if (colorCollapse.checked) {
        for (let i = 0; i < pixels.length; i++) {
          for (let j = i + 1; j < pixels.length; j++) {
            if (Pixel.distance(pixels[i], pixels[j]) < 7) {
              pixels[j].replace(pixels[i]);
            }
          }
        } 
      }
      
      await gifmaker.setPixels(pixels);
      
      status.textContent = "Rendering gif...";
      let gifBlob = await gifmaker.generateGif();

      gifBlob = URL.createObjectURL(gifBlob);
      
      outputImage.width = img.width*(enlargeOutput.value / 100);
      outputImage.height = img.height*(enlargeOutput.value / 100);
      outputImage.src = gifBlob;
      
      status.style.display = "none";
      loader.style.display = "none";
      document.getElementById("output").style.display = "block"; //make the output container visible
      btnGenerate.disabled = false;
      btnGenerate.textContent = "Generate";

      endTime = new Date().getTime();

      console.log(`Elapsed Time: ${(endTime-startTime)/1000}s`);
    }
    
    img.src = event.target.result;
  }
  reader.readAsDataURL(imageInput.files[0]);
});

btnDownload.addEventListener("click", function() {
  let link = document.createElement("a");
  link.href = outputImage.src;
  link.download = `${imageInput.files[0].name.replace(/\.[^/.]+$/, "")}_${numberOfImpostors.value}lsb.gif`;
  
  link.click();
});

//original height and width have to be in pixels
function resizeImage(originalHeight, originalWidth, numberOfImpostors) {
  let newHeight = parseInt(numberOfImpostors);
  /*
    keeping ratios constant:
    newHeight/originalHeight = newWidth/originalWidth
    originalWidth*newHeight/originalHeight = newWidth
  */
  let newWidth = Math.round((originalWidth*newHeight)/(originalHeight));

  return {
    height: newHeight,
    width: newWidth
  }
}

btnHelp.addEventListener("click", function() {
  window.open('https://github.com/Walker30263/dumpygif', '_blank');
});




// ---------------------------------------- inputs/displays -------------------------------------

function attachInputEvent(el, callback) {
  for (let event of ["mouseup", "mousedown", "mousemove", "change"]) {
    el.addEventListener(event, callback)
  }
}

//update the number of impostors label when the input value changes
attachInputEvent(numberOfImpostors, () => {
  document.getElementById("numberOfImpostorsDisplay").innerHTML = `Lines of Sussy Bakas: <strong>${numberOfImpostors.value}</strong><br>(higher value = better "resolution" but will take more time to generate)`;
})

//update the gif speed label when the input value changes
attachInputEvent(gifSpeed, () => {
  document.getElementById("gifSpeedDisplay").textContent = "Gif speed... 😏: " + gifSpeed.value + " ms";
})

//update the enlarge output label when the input value changes (actual value = input value/100)
attachInputEvent(enlargeOutput, () => {
  if (enlargeOutput.value == 100) {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: 1x (Default, no enlargement)";
  } else {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: " + (enlargeOutput.value/100).toFixed(2) + "x";
  }
})

// display additional settings when choreographed is checked

choreographed.addEventListener("change", function() {
  if (choreographed.checked) {
    document.getElementById("choreographyTypeContainer").style.display = "block";
  } else {
    document.getElementById("choreographyTypeContainer").style.display = "none";
  }
});

basicC.addEventListener("change", function() {
  if (basicC.checked) {
    document.getElementById("waveDirectionsContainer").style.display = "none";
  }
});

rippleC.addEventListener("change", function() {
  if (rippleC.checked) {
    document.getElementById("waveDirectionsContainer").style.display = "none";
  }
});

waveC.addEventListener("change", function() {
  if (waveC.checked) {
    document.getElementById("waveDirectionsContainer").style.display = "block";
  }
});

// display additional settings when Color Collapse is checked

colorCollapse.addEventListener("change", function() {
  if (colorCollapse.checked) {
    compressionPercentContainer.style.display = "block";
  } else {
    compressionPercentContainer.style.display = "none";
  }
});

//update the compression percent label when the input value changes (actual value = input value/100)
attachInputEvent(compressionPercent, () => {
  compressionPercentDisplay.textContent = `Compression: ${compressionPercent.value}% (higher = less contrast, but faster generation time)`;
})

// helper function to quickly get choreography data:

function getChoreographyData() {
  let obj = {};

  if (choreographed.checked) {
    obj.choreography = true;
  } else {
    obj.choreography = false;
    return obj;
  }

  if (basicC.checked) {
    obj.type = "basic";    
  } else if (waveC.checked) {
    obj.type = "wave";
    
    if (document.getElementById("horizontal").checked) {
      obj.direction = "horizontal";
    } else if (document.getElementById("vertical").checked) {
      obj.direction = "vertical";
    }
  } else if (rippleC.checked) {
    obj.type = "ripple";
  }

  return obj;
}


// helper function to quickly get color collapse data

function getColorCollapseData() {
  return {
    collapse: colorCollapse.checked,
    compressionPercent: compressionPercent.value
  }
}
