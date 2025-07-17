import { Request, Response } from 'express';
import { askGemini } from './gemini_connection';
import IndexLogModel from '../models/indexlogs_model';
import type { PipelineStage } from 'mongoose';

interface AIResponse {
  type: 'text' | 'table' | 'mixed';
  textContent?: string;
  tableData?: Record<string, unknown>[];
  error?: string;
}

interface GeminiParsedResponse {
  responseType: 'data' | 'text' | 'mixed';
  pipeline?: PipelineStage[];
  explanation?: string;
}

export const askQueryHandler = async (req: Request, res: Response) => {
  try {
    const userQuery = req.body.question;


    const prompt = `
You are a data analyst assistant working with a MongoDB collection named "IndexLog".
App Purpose and Domain:
The application is designed to analyze and assist in understanding job indexing processes from various sources. It focuses on analyzing logs related to job data processing — including statistics like job counts, data quality, enrichment, indexing failures, etc. — segmented by country, client, and time.

Each document in the collection may contain the following fields:
- transactionSourceName (string)
- timestamp (ISODate)
- country_code (string)
- currency_code (string)
- status (string)
- progress.TOTAL_JOBS_IN_FEED (number)
- progress.TOTAL_JOBS_SENT_TO_INDEX (number)
- progress.TOTAL_JOBS_FAIL_INDEXED (number)
- progress.TOTAL_JOBS_DONT_HAVE_METADATA (number)
- progress.TOTAL_JOBS_SENT_TO_ENRICH (number)
- noCoordinatesCount (number)
- recordCount (number)
- uniqueRefNumberCount (number)

Example document:
{
  "_id": "68709db2402cf56cd3813d9e",
  "country_code": "US",
  "currency_code": "USD",
  "progress": {
    "SWITCH_INDEX": true,
    "TOTAL_RECORDS_IN_FEED": 16493,
    "TOTAL_JOBS_FAIL_INDEXED": 1521,
    "TOTAL_JOBS_IN_FEED": 13705,
    "TOTAL_JOBS_SENT_TO_ENRICH": 20,
    "TOTAL_JOBS_DONT_HAVE_METADATA": 2540,
    "TOTAL_JOBS_DONT_HAVE_METADATA_V2": 2568,
    "TOTAL_JOBS_SENT_TO_INDEX": 13686
  },
  "status": "completed",
  "timestamp": "2025-07-11T05:16:20.626Z",
  "transactionSourceName": "Deal4",
  "noCoordinatesCount": 160,
  "recordCount": 11118,
  "uniqueRefNumberCount": 9253
}

Instructions:
1. First, determine whether the user question can be answered using a MongoDB Aggregation Pipeline.
2. You must respond with a JSON object in the following format:
   {
     "responseType": "data" | "text" | "mixed",
     "pipeline": [aggregation pipeline array] (only if responseType is "data" or "mixed"),
     "explanation": "text explanation" (only if responseType is "text" or "mixed")
   }
3. responseType should be:
   - "data": if the question can be answered purely with data that should be displayed in a table
   - "text": if the question requires a textual explanation or is outside the data scope
   - "mixed": if you need both data and explanation
4. DO NOT return any markdown formatting. That means:
   - NO triple backticks,
   - NO "json" labels,
   - NO code fences.
   The response must be **pure raw JSON string only**, ready for JSON.parse().
5. Your response must be valid JSON only.
6. Prefer clear and simple aggregation pipelines.
7. If the question cannot be answered with aggregation, respond with responseType "text" and provide a clear explanation.
8. The chat assistant will only respond to questions related to job indexing analytics and data stored in the database. If a question is unrelated to this domain, respond with responseType "text" and explain it's outside the scope.
9.When returning a textual explanation (explanation field), do not include any special characters or formatting symbols. This includes (but is not limited to): emojis (😊), asterisks (*), bullet points (•), markdown symbols (e.g., **, __), or any decorative characters. Return plain, neutral English text only.
10.Important:
- Do not use $subtract with $$NOW or any dynamic date calculation inside the pipeline.
- Instead, you must use a fixed ISO date string (e.g., "2024-07-17T00:00:00.000Z") when filtering documents by timestamp.
- The current date and one-year-ago date will be provided to you in the prompt. Use the given value directly in $match.
- Never return JavaScript math expressions or variables in the pipeline (e.g., $$NOW, new Date()). Always use hardcoded values.
- Never return JavaScript math expressions inside the JSON. Instead, evaluate them into raw numbers (e.g., use 8640000000 instead of 100 * 24 * 60 * 60 * 1000).



User question: "${userQuery}"
    `.trim();

    const geminiResponse = await askGemini(prompt);

    let parsedResponse: GeminiParsedResponse;

    try {
        const cleanedGeminiResponse = geminiResponse.replace(/```(?:json)?\n?|```$/g, '').trim();
        
        parsedResponse = JSON.parse(cleanedGeminiResponse);
      console.log("Gemini response parsed successfully.");
    } catch (parseError) {
      console.error("JSON Error from Gemini:", parseError);

      const fallbackResult: AIResponse = {
        type: 'text',
        textContent: geminiResponse.trim()
      };

      return res.status(200).json({ result: fallbackResult });
    }

    const responseType = parsedResponse.responseType;
    const mappedType: AIResponse['type'] =
      responseType === 'data' ? 'table' : responseType;

    const result: AIResponse = { type: mappedType };
    console.log("Response Type:", mappedType);

    if (responseType === 'data' || responseType === 'mixed') {
      if (parsedResponse.pipeline) {
        try {
          const aggregationResult = await IndexLogModel.aggregate(parsedResponse.pipeline);
          console.log("Aggregation Result:", aggregationResult);
          result.tableData = aggregationResult;
        } catch (aggregationError) {
          console.error("Aggregation Error:", aggregationError);
          result.type = 'text';
          result.error = 'Error executing database query. Please try rephrasing your question.';
        }
      } else {
        console.warn("⚠️ No pipeline provided in Gemini response.");
      }
    }

    if (responseType === 'text' || responseType === 'mixed') {
      if (parsedResponse.explanation) {
        result.textContent = parsedResponse.explanation;
      }
    }



    return res.status(200).json({ result });

  } catch (error) {
    console.error("General Error:", error);
    res.status(500).json({
      error: 'Server error while processing the query.',
    });
  }
};