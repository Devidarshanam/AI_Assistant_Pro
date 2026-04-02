# AI Assistant Pro 🤖📚

AI Assistant Pro is a full-stack educational web application designed to automatically generate interactive, multiple-choice quizzes from any document you upload. By leveraging local Large Language Models (LLMs) through Ollama and a persistent MongoDB database, it ensures that your data remains private while providing a smart, dynamically tailored study platform with user accounts and history tracking.

---

## 🌟 Key Features

1. **Secure User Authentication**:
   - Full Registration and Login system.
   - **Strong Password Policy**: Requires at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
   - JWT (JSON Web Token) based session management—stay logged in even after refreshing the page.

2. **Persistent Quiz History**:
   - Every quiz you complete is automatically saved to **MongoDB**.
   - **"My History" Viewer**: Access a dedicated dashboard to see all previously studied documents, dates, and your respective scores.

3. **Intelligent Document Parsing**: 
   - Upload multiple formats: PDF, DOCX, TXT, CSV, XLSX, and Images (JPG/PNG via OCR).
   - Backend utilizes `pdf-parse`, `mammoth`, `xlsx`, and `tesseract.js` for robust text extraction.

4. **Local AI Quiz Generation (No Quotas)**: 
   - Powered by a locally hosted **Ollama** instance running the `tinyllama` model.
   - **Privacy First**: All AI processing happens on YOUR machine. No external APIs, no data leaks, and **no usage quotas** or subscription limits.
   
5. **Premium Glassmorphism UI**:
   - Modern, responsive interface with a blurred glass effect.
   - **Top Navigation Bar**: Quick access to History and Logout with subtle glowing hover effects.
   - Immediate visual feedback on quiz answers.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite)
- **Backend**: Node.js & Express
- **Database**: MongoDB (Local installation)
- **AI Infrastructure**: Ollama (`tinyllama` model)
- **Authentication**: JWT & Bcryptjs (Password Hashing)
- **Core Dependencies**: 
   - `mongoose`: Database modeling.
   - `multer`: File upload handling.
   - `pdf-parse`, `tesseract.js`, `mammoth`: Document parsing.

---

## 🚀 How to Run the Project Locally

### Prerequisites
1. **Node.js** installed.
2. **MongoDB** installed and running locally on port `27017`.
3. **Ollama** installed ([ollama.com](https://ollama.com/)).
4. Run `ollama run tinyllama` once to download the model.

### 1. Start the Backend Server
```bash
cd backend
npm install
# Ensure you have a .env file with MONGO_URI and JWT_SECRET
node server.js
```
*Connects to `mongodb://127.0.0.1:27017/ai_assistant_pro`.*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Accessible at `http://localhost:5173`.*

---

## 🔧 Internal Process Flow

1. **Auth Gate**: Users must Register/Login. Passwords are hashed before storage.
2. **Upload**: Files are parsed and text is extracted based on file type.
3. **Chunking**: Text is split into manageable segments for the AI context window.
4. **AI Generation**: `ollamaService.js` hits your local Ollama API to generate JSON-formatted questions.
5. **Persistence**: Scores and filenames are linked to the User ID and saved in the MongoDB `scores` collection.
6. **History Retrieval**: The History Viewer fetches these records securely using the user's JWT.
