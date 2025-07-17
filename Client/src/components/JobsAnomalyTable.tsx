import React, { useState, useEffect } from 'react';
import { getJobsAnomalies, type JobAnomalyData } from '../services/index_service';

interface JobsAnomalyTableProps {
  token: string;
}

const JobsAnomalyTable: React.FC<JobsAnomalyTableProps> = ({ token }) => {
  const [anomalies, setAnomalies] = useState<JobAnomalyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof JobAnomalyData>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        const data = await getJobsAnomalies(token);
        setAnomalies(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
        setError('Failed to load anomalies data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
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

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const calculateDifference = (sent: number, inFeed: number) => {
    return sent - inFeed;
  };

  const getRowClassName = (anomaly: JobAnomalyData) => {
    const isAnomaly = anomaly.totalJobsSentToIndex > anomaly.totalJobsInFeed;
    return isAnomaly 
      ? 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100' 
      : 'hover:bg-gray-50';
  };

  const getAnomalyIcon = (anomaly: JobAnomalyData) => {
    const isAnomaly = anomaly.totalJobsSentToIndex > anomaly.totalJobsInFeed;
    return isAnomaly ? (
      <span className="text-red-600 font-bold" title="Anomaly: More jobs sent to index than in feed">
        ⚠️
      </span>
    ) : (
      <span className="text-green-600" title="Normal data">
        ✅
      </span>
    );
  };

  const getDifferenceDisplay = (anomaly: JobAnomalyData) => {
    const diff = calculateDifference(anomaly.totalJobsSentToIndex, anomaly.totalJobsInFeed);
    const isAnomaly = diff > 0;
    
    return (
      <span className={`font-semibold ${isAnomaly ? 'text-red-600' : 'text-green-600'}`}>
        {isAnomaly ? '+' : ''}{formatNumber(diff)}
      </span>
    );
  };

  const anomalyCount = anomalies.filter(a => a.totalJobsSentToIndex > a.totalJobsInFeed).length;
  const totalClients = anomalies.length;

  const sortedAnomalies = [...anomalies].sort((a, b) => {
    const aIsAnomaly = a.totalJobsSentToIndex > a.totalJobsInFeed;
    const bIsAnomaly = b.totalJobsSentToIndex > b.totalJobsInFeed;
    
    if (aIsAnomaly && !bIsAnomaly) return -1;
    if (!aIsAnomaly && bIsAnomaly) return 1;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'timestamp') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? 
      (aValue as number) - (bValue as number) : 
      (bValue as number) - (aValue as number);
  });

  const totalPages = Math.ceil(sortedAnomalies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnomalies = sortedAnomalies.slice(startIndex, endIndex);

  const handleSort = (field: keyof JobAnomalyData) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: keyof JobAnomalyData) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Jobs Feed vs Index Analysis</h3>
        <p className="text-sm text-gray-500">
          Identify anomalies where jobs sent to index exceed jobs in feed
        </p>
      </div>

      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{anomalyCount}</div>
            <div className="text-sm text-gray-600">Anomalies Found</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">
              {totalClients > 0 ? `${((anomalyCount / totalClients) * 100).toFixed(1)}%` : '0%'}
            </div>
            <div className="text-sm text-gray-600">Anomaly Rate</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-gray-700">Anomaly: More jobs sent to index than in feed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <span className="text-gray-700">Normal data</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('transactionSourceName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Client</span>
                  {getSortIcon('transactionSourceName')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('countryCode')}
              >
                <div className="flex items-center space-x-1">
                  <span>Country</span>
                  {getSortIcon('countryCode')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalJobsInFeed')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Jobs in Feed</span>
                  {getSortIcon('totalJobsInFeed')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalJobsSentToIndex')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Jobs Sent to Index</span>
                  {getSortIcon('totalJobsSentToIndex')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difference
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Updated</span>
                  {getSortIcon('timestamp')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAnomalies.map((anomaly) => (
              <tr key={anomaly._id} className={getRowClassName(anomaly)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAnomalyIcon(anomaly)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {anomaly.transactionSourceName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{anomaly.countryCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">
                    {formatNumber(anomaly.totalJobsInFeed)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">
                    {formatNumber(anomaly.totalJobsSentToIndex)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {getDifferenceDisplay(anomaly)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(anomaly.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedAnomalies.length)} of {formatNumber(sortedAnomalies.length)} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  const half = Math.floor(5 / 2);
                  if (currentPage <= half) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - half) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - half + i;
                  }
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {anomalies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default JobsAnomalyTable;