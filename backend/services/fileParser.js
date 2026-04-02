const PDFParser = require('pdf2json');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const tesseract = require('tesseract.js');

async function parseFile(file) {
  const mimeType = file.mimetype;
  const buffer = file.buffer;
  const originalName = file.originalname.toLowerCase();

  try {
    // PDF Handling
    if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
      const { PDFParse } = require('pdf-parse');
      try {
          const parser = new PDFParse({ data: buffer });
          const data = await parser.getText();
          await parser.destroy();
          return data.text.replace(/\n/g, ' ');
      } catch (err) {
          throw new Error("Failed to parse PDF: " + err.message);
      }
    } 
    // DOCX Handling
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || originalName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: buffer });
      return result.value;
    } 
    // Excel and CSV Handling
    else if (mimeType.includes('excel') || mimeType.includes('spreadsheetml') || originalName.endsWith('.csv') || originalName.endsWith('.xlsx')) {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let outputText = '';
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        outputText += xlsx.utils.sheet_to_csv(sheet) + '\n\n';
      });
      return outputText;
    } 
    // Simple Text / JSON Handling
    else if (mimeType === 'text/plain' || mimeType === 'application/json' || originalName.endsWith('.txt') || originalName.endsWith('.json')) {
      return buffer.toString('utf-8');
    } 
    // Image OCR Handling
    else if (mimeType.startsWith('image/')) {
        // Tesseract accepts buffer directly
        const result = await tesseract.recognize(
            buffer,
            'eng'
        );
        return result.data.text;
    } else {
        throw new Error('Unsupported file type.');
    }
  } catch (error) {
    throw new Error('Error extracting content: ' + error.message);
  }
}

module.exports = { parseFile };
