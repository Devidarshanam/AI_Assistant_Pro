const express = require('express');
const multer = require('multer');
const { parseFile } = require('../services/fileParser');
const { chunkText } = require('../utils/chunker');
const { generateQuizzes } = require('../services/ollamaService');

const router = express.Router();

// Setup Multer to store uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // Limit to 50MB
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a supported document.' });
    }

    // Step 1: Detect File Type and Parse Content 
    const extractedText = await parseFile(req.file);

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ error: 'Could not extract text from the file.' });
    }

    // Calculate target questions based on document size (~1 question per 100 words), min 5, max 20
    const wordCount = extractedText.trim().split(/\s+/).length;
    let targetTotalQuestions = Math.ceil(wordCount / 100);
    targetTotalQuestions = Math.max(5, Math.min(20, targetTotalQuestions));

    // Step 2: Chunk the extracted text (increased to 500 words to massively decrease the number of LLM iterations required)
    let chunks = chunkText(extractedText, 500);

    // If there are too many chunks (e.g., a massive PDF), sample roughly 4 chunks to keep wait times under 15 seconds!
    const MAX_CHUNKS = 4;
    if (chunks.length > MAX_CHUNKS) {
        const step = chunks.length / MAX_CHUNKS;
        const sampledChunks = [];
        for (let i = 0; i < MAX_CHUNKS; i++) {
            sampledChunks.push(chunks[Math.floor(i * step)]);
        }
        chunks = sampledChunks;
    }

    // Step 3: Send chunks to AI model for Quiz Generation
    // Ask for 3 extra buffer questions because the AI sometimes drops or malforms questions
    const quizzes = await generateQuizzes(chunks, targetTotalQuestions + 3);

    // Filter out invalid chunks or empty questions
    const validQuizzes = quizzes.filter(q => q && q.questions && q.questions.length > 0);
    
    // Combine all quizzes into one final JSON
    let allQuestions = [];
    validQuizzes.forEach(quiz => {
        allQuestions = allQuestions.concat(quiz.questions);
    });

    console.log("allQuestions before filter:", JSON.stringify(allQuestions, null, 2));
    require('fs').writeFileSync('all_q_log.json', JSON.stringify(allQuestions, null, 2));

    let filteredQuestions = allQuestions.filter(q => 
      q && 
      typeof q.question === 'string' &&
      !q.question.toLowerCase().includes('what is the capital of france') &&
      !q.question.toLowerCase().includes('what color is the sky') &&
      !q.question.toLowerCase().includes('text of generated question') &&
      Array.isArray(q.options) && 
      q.options.length > 1 &&
      typeof q.answer === 'string'
    );

    if (filteredQuestions.length === 0) {
      return res.status(500).json({ error: 'AI failed to generate any valid questions from the text.' });
    }

    // Ensure we don't exceed the target total questions
    if (filteredQuestions.length > targetTotalQuestions) {
        filteredQuestions = filteredQuestions.slice(0, targetTotalQuestions);
    }

    return res.json({ questions: filteredQuestions });
  } catch (error) {
    console.error('Error processing file upload:', error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
});

module.exports = router;
