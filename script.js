class Pixel {
  constructor(r, g, b, a) {
    this.red = r,
    this.green = g,
    this.blue = b,
    this.a = a
  }
}

import Dumpy from '/sus.js';
let gifmaker = new Dumpy();

let numberOfImpostors = document.getElementById("numberOfImpostors");
let gifSpeed = document.getElementById("gifSpeed");
let choreographed = document.getElementById("choreographed");
let imageInput = document.getElementById("imageInput");
let btnGenerate = document.getElementById("btnGenerate");
let status = document.getElementById("status");
let outputImage = document.getElementById("outputImage");
let btnDownload = document.getElementById("btnDownload");

//for status purposes
var totalColors;
var impostorColorsMade = 0;

function getTotalColors(arr) {
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
    let impostor = await loadImage(`gif-images/${i}.png`);
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
  document.getElementById("numberOfImpostorsDisplay").textContent = "Lines of Sussy Bakas: " + numberOfImpostors.value;
}

//update the gif speed label when the input value changes
gifSpeed.addEventListener("mouseup", updateGifSpeedLabel);
gifSpeed.addEventListener("mousedown", updateGifSpeedLabel);
gifSpeed.addEventListener("mousemove", updateGifSpeedLabel);
gifSpeed.addEventListener("change", updateGifSpeedLabel);

function updateGifSpeedLabel() {
  document.getElementById("gifSpeedDisplay").textContent = "Gif speed... 😏: " + gifSpeed.value + " ms";
}

//when the generate button is clicked...
btnGenerate.addEventListener("click", async function(e) {
  e.preventDefault(); //prevent page from reloading

  btnGenerate.disabled = true;
  btnGenerate.textContent = "Generating...";
  
  status.style.display = "block";
  status.textContent = "Loading Image...";

  let reader = new FileReader();
  reader.onload = async function(event) {
    let img = new Image();
    status.textContent = "Coloring impostors...";
    img.onload = async function() {      
      let resizedDimensions = resizeImage(img.height, img.width, numberOfImpostors.value);
      let tempCanvas = document.createElement("canvas");
      let tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = resizedDimensions.width;
      tempCanvas.height = resizedDimensions.height;
      tempCtx.drawImage(img, 0, 0, resizedDimensions.width, resizedDimensions.height);

      gifmaker.setOriginalDimensions(img.height, img.width);
      gifmaker.setDimensions(resizedDimensions.height, resizedDimensions.width);
      
      var imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      let pixels = [];
      
      for (let i = 0; i < imgData.data.length; i += 4) {
        let pixel = new Pixel(imgData.data[i], imgData.data[i+1], imgData.data[i+2], imgData.data[i+3]);
        pixels.push(pixel);
      }

      totalColors = getTotalColors(pixels);
      gifmaker.setPixels(pixels);

      let impostors = await createImpostors(pixels);
      gifmaker.setDictionary(impostors);
      
      status.textContent = "Drawing frames...";
      await gifmaker.generateFrames(choreographed.checked);

      console.log(gifmaker.images);

      status.textContent = "Rendering gif...";
      let gifBlob = await gifmaker.generateGif(gifSpeed.value);

      console.log(gifBlob);
      
      outputImage.width = img.width;
      outputImage.height = img.height;
      outputImage.src = gifBlob;
      

      //reset the form
      document.getElementById("settings").reset();
      document.getElementById("numberOfImpostorsDisplay").textContent = "Lines of Sussy Bakas: " + numberOfImpostors.value;

      status.style.display = "none";
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
    //if the map doesn't already have the impostor in the current pixel's color, color the impostor
    if (!(JSON.stringify(pixels[i]) in impostorsOfDifferentColors)) {
      let impostorsOfThisColor = {};
      for (let j = 1; j <= 6; j++) {
        let impostor = await colorImpostor(sprites.get(j), pixels[i]);
        impostorsOfThisColor[j] = impostor;
      }

      impostorsOfDifferentColors[JSON.stringify(pixels[i])] = impostorsOfThisColor;
      
      impostorColorsMade++;
      status.innerHTML = `Coloring impostors...${impostorColorsMade}/${totalColors}`;
      console.log(impostorColorsMade + "/" + totalColors);
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