
# [DumpyGif](https://dumpygif.me/)
![Logo](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/logo.gif)

Hosted for free on [https://dumpygif.me/](https://dumpygif.me) thanks to repl.it! (And thanks to NameCheap for the free domain!)

Heavily inspired by @ThatOneCalculator's [Among Us Dumpy Gif Maker](https://github.com/ThatOneCalculator/Among-Us-Dumpy-Gif-Maker) Discord bot. 

# How to use
1. Upload the image file that you wish to create a gif from
2. Adjust controls (more details in the next section)
3. Click the "Generate" button
4. Wait
5. Download your gif to share with your friends!

# Settings
### Lines of Sussy Bakas
This lets you control the resolution / contrast of your image. 

For example, images like flags require less contrast, as they have a lower number of unique colors and rarely have gradients:

![Pride](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/pride-15lsb-150ms-1x-nc.gif)
(created with 15 lines of sussy bakas)

However, more sophisticated images with a higher number of unique colors/gradients require more contrast to be intelligible:

![Walter White](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/walter-60lsb-150ms-1x-nc.gif)

(created with 60 lines of sussy bakas)

Just a warning, the more lines of sussy bakas you want in your gif, the longer it's going to take to generate the gif, and the more we recommend that you turn Color Collapse on.

### Gif speed
Self-explanatory..

Lower delay in ms = faster gif

Higher delay = slower gif

### Enlarge Output
By default, the dimensions of the gif produced will be exactly the same as the dimensions of the input image. If the input image is small, and you'd like your gif to be larger, you can use the "Enlarge Output" slider to increase the output dimensions by a multiplier.
Here's a case where this would be useful:

Starting image:

![red impostor](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/red-impostor.jpg)

Gif with default dimensions (same dimensions as starting image):

![red impostor default size](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/red-30lsb-150ms-1x-nc.gif)

Gif with "Enlarged Output" of 2.00x:

![red impostor 2.00x](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/red-30lsb-150ms-2x-nc.gif)

### Choreographed
If this is unchecked/turned off, impostors will be in random positions at any given time. 

If this is checked/turned on, you will be given access to more choreography options, which will determine the positions of the impostors at random times.

As of 07/22/2023, we have 3 choreography options: basic, ripple, and wave:

No choreography:

![Pride-nc](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/pride-15lsb-150ms-1x-nc.gif)

Basic choreography:

![Pride-c](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/pride-15lsb-150ms-1x-c.gif)

Ripple choreography (works better with higher lines of sussy bakas):

![Pride-rc](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/pride-40lsb-150ms-1x-rc.gif)

Wave choreography (works better with higher lines of sussy bakas):
![Pride-wc](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/pride-40lsb-150ms-1x-wc.gif)
(For wave choreography, you can choose whether you want the waves to go in the horizontal or vertical direction.)

### Color Collapse™
To make a DumpyGif, we have to create a different impostor for each unique color in the image, which might take a lot of time with certain images. 

If this is turned on, then the same impostor will be used for similar colors (colors that would have appeared the same to the average human, although they might have been a few RGB values apart from each other). This will drastically speed up generation time for images that have thousands of different colors. 

If this is turned off, different impostors will be created for colors that appear almost the same to the human eye. 

For example:

Original Image: 
![original-image](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/zhongli.png)

Gif created without Color Collapse (5783 unique colors):
![without-cc](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/zhongli-100lsb-150ms.gif)

Gif created with Color Collapse (2123 unique colors) took **65% less time** to generate:
![with-cc](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/zhongli-100lsb-150ms-cc.gif)

(We use [this](http://www.compuphase.com/cmetric.htm) algorithm to evaluate how "close" colors are to each other. Interesting read if you're into Color Perception Theory.)

### Advanced Settings
Warning: Before dabbling into Advanced Settings, please experiment with the website a bit to know the limits of your hardware. 

If you choose to toggle Advanced Settings on, you will have direct control over certain variables, such as Lines of Sussy Bakas, Gif Speed, Enlarge Output Multiplier, and more. You won't be limited by the ranges anymore, you can directly type in the numbers that you want.

You will also have access to certain additional variables, such as "Number of Workers" and "Pixel Sample Interval."

Increasing the "Number of Workers" setting will speed up the GIF rendering process, but will consume more RAM, which might be a bad idea and lead to slowdowns if you're on a device with low RAM.

The "Pixel Sample Interval" determines the level of detail and accuracy in the resulting GIF image. A smaller pixel sample interval means more frequent sampling, resulting in a higher level of detail but potentially larger file size.

We plan on adding more Advanced Settings in the future to allow you to customize your DumpyGif experience to your heart's content! 

For example, gif created using the example image from the Color Collapse™ section with 350 lines of sussy bakas and 5x enlargement (using 70% color collapse and 20 workers):

![350lsb](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/zhongli_350lsb.gif)

As you can see, Advanced Settings are helpful if you want to create a DumpyGif with high contrast.

# Algorithm
(you can stop reading now if you're not a nerd and came here just to learn how to use this website)

The basic algorithm is 
1. Calculate the dimensions of the gif we want to generate based on user input ("Lines of Sussy Bakas")
2. Resize the inputted image into those dimensions
3. Parse the resized image to get an array of all the pixels in the image
4. There are 6 "original" images of impostors in different "positions" in the assets/gif-images folder. These original impostors are colored in two shades of red: one brighter than the other (which represents a shadow). 
5. An original impostor from the assets/gif-images folder can be colored by looping through the image data and replacing rgb values of the original pixels with the desired ones. (Use [pSBC.js](https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-%28pSBC.js%29) to generate a darker color to represent the shadow of the pixel's color.) Check function colorImpostor(impostor, pixel) for my implementation.
6. Loop through the array of pixels created in Step 3. For every pixel, check if impostors of its color have already been created. If not, use the algorithm in Step 5 to create them (all 6), and store their data URLs in an object with the key being the pixel (JSON-stringified). Let's call this object "impostorsOfDifferentColors."

Checkpoint: we now have an array of pixels that we will replace with impostors and a dictionary-like object called "impostorsOfDifferentColors" that holds data URLs of 6 different impostors for each unique color in the array of pixels. Now we generate frames for the gif.

7. We can generate an image using a seed using this basic algorithm:
	For every pixel in the array of pixels, draw an impostor with the pixel's color on a grid. The seed is an array containing numbers from 1-6 to represent the position that each impostor is in during its "dance routine." To generate the next image, we simply increment every value in the seed (and reroll 6s over to 1s) until we have 6 frames. 
	A user can also choose to start with a seed that's all 1s, if they want a basic "choreographed" gif. Other seed generation methods can be found in seedBaker.js
8. Use [gif.js](https://jnordberg.github.io/gif.js/) to create a gif from these frames, and display it to the user and let them download it if they wish!

#
If you have any questions or have any suggestions, please feel free to create an issue here on GitHub or contact me on Discord: @sky3.142
