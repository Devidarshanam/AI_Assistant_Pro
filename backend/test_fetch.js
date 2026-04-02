const fs = require('fs');

async function testUpload() {
  const fileBlob = new Blob([fs.readFileSync('dummy.txt')], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', fileBlob, 'dummy.txt');

  try {
    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
testUpload();
