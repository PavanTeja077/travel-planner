const https = require('https');
const fs = require('fs');

https.get('https://en.wikipedia.org/wiki/Anurag_University', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Look for the logo image url
    const match = data.match(/src="(\/\/upload\.wikimedia\.org\/wikipedia\/[^"]+logo[^"]*\.png)"/i) || 
                  data.match(/src="(\/\/upload\.wikimedia\.org\/wikipedia\/[^"]+Anurag_University[^"]*\.png)"/i);
    
    if (match) {
      let url = 'https:' + match[1];
      // get a larger size if it's a thumb
      url = url.replace(/\/\d+px-/, '/512px-');
      console.log('Found:', url);
      
      https.get(url, res2 => {
        res2.pipe(fs.createWriteStream('logo.png'));
        console.log('Downloaded logo.png');
      });
    } else {
      console.log('Logo not found in HTML. Using fallback dummy logo generation (since it requires a real image).');
      // Just create a dummy image if we fail, though we really want the real one
    }
  });
});
