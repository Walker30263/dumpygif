/*
  I am incredibly sorry to anyone who is reading this spaghetti code,
  I tried to comment to the best of my ability </3 

  Feel free to suggest ways to make this more efficient 
*/

var advancedSettings = false;

import Pixel from '/pixel.js';

import Dumpy from '/sus.js';
let gifmaker;

let numberOfImpostors = document.getElementById("numberOfImpostors");
let numberOfImpostors_advanced = document.getElementById("numberOfImpostors_advanced");
let gifSpeed = document.getElementById("gifSpeed");
let gifSpeed_advanced = document.getElementById("gifSpeed_advanced");
let enlargeOutput = document.getElementById("enlargeOutput");
let enlargeOutput_advanced = document.getElementById("enlargeOutput_advanced");
let imageInput = document.getElementById("imageInput");
let btnGenerate = document.getElementById("btnGenerate");
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
let compressionPercent_advanced = document.getElementById("compressionPercent_advanced");
let compressionPercentDisplay = document.getElementById("compressionPercentDisplay");
let compressionPercentContainer = document.getElementById("compressionPercentContainer");

// advanced settings for nerds:

let toggleAdvancedSettings = document.getElementById("toggleAdvancedSettings");

let numWorkers = document.getElementById("numWorkers");
let numWorkersDisplay = document.getElementById("numWorkersDisplay");
let gifQuality = document.getElementById("gifQuality");
let gifQualityDisplay = document.getElementById("gifQualityDisplay");

var startTime;
var endTime;

//when the generate button is clicked...
btnGenerate.addEventListener("click", async function(e) {
  e.preventDefault(); //prevent page from reloading

  gifmaker = new Dumpy(parseInt(numWorkers.value), parseInt(gifQuality.value));
  
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
      gifmaker.setInterval(advancedSettings ? parseFloat(gifSpeed_advanced.value) : gifSpeed.value);
      gifmaker.setMultiplier(advancedSettings ? parseFloat(enlargeOutput_advanced.value) : enlargeOutput.value / 100);
      gifmaker.setOriginalDimensions(img.height, img.width);
      gifmaker.setChoreographySettings(getChoreographyData());
      gifmaker.setColorCollapseSettings(getColorCollapseData());

      //this will determine the number of impostors we have in the output gif
      let resizedDimensions = resizeImage(img.height, img.width, advancedSettings ? parseInt(numberOfImpostors_advanced.value) : numberOfImpostors.value);
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
      
      outputImage.width = img.width*(advancedSettings ? parseFloat(enlargeOutput_advanced.value) : enlargeOutput.value / 100);
      outputImage.height = img.height*(advancedSettings ? parseFloat(enlargeOutput_advanced.value) : enlargeOutput.value / 100);
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
  link.download = `${imageInput.files[0].name.replace(/\.[^/.]+$/, "")}_${advancedSettings ? parseInt(numberOfImpostors_advanced.value) : numberOfImpostors.value}lsb.gif`;
  
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



// ---------------------------------------- inputs/displays -------------------------------------

function attachInputEvent(el, callback) {
  for (let event of ["mouseup", "mousedown", "mousemove", "change"]) {
    el.addEventListener(event, callback);
  }
}

//update the number of impostors label when the input value changes
attachInputEvent(numberOfImpostors, () => {
  document.getElementById("numberOfImpostorsDisplay").innerHTML = `Lines of Sussy Bakas: <strong>${numberOfImpostors.value}</strong><br>(higher value = better "resolution" but will take more time to generate)`;
});

attachInputEvent(numberOfImpostors_advanced, () => {
  document.getElementById("numberOfImpostorsDisplay").innerHTML = `Lines of Sussy Bakas: <strong>${numberOfImpostors_advanced.value}</strong><br>(higher value = better "resolution" but will take more time to generate)`;
});

//update the gif speed label when the input value changes
attachInputEvent(gifSpeed, () => {
  document.getElementById("gifSpeedDisplay").textContent = "Gif speed... 😏: " + gifSpeed.value + " ms";
});

attachInputEvent(gifSpeed_advanced, () => {
  document.getElementById("gifSpeedDisplay").textContent = "Gif speed... 😏: " + gifSpeed_advanced.value + " ms";
});

//update the enlarge output label when the input value changes (actual value = input value/100)
attachInputEvent(enlargeOutput, () => {
  if (enlargeOutput.value == 100) {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: 1x (Default, no enlargement)";
  } else {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: " + (enlargeOutput.value/100).toFixed(2) + "x";
  }
});

attachInputEvent(enlargeOutput_advanced, () => {
  if (enlargeOutput_advanced.value == 1) {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: 1x (Default, no enlargement)";
  } else {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: " + parseFloat(enlargeOutput_advanced.value).toFixed(2) + "x";
  }
});

// update the numWorkersDisplay label when the input value changes
attachInputEvent(numWorkers, () => {
  numWorkersDisplay.textContent = `Number of workers: ${numWorkers.value}`;
});

// update the gifQualityDisplay label when the input value changes
attachInputEvent(gifQuality, () => {
  gifQualityDisplay.textContent = `Pixel Sample Interval: ${gifQuality.value} (lower = higher quality GIF but will take longer to produce, and vice versa)`
});

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
});

attachInputEvent(compressionPercent_advanced, () => {
  compressionPercentDisplay.textContent = `Compression: ${compressionPercent_advanced.value}% (higher = less contrast, but faster generation time)`;
});

toggleAdvancedSettings.addEventListener("click", function() {
  advancedSettings = !advancedSettings;
  
  let advancedSettingsElements = Array.from(document.getElementsByClassName("advancedSettings"));
  let basicSettings = Array.from(document.getElementsByClassName("basicSettings"));

  if (advancedSettings) { // if they're being enabled
    numberOfImpostors_advanced.value = numberOfImpostors.value;
    gifSpeed_advanced.value = gifSpeed.value;
    enlargeOutput_advanced.value = enlargeOutput.value/100;
    compressionPercent_advanced.value = compressionPercent.value;
  } else { // if they're being disabled
    numberOfImpostors.value = numberOfImpostors_advanced.value;
    gifSpeed.value = gifSpeed_advanced.value;
    enlargeOutput.value = enlargeOutput_advanced.value*100;
    compressionPercent.value = compressionPercent_advanced.value;
  }

  advancedSettingsElements.forEach(el => {
    if (advancedSettings) {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  });

  basicSettings.forEach(el => {
    if (advancedSettings) {
      el.style.display = "none";
    } else {
      el.style.display = "";
    }
  });

  if (advancedSettings) {
    toggleAdvancedSettings.scrollIntoView({
      behavior: 'instant'
    });
  }
});

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
    compressionPercent: advancedSettings ? compressionPercent_advanced.value : compressionPercent.value
  }
}
