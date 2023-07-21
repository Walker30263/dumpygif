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

Just a warning, the more lines of sussy bakas you want in your gif, the longer it's going to take to generate the gif.

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
If this is checked/turned on, all the impostors will be in the same "position" at the same time. 

For example, the difference between

![Pride-nc](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/pride-15lsb-150ms-1x-nc.gif)

and

![Pride-c](https://raw.githubusercontent.com/Walker30263/dumpygif/main/assets/examples/pride-15lsb-150ms-1x-c.gif)
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
	A user can also choose to start with a seed that's all 1s, if they want a "choreographed" gif.
8. Use [gif.js](https://jnordberg.github.io/gif.js/) to create a gif from these frames, and display it to the user and let them download it if they wish!


If you have any questions or have any suggestions, please feel free to create an issue here on GitHub or contact me on Discord: @sky3.142