import React, { useState, useEffect } from 'react';
import { getCriticalAnomaliesStats, type CriticalAnomaliesStatsResponse } from '../services/index_service';

interface CriticalAnomaliesTableProps {
  token: string;
}

const CriticalAnomaliesTable: React.FC<CriticalAnomaliesTableProps> = ({ token }) => {
  const [data, setData] = useState<CriticalAnomaliesStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCriticalAnomaliesStats(token);
        setData(response);
        setError(null);
      } catch (error) {
        console.error('Error fetching critical anomalies stats:', error);
        setError('Failed to load critical anomalies statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-2">⚠️</div>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.clientsWithCriticalAnomalies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2"></div>
        <p>No clients with critical anomalies found</p>
      </div>
    );
  }

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-red-500';
    if (percentage >= 50) return 'bg-orange-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityLabel = (percentage: number) => {
    if (percentage >= 75) return 'Critical';
    if (percentage >= 50) return 'High';
    if (percentage >= 25) return 'Medium';
    return 'Low';
  };

  const getSeverityTextColor = (percentage: number) => {
    if (percentage >= 75) return 'text-red-700';
    if (percentage >= 50) return 'text-orange-700';
    if (percentage >= 25) return 'text-yellow-700';
    return 'text-green-700';
  };

  const getSeverityBgColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-red-50';
    if (percentage >= 50) return 'bg-orange-50';
    if (percentage >= 25) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-semibold text-gray-900">Critical Anomalies by Client</h3>
        <p className="text-sm text-gray-600">
          Clients with highest percentage of critical anomalies requiring immediate attention
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Total clients analyzed: {data.totalClients} | Clients with critical issues: {data.clientsWithCriticalAnomalies.length}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Critical Anomalies %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Critical Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Logs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Required
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.clientsWithCriticalAnomalies.map((client, index) => (
                <tr key={client.clientName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-red-600' : 
                        index === 1 ? 'bg-orange-600' : 
                        index === 2 ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getSeverityColor(client.criticalAnomaliesPercentage)}`}
                          style={{ width: `${client.criticalAnomaliesPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {client.criticalAnomaliesPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-red-600">
                      {client.criticalAnomaliesCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {client.totalLogs}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBgColor(client.criticalAnomaliesPercentage)} ${getSeverityTextColor(client.criticalAnomaliesPercentage)}`}>
                      {getSeverityLabel(client.criticalAnomaliesPercentage)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.criticalAnomaliesPercentage >= 50 ? 'bg-red-100 text-red-800' : 
                      client.criticalAnomaliesPercentage >= 25 ? 'bg-orange-100 text-orange-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.criticalAnomaliesPercentage >= 50 ? 'Immediate' : 
                       client.criticalAnomaliesPercentage >= 25 ? 'High Priority' : 
                       'Monitor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Critical Anomalies Include:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Index Overflow:</strong> Jobs sent to index exceed jobs in feed</li>
          <li>• <strong>Feed Processing Failure:</strong> Jobs in feed exceed total records</li>
          <li>• <strong>Zero Processing Anomaly:</strong> Records exist but no jobs processed</li>
        </ul>
      </div>
    </div>
  );
};

export default CriticalAnomaliesTable;