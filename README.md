# AI Job Skill Analyzer

A full-stack web app that allows account managers to analyze job indexing performance and query job feed logs via natural language.

# Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: Google Gemini Pro via Generative AI SDK
- **Charting**: 

# Setup Instructions
git clone https://github.com/noy19988/AI-Job-Skill-Analayzer.git
cd client - npm install
cd server - npm install
create file server/.env with the following data:

ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
JWT_TOKEN_EXPIRATION
DB_CONNECTION
PORT
GEMINI_API_KEY

cd server - npm run dev
cd client - npm start
