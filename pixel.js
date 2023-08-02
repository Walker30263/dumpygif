class Pixel {
  constructorjsonstring(JSONstring) {
    let data = JSON.parse(JSONstring);
    
    this.red = data.red;
    this.green = data.green;
    this.blue = data.blue;
    this.alpha = data.alpha;
  }
  
  constructorrgba(r, g, b, a) {
    this.red = r,
    this.green = g,
    this.blue = b,
    this.alpha = a
  }
  
  constructor() {
    if (arguments.length == 1) {
      this.constructorjsonstring(...arguments)
    } else if (arguments.length == 4) {
      this.constructorrgba(...arguments);
    } 
  } 

  replace(pixel) {
    this.red = pixel.red;
    this.green = pixel.green;
    this.blue = pixel.blue;
    this.alpha = pixel.alpha;
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

export default Pixel;
