/**
 * Splits text into chunks of specified maximum word count.
 * @param {string} text 
 * @param {number} maxWords 
 * @returns {string[]}
 */
function chunkText(text, maxWords = 400) {
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    const words = cleanedText.split(' ');
    const chunks = [];
    
    for (let i = 0; i < words.length; i += maxWords) {
        const chunk = words.slice(i, i + maxWords).join(' ');
        chunks.push(chunk);
    }
    
    return chunks;
}

module.exports = { chunkText };
