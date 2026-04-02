const fs = require('fs');

async function testUploadFailedPDF() {
  const fileBlob = new Blob(['not a real pdf content'], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', fileBlob, 'fake.pdf');

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
testUploadFailedPDF();
