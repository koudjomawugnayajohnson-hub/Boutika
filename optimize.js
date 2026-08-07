const Jimp = require('jimp');

async function optimizeImage() {
  try {
    const image = await Jimp.read('public/hero_image.png');
    await image
      .resize(1200, Jimp.AUTO) // resize to max 1200px width
      .quality(80)             // set JPEG quality
      .writeAsync('public/hero_image_optimized.jpg'); // save
    console.log('Image optimized successfully!');
  } catch (err) {
    console.error('Error optimizing image:', err);
  }
}

optimizeImage();
