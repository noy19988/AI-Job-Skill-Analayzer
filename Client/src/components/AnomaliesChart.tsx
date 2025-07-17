import React, { useState, useEffect } from 'react';
import { getAnomaliesStats, type AnomaliesStatsResponse } from '../services/index_service';

interface AnomaliesChartProps {
  token: string;
}

const AnomaliesChart: React.FC<AnomaliesChartProps> = ({ token }) => {
  const [data, setData] = useState<AnomaliesStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAnomaliesStats(token);
        setData(response);
        setError(null);
      } catch (error) {
        console.error('Error fetching anomalies stats:', error);
        setError('Failed to load anomalies statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p>No data available</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const maxPercentage = Math.max(...data.anomalies.map(a => a.percentage));
  const chartHeight = 300;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900">Data Anomalies Analysis</h3>
        <p className="text-sm text-gray-600">
          Percentage of clients affected by different types of data processing anomalies
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Analyzed {data.totalClients} clients from the last week
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-end justify-between" style={{ height: `${chartHeight}px` }}>
          {data.anomalies.map((anomaly, index) => (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div 
                className="w-full max-w-16 relative group cursor-pointer"
                style={{ height: `${chartHeight - 60}px` }}
              >
                <div className="absolute bottom-0 w-full flex flex-col justify-end">
                  <div
                    className={`${getSeverityColor(anomaly.severity)} rounded-t-md transition-all duration-300 hover:opacity-80`}
                    style={{ 
                      height: `${maxPercentage > 0 ? (anomaly.percentage / maxPercentage) * (chartHeight - 60) : 0}px`,
                      minHeight: anomaly.percentage > 0 ? '4px' : '0px'
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                      {anomaly.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className={`px-3 py-2 text-xs rounded-lg shadow-lg border ${getSeverityBorderColor(anomaly.severity)} w-48 text-center`}>
                    <div className="font-medium">{anomaly.name}</div>
                    <div className="text-gray-600 mt-1">{anomaly.description}</div>
                    <div className="mt-1">
                      <span className="font-medium">{anomaly.count}</span> out of {data.totalClients} clients
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs text-center text-gray-600 leading-tight max-w-16">
                {anomaly.name.split(' ').map((word, i) => (
                  <div key={i}>{word}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Severity Levels</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">High - Critical process failures</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-700">Medium - Logic inconsistencies</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">Low - Data quality issues</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {data.anomalies.reduce((sum, a) => sum + a.count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Anomalies</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {data.anomalies.filter(a => a.severity === 'high').reduce((sum, a) => sum + a.count, 0)}
          </div>
          <div className="text-sm text-gray-600">Critical Issues</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {data.totalClients - data.anomalies.reduce((sum, a) => sum + (a.count > 0 ? 1 : 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Healthy Clients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {data.totalClients > 0 ? (((data.totalClients - data.anomalies.reduce((sum, a) => sum + (a.count > 0 ? 1 : 0), 0)) / data.totalClients) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600">Health Rate</div>
        </div>
      </div>
    </div>
  );
};

export default AnomaliesChart;