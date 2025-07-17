# Process & Thought Behind AI Job Skill Analyzer

# Architecture Overview

- **Frontend (React)**:
  - A dashboard that displays several tables and graphs that present various data and indicate trends and anomalies.
  AnomaliesChart – A bar chart showing the percentage of clients affected by each anomaly type, grouped by severity level. Includes a summary of total anomalies and their distribution.
  CriticalAnomaliesTable – A table listing clients with a high percentage of critical anomalies, used to identify high-risk clients needing urgent attention.
  IndexLogsTable – A detailed table of indexing logs per client, including records in feed, jobs indexed, failed jobs, and success rate. Supports filtering, sorting, and pagination.
  JobsAnomalyTable – A table that highlights discrepancies where more jobs were sent to index than were present in the feed, with visual indicators and anomaly metrics.


- **Backend (Node.js + Express)**:
  - api/ai/chat/routes/models/logics/server/mongoDB/middleware
  - all data uploaded to mongoDB through a script
  - we have 2 models, user model and index model 
  - server create the environment and app runs it
  - controllers folder represent all the calculation and functionallity for the app
  - routes folder includes all the routes of the app 
  - A middleware file that protects incoming requests

- **AI Integration**:
  - Google Gemini Pro 1.5 API 
  - Prompt-based instruction model that builds dynamic aggregation pipelines.
  - Strict JSON parsing and cleaning handled manually.
  - The AI response includes a responseType field to tell the app how to handle the result:
        "data" – return only a MongoDB pipeline, shown as a table or chart.
        "text" – return only a plain text explanation, no data needed.
        "mixed" – return both: a pipeline and a short explanation.
        This helps the frontend know whether to show data, text, or both.
  - The prompt first defines the AI agent's role and the domain it operates in — job indexing analytics.
        Then it provides a clear overview of the data structure in the MongoDB collection, including all relevant fields.
        It also includes a real example document to give the model full context.
        After that, the prompt outlines strict instructions for how the model should respond — including the required JSON format, how to handle dates, and what types of answers are allowed.


