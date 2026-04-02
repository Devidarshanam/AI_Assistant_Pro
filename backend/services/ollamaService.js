async function callOllama(prompt) {
    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "tinyllama",
            prompt: prompt,
            stream: false,
            format: "json", // Instruct Ollama to output standard JSON
            options: {
                temperature: 0.2 // Factual generation usually benefits from low temperature
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
}

async function generateQuizzes(chunks, targetTotalQuestions = 5) {
    const quizzes = [];
    
    // Distribute the target total cleanly upfront
    let remainingQuestions = targetTotalQuestions;
    let questionsPerChunkArray = [];
    let remainingChunks = chunks.length;

    for (let i = 0; i < chunks.length; i++) {
        let questionsForThisChunk = Math.ceil(remainingQuestions / remainingChunks);
        if (questionsForThisChunk < 1) questionsForThisChunk = 1;

        questionsPerChunkArray.push(questionsForThisChunk);
        remainingQuestions -= questionsForThisChunk;
        remainingChunks--;
        
        if (remainingQuestions <= 0) break;
    }

    // Limit the active chunks to only those that received a question budget allocation
    const activeChunks = chunks.slice(0, questionsPerChunkArray.length);

    // Execute API requests concurrently using Promise.all to drastically shrink API latency vs iterative queuing
    const promises = activeChunks.map(async (chunk, i) => {
        const questionsForThisChunk = questionsPerChunkArray[i];
        const systemPrompt = `[INST]
You are a test-generation assistant.
Below is a text document enclosed in triple quotes. You must read it and generate EXACTLY ${questionsForThisChunk} multiple-choice questions based ONLY on the information inside the triple quotes. 
DO NOT generate questions about these instructions. DO NOT generate questions about JSON.

"""
${chunk}
"""

Requirements for your questions:
- Write straightforward questions about the text content.
- Provide exactly 4 options. Do NOT use "All of the above" or "None of the above".
- Keep every single option EXTREMELY short and concise (under 8 words maximum). Do NOT write paragraphs for options.
- Ensure that only one option is the correct answer and the other three options are definitively wrong.
- The question must ask for a single, specific piece of fact.
- The "answer" field must precisely match the correct option.

Output MUST be exclusively a JSON object. Do not output anything other than JSON.
Use this exact JSON schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    }
  ]
}
[/INST]`;

        try {
            console.log(`Processing chunk ${i+1}/${activeChunks.length} concurrently via TinyLlama...`);
            const generatedResponse = await callOllama(systemPrompt);
            console.log(`Response chunk ${i+1} received...`);
            
            let parsedJson;
            try {
                 parsedJson = JSON.parse(generatedResponse.trim());
            } catch (err) {
                 console.warn("Failed strictly parsing JSON, attempting sanitization...", err.message);
                 const jsonMatch = generatedResponse.match(/\{[\s\S]*\}/);
                 if (jsonMatch) {
                     parsedJson = JSON.parse(jsonMatch[0]);
                 } else {
                     throw new Error("No parsable JSON found in the response.");
                 }
            }
            
            // Handle different JSON wrappings tinyllama might use
            let questionsArray = null;
            if (parsedJson && parsedJson.questions) {
                questionsArray = parsedJson.questions;
            } else if (parsedJson && parsedJson.quiz && parsedJson.quiz.questions) {
                questionsArray = parsedJson.quiz.questions;
            } else if (Array.isArray(parsedJson)) {
                questionsArray = parsedJson;
            } else if (parsedJson && Array.isArray(parsedJson[Object.keys(parsedJson)[0]])) {
                questionsArray = parsedJson[Object.keys(parsedJson)[0]];
            }

            if (questionsArray && Array.isArray(questionsArray)) {
                // Normalize the questions to ensure they match frontend expectations
                const normalizedQuestions = questionsArray.map(q => {
                    let answer = q.answer;
                    let options = q.options || [];
                    
                    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object') {
                        // Handle the case where options is an array of objects like {text: "A", correct: true}
                        const correctOption = options.find(o => o.correct === true || o.isCorrect === true);
                        if (correctOption) {
                            answer = correctOption.text || correctOption.option;
                        }
                        options = options.map(o => typeof o === 'string' ? o : (o.text || o.option || JSON.stringify(o)));
                    }

                    if (!answer && Array.isArray(options)) {
                        answer = options[0];
                    }

                    // Remove duplicates, ensure 4 options, and ensure answer is included
                    if (Array.isArray(options)) {
                        options = [...new Set(options)];
                        
                        if (answer && !options.includes(answer)) {
                            options.push(answer);
                        }

                        if (options.length < 4) {
                            const fallbacks = ["Information not provided in text", "Indeterminable context", "Not applicable", "Irrelevant information", "Cannot be determined", "No specific mention"];
                            while (options.length < 4) {
                                const fb = fallbacks.find(f => !options.includes(f)) || ("Option " + (options.length + 1));
                                options.push(fb);
                            }
                        } else if (options.length > 4) {
                            const otherOptions = options.filter(o => o !== answer).slice(0, 3);
                            options = [answer, ...otherOptions];
                        }
                        
                        options.sort(() => Math.random() - 0.5);
                    }

                    return {
                        question: q.question,
                        options: options,
                        answer: answer
                    };
                });

                quizzes.push({ questions: normalizedQuestions });
                console.log(`Successfully locally stored ${normalizedQuestions.length} questions from concurrent chunk ${i+1}`);
            } else {
                console.log(`No questions found in parsed JSON format.`);
            }
        } catch (error) {
            console.error(`Error generating quiz for chunk ${i+1}:`, error.message);
        }
    });

    await Promise.all(promises);
    return quizzes;
}

module.exports = { generateQuizzes };
