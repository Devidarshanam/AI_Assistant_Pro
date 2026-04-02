const fs = require('fs');

async function testUpload() {
  const filePath = process.argv[2];
  const outPath = process.argv[3];
  
  const blob = new Blob([fs.readFileSync(filePath)]);
  const formData = new FormData();
  formData.append('file', blob, filePath);

  const res = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData
  });

  const json = await res.json();
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log('Saved to', outPath);
}

testUpload();
