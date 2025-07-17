import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { askAI } from "../services/ai_service";

interface TableRow {
  [key: string]: string | number | boolean;
}

interface AIResult {
  type: 'text' | 'table' | 'mixed';
  textContent?: string;
  tableData?: TableRow[];
  error?: string;
}

interface AIResponse {
  result?: AIResult;
  error?: string;
}

interface LayoutContext {
  token: string;
}

const isRTL = (text: string): boolean => {
    const rtlPattern = /[\u0590-\u05FF]/; 
    return rtlPattern.test(text);
  };

const AI_Chat_Assistant_page = () => {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const { token } = useOutletContext<LayoutContext>();

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    console.log("📤 Sending question to backend:", question);

    try {
      const response: AIResponse = await askAI(question, token);
      console.log("📥 Raw response from backend:", response);
      if (response.result?.tableData) {
        console.log("🧪 Received tableData:", response.result.tableData);
        console.log("🧪 typeof tableData:", typeof response.result.tableData);
      }
      if (response.error) {
        console.error("❌ Error from backend:", response.error);
        setError(response.error);
      } else {
        if (!response.result) {
          console.warn("⚠️ Backend responded with no result.");
        } else {
          console.log("✅ Parsed AI result:", response.result);
        }
        setResult(response.result || null);
      }
    } catch (err) {
      let message = "An error occurred while processing your request";

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "error" in err) {
        message = (err as { error: string }).error;
      }

      console.error("❗ Exception in handleAsk:", err);

      if (
        message.includes("Invalid or expired token") ||
        message.includes("token")
      ) {
        console.warn("🔒 Token issue detected. Logging out...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        navigate("/");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data: TableRow[]) => {
    console.log("📊 Rendering table with rows:", data.length);
    console.log("🔍 Full data object received in renderTable:\n", data);

    if (!data || data.length === 0) {
      console.warn("⚠️ No data returned from backend to display in table.");
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No data found for your query.</p>
        </div>
      );
    }

    const headers = Object.keys(data[0]);
    console.log("🧾 Table headers:", headers);
    console.log("🧾 Row 0 sample keys:", headers);
    console.log("🧾 Row 0 sample values:", data[0]);
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border border-gray-300 px-4 py-2 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {headers.map((header) => (
                  <td key={header} className="border border-gray-300 px-4 py-2">
                    {String(row[header] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTextContent = (content: string) => {
    const direction = isRTL(content) ? 'rtl' : 'ltr';

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200" dir={direction}>
        <div className="text-blue-800 whitespace-pre-wrap text-sm">{content}</div>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.error) {
      console.error("❌ AI returned error:", result.error);
      return (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-800">{result.error}</div>
        </div>
      );
    }

    switch (result.type) {
      case 'text':
        return result.textContent ? renderTextContent(result.textContent) : null;

      case 'table':
        return result.tableData ? renderTable(result.tableData) : null;

      case 'mixed':
        return (
          <div className="space-y-4">
            {result.textContent && renderTextContent(result.textContent)}
            {result.tableData && renderTable(result.tableData)}
          </div>
        );

      default:
        console.warn("⚠️ Unknown response type:", result.type);
        return (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">Unknown response type</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Job Indexing Assistant 🤖</h1>
        <p className="text-gray-600">Type your question to extract data from the system
        </p>
      </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
              rows={4}
              placeholder="Type your question here..."
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Ask AI"
            )}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Results:</h3>
              {renderResult()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AI_Chat_Assistant_page;