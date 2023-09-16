const fs = require('fs');

// Read the allcsgoskins.txt file
fs.readFile('allcsgoskins.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Normalize line endings and split the file into blocks
  const normalizedData = data.replace(/\r\n/g, '\n');
  const blocks = normalizedData.split('\n\n');
  const skins = [];

  console.log(`Total blocks: ${blocks.length}`);

  // Loop through each block and create a JSON object
  blocks.forEach((block, index) => {
    const [caseCollection, weapon, skinName, rarity] = block.split('\n');
    skins.push({ caseCollection, weapon, skinName, rarity });
    console.log(`Processed block ${index + 1}`);
  });

  // Write the JSON object to a new file
  fs.writeFile('allcsgoskins.json', JSON.stringify(skins, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing the file:', err);
    } else {
      console.log('Successfully converted to JSON.');
    }
  });
});
