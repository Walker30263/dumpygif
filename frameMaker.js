// constants here bc we keep forgetting 💀
const SPRITE_WIDTH = 74;
const SPRITE_HEIGHT = 63;

const c = new OffscreenCanvas(SPRITE_WIDTH, SPRITE_HEIGHT); //make a temporary OffscreenCanvas to draw the original impostor on
const ctx = c.getContext("2d");

/*
  "impostorsOfDifferentColors" is an object with keys being different colors,
  and each of those keys' keys being 6 different impostors 
  in different "positions" drawn in that color
*/

let impostorsOfDifferentColors = {};

var sprites;
var masks;
var colors;
var frameGenerationData;

onmessage = async (e) => {
  sprites = e.data.sprites;
  colors = e.data.colors;
  masks = e.data.masks;
  frameGenerationData = e.data.frameGenerationData;
  
  for (let i = 0; i < colors.length; i++) {
    let impostorsOfThisColor = {};
    for (let j = 1; j <= 6; j++) {
      let impostor = await colorImpostor(j, colors[i]);
      postMessage({
        finished: false,
        newImpostorForTesting: true,
        impostor: impostor
      });
      impostorsOfThisColor[j] = impostor;
    }

    impostorsOfDifferentColors[JSON.stringify(colors[i])] = impostorsOfThisColor;
    
    postMessage({
      finished: false,
      newImpostorsColored: true
    });
  }

  postMessage({
    finished: true,
    taskFinishedWith: "creatingImpostors"
  });

  for (let i = 0; i < 6; i++) {
    let newFrame = generateImage(frameGenerationData.seed, frameGenerationData.pixels, frameGenerationData.originalWidth, frameGenerationData.originalHeight, frameGenerationData.multiplier, frameGenerationData.height, frameGenerationData.width, frameGenerationData.impostorWidth, frameGenerationData.impostorHeight);
    
    frameGenerationData.seed = incrementSeedPositions(frameGenerationData.seed);
    
    postMessage({
      finished: false,
      newFrame: newFrame
    });
  }

  postMessage({
    finished: true,
    taskFinishedWith: "creatingFrames"
  });
}

// "seed" is an array of positions (numbers from 1-6 corresponding to assets/gif-images/[number].png) that's height*width long
function generateImage(seed, pixels, originalWidth, originalHeight, multiplier, height, width, impostorWidth, impostorHeight) {
  let canvas = new OffscreenCanvas(originalWidth*multiplier, originalHeight*multiplier);
  let ctx = canvas.getContext("2d");
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      let pixel = pixels[row * width + col];
      let position = seed[row][col];
      
      let impostorBitmap = impostorsOfDifferentColors[JSON.stringify(JSON.stringify(pixel))][position];

      ctx.drawImage(impostorBitmap, col * impostorWidth, row * impostorHeight, impostorWidth, impostorHeight);
    }
  }

  return canvas.transferToImageBitmap("image/png");
}

//create an impostor with the color of pixel
async function colorImpostor(impostorNumber, pixel) {
  let impostor = sprites[impostorNumber];
  let mask = masks[impostorNumber];
  
  ctx.clearRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);

  pixel = JSON.parse(pixel);
    
  let pixelColor = `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${pixel.alpha})`;
  let darkerColor = pSBC(-0.4, pixelColor);
  darkerColor = darkerColor.slice(5); //get rid of the "rgba("
  darkerColor = darkerColor.slice(0, -1); //get rid of the ")" at the end
  darkerColor = darkerColor.split(",");

  //draw impostor on canvas
  ctx.drawImage(impostor, 0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);

  //get an array of pixel data
  let imageData = ctx.getImageData(0, 0, c.width, c.height);
  
  //if pixel is the bright red part of the original impostor...
  mask.light.forEach(index => {
    //change to new RGB
    imageData.data[index] = pixel.red;
    imageData.data[index+1] = pixel.green;
    imageData.data[index+2] = pixel.blue;
  });

  //if pixel is the darker/shadow part of the original impostor...
  mask.shadow.forEach(index => {
    imageData.data[index] = darkerColor[0];
    imageData.data[index+1] = darkerColor[1];
    imageData.data[index+2] = darkerColor[2];
  });

  ctx.putImageData(imageData, 0, 0);
  
  return c.transferToImageBitmap("image/png")
}

function incrementSeedPositions(seed) {
  for (let i = 0; i < seed.length; i++) {
    for (let j = 0; j < seed[i].length; j++) {
      seed[i][j] = (seed[i][j] % 6) + 1;
    }
  }

  return seed;
}



//credit: https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)

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
