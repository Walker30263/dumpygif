/*
  I am incredibly sorry to anyone who is reading this spaghetti code,
  I tried to comment to the best of my ability </3 

  Feel free to suggest ways to make this more efficient 
*/

class Pixel {
  constructor(r, g, b, a) {
    this.red = r,
    this.green = g,
    this.blue = b,
    this.a = a
  }

  replace(pixel) {
    this.red = pixel.red;
    this.green = pixel.green;
    this.blue = pixel.blue;
    this.a = pixel.a;
  }

  replaceValues(r, g, b) {
    this.red = r;
    this.green = g;
    this.blue = b;
  }

  //source: http://www.compuphase.com/cmetric.htm
  static distance(p1, p2) {
    let redmean = (p1.red + p2.red)/2;

    return Math.sqrt((2 + (redmean/256))*((p1.red - p2.red) ** 2) + (4*((p1.green - p2.green) ** 2)) + ((2+((255-redmean)/256))*(p1.blue - p2.blue) ** 2));
  }
}

import Dumpy from '/sus.js';
let gifmaker = new Dumpy();

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

//for status purposes
var totalColors;
var impostorColorsMade = 0;

//gets the number of unique colors in the pixels array (which is the expected input)
function getTotalUniqueColors(arr) {
  let newArr = arr.map((el) => {
    return JSON.stringify(el);
  });

  return new Set(newArr).size;
}

/*
  cache to hold the different "positions" of impostors so we don't
  have to request them from the server every time we color a new impostor
*/

var sprites = new Map();

window.onload = async function() {
  for (let i = 1; i <= 6; i++) {
    let impostor = await loadImage(`assets/gif-images/${i}.png`);
    sprites.set(i, impostor);
  }

  btnGenerate.textContent = "Generate";
  btnGenerate.disabled = false;
}

//update the number of impostors label when the input value changes
numberOfImpostors.addEventListener("mouseup", updateNumberOfImpostorsLabel);
numberOfImpostors.addEventListener("mousedown", updateNumberOfImpostorsLabel);
numberOfImpostors.addEventListener("mousemove", updateNumberOfImpostorsLabel);
numberOfImpostors.addEventListener("change", updateNumberOfImpostorsLabel);

function updateNumberOfImpostorsLabel() {
  document.getElementById("numberOfImpostorsDisplay").innerHTML = `Lines of Sussy Bakas: <strong>${numberOfImpostors.value}</strong><br>(higher value = better "resolution" but will take more time to generate)`;
}

//update the gif speed label when the input value changes
gifSpeed.addEventListener("mouseup", updateGifSpeedLabel);
gifSpeed.addEventListener("mousedown", updateGifSpeedLabel);
gifSpeed.addEventListener("mousemove", updateGifSpeedLabel);
gifSpeed.addEventListener("change", updateGifSpeedLabel);

function updateGifSpeedLabel() {
  document.getElementById("gifSpeedDisplay").textContent = "Gif speed... 😏: " + gifSpeed.value + " ms";
}

//update the enlarge output label when the input value changes (actual value = input value/100)
enlargeOutput.addEventListener("mouseup", updateEnlargeOutputLabel);
enlargeOutput.addEventListener("mousedown", updateEnlargeOutputLabel);
enlargeOutput.addEventListener("mousemove", updateEnlargeOutputLabel);
enlargeOutput.addEventListener("change", updateEnlargeOutputLabel);

function updateEnlargeOutputLabel() {
  if (enlargeOutput.value == 100) {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: 1x (Default, no enlargement)";
  } else {
    document.getElementById("enlargeOutputDisplay").textContent = "Enlarge Output: " + (enlargeOutput.value/100).toFixed(2) + "x";
  }
}

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

//when the generate button is clicked...
btnGenerate.addEventListener("click", async function(e) {
  e.preventDefault(); //prevent page from reloading

  if (imageInput.files.length === 0) {
    alert("Please upload an image to sussify!");
    return;
  }

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
      gifmaker.setMultiplier(enlargeOutput.value / 100);
      gifmaker.setOriginalDimensions(img.height, img.width);
      gifmaker.setChoreographySettings(getChoreographyData());

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
      
      gifmaker.setPixels(pixels);
      
      totalColors = getTotalUniqueColors(pixels);

      let impostors = await createImpostors(pixels);
      gifmaker.setDictionary(impostors);
      
      status.textContent = "Drawing frames...";
      await gifmaker.generateFrames(choreographed.checked);

      console.log(gifmaker.images);

      status.textContent = "Rendering gif...";
      let gifBlob = await gifmaker.generateGif(gifSpeed.value);

      gifBlob = URL.createObjectURL(gifBlob);
      
      console.log(gifBlob);
      
      outputImage.width = img.width*(enlargeOutput.value / 100);
      outputImage.height = img.height*(enlargeOutput.value / 100);
      outputImage.src = gifBlob;
      

      //reset the file input field
      // document.getElementById("imageInput").value = null;
      impostorColorsMade = 0;
      
      status.style.display = "none";
      loader.style.display = "none";
      document.getElementById("output").style.display = "block"; //make the output container visible
      btnGenerate.disabled = false;
      btnGenerate.textContent = "Generate";
    }
    
    img.src = event.target.result;
  }
  reader.readAsDataURL(imageInput.files[0]);
});

btnDownload.addEventListener("click", function() {
  let link = document.createElement("a");
  link.href = outputImage.src;
  link.download = "sus.gif";
  
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

async function createImpostors(pixels) {
  let impostorsOfDifferentColors = {};
  
  for (let i = 0; i < pixels.length; i++) {
    //if the object doesn't already have the impostor in the current pixel's color, color the impostor
    if (!(JSON.stringify(pixels[i]) in impostorsOfDifferentColors)) {
      let impostorsOfThisColor = {};
      for (let j = 1; j <= 6; j++) {
        let impostor = await colorImpostor(sprites.get(j), pixels[i]);
        impostorsOfThisColor[j] = impostor;
      }

      impostorsOfDifferentColors[JSON.stringify(pixels[i])] = impostorsOfThisColor;
      
      impostorColorsMade++;
      status.innerHTML = `Coloring impostors... ${impostorColorsMade}/${totalColors}`;
      await pause(0); //quick fix to update the page using statement above because the thing runs so fast it doesn't stop and update status' textContent until all of the impostors are colored
    }
  }

  return impostorsOfDifferentColors;
}

//create an impostor with the color of pixel
function colorImpostor(impostor, pixel) {
  return new Promise(resolve => {
    let pixelColor = `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${pixel.a})`;
    let darkerColor = pSBC(-0.4, pixelColor);
    darkerColor = darkerColor.slice(5); //get rid of the "rgba("
    darkerColor = darkerColor.slice(0, -1); //get rid of the ")" at the end
    darkerColor = darkerColor.split(",");
  
    let c = document.createElement("canvas"); //make a temporary canvas to draw the original impostor on
    let ctx = c.getContext("2d");
    let w = impostor.width;
    let h = impostor.height; 
    c.width = w;
    c.height = h;
  
    //draw impostor on temporary canvas
    ctx.drawImage(impostor, 0, 0, w, h);
  
    //get an array of pixel data
    let imageData = ctx.getImageData(0, 0, c.width, c.height);

    for (let i = 0; i < imageData.data.length; i+=4) {
      //if pixel is the bright red part of the original impostor...
      if (imageData.data[i] == 198 && imageData.data[i+1] == 9 && imageData.data[i+2] == 9) {
        //change to new RGB
        imageData.data[i] = pixel.red;
        imageData.data[i+1] = pixel.green;
        imageData.data[i+2] = pixel.blue;
      }
      else if (imageData.data[i] == 123 && imageData.data[i+1] == 2 && imageData.data[i+2] == 53) {
        imageData.data[i] = darkerColor[0];
        imageData.data[i+1] = darkerColor[1];
        imageData.data[i+2] = darkerColor[2];
      }
    }
  
    ctx.putImageData(imageData, 0, 0);
  
    resolve(c.toDataURL("image/png"));
  });
}

async function loadImage(imageUrl) {
  let img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

async function pause(x) {
  await new Promise(resolve => setTimeout(resolve, x));
}

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

btnHelp.addEventListener("click", function() {
  window.open('https://github.com/Walker30263/dumpygif', '_blank');
});

const pSBC=(p,c0,c1,l)=>{
	let r,g,b,P,f,t,h,m=Math.round,a=typeof(c1)=="string";
	if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
	h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBC.pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBC.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
	if(!f||!t)return null;
	if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
	else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
	a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
	if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
	else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

pSBC.pSBCr=(d)=>{
	const i=parseInt;
	let n=d.length,x={};
	if(n>9){
		const [r, g, b, a] = (d = d.split(','));
	        n = d.length;
		if(n<3||n>4)return null;
		x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
	}else{
		if(n==8||n==6||n<4)return null;
		if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
		d=i(d.slice(1),16);
		if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=Math.round((d&255)/0.255)/1000;
		else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
	}return x
};
