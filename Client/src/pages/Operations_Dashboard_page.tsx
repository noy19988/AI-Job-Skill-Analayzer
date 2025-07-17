import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import IndexLogsTable from '../components/IndexLogsTable';
import { getDashboardMetrics } from '../services/index_service';
import JobsAnomalyTable from '../components/JobsAnomalyTable';
import AnomaliesChart from '../components/AnomaliesChart';


interface LayoutContext {
  token: string;
}

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
}

interface DashboardMetrics {
    totalRecords: {
      current: number;
      change: number;
    };
    totalJobsSentToIndex: {  
      current: number;
      change: number;
    };
    totalSuccessedIndexing: {
      current: number;
      change: number;
    };
    successRate: {
      current: number;
      change: number;
    };
    failedJobs: {
      current: number;
      change: number;
    };
  }

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  icon, 
  children, 
  expandable = false, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${
          expandable ? 'cursor-pointer hover:from-blue-100 hover:to-indigo-100' : ''
        }`}
        onClick={expandable ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-blue-600">{icon}</div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {expandable && (
            <div className="text-gray-500">
              {isExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
      {(!expandable || isExpanded) && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

const MetricsOverview: React.FC<{ token: string }> = ({ token }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getDashboardMetrics(token);
        setMetrics(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}% from last week`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Error</h3>
          <p className="text-lg font-bold">{error || 'Failed to load'}</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-300 p-4 rounded-lg">
            <h3 className="text-sm font-medium opacity-90">-</h3>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs opacity-75">-</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
        <h3 className="text-sm font-medium opacity-90">Total Records</h3>
        <p className="text-2xl font-bold">{formatNumber(metrics.totalRecords.current)}</p>
        <p className="text-xs opacity-75">{formatChange(metrics.totalRecords.change)}</p>
      </div>
  
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
        <h3 className="text-sm font-medium opacity-90">Weekly Jobs Sent to Index</h3>
        <p className="text-2xl font-bold">{formatNumber(metrics.totalJobsSentToIndex.current)}</p>
        <p className="text-xs opacity-75">{formatChange(metrics.totalJobsSentToIndex.change)}</p>
      </div>
      
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
        <h3 className="text-sm font-medium opacity-90">Weekly Failed Jobs</h3>
        <p className="text-2xl font-bold">{formatNumber(metrics.failedJobs.current)}</p>
        <p className="text-xs opacity-75">{formatChange(metrics.failedJobs.change)}</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
        <h3 className="text-[10.5px] font-medium opacity-90">Weekly Succeeded Index Processing</h3>
        <p className="text-2xl font-bold">{formatNumber(metrics.totalSuccessedIndexing.current)}</p>
        <p className="text-xs opacity-75">{formatChange(metrics.totalSuccessedIndexing.change)}</p>
      </div>
      
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
        <h3 className="text-sm font-medium opacity-90">Weekly Success Rate</h3>
        <p className="text-2xl font-bold">{metrics.successRate.current.toFixed(1)}%</p>
        <p className="text-xs opacity-75">{formatChange(metrics.successRate.change)}</p>
      </div>
    </div>
  );
}

const OperationsDashboardPage: React.FC = () => {
  const { token } = useOutletContext<LayoutContext>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and analyze job index performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          <DashboardCard 
            title="Key Metrics Overview" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          >
            <MetricsOverview token={token} />
          </DashboardCard>

          <DashboardCard 
            title="Index Logs Table" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a2 2 0 012-2h14a2 2 0 012 2v16l-7-3.5L5 20z" />
              </svg>
            }
            expandable={true}
            defaultExpanded={true}
          >
            <IndexLogsTable token={token} />
          </DashboardCard>

          <DashboardCard 
            title="Jobs Feed vs Index Anomalies" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            expandable={true}
            defaultExpanded={false}
          >
            <JobsAnomalyTable token={token} />
          </DashboardCard>

          <DashboardCard 
            title="Data Processing Anomalies" 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            expandable={true}
            defaultExpanded={true}
          >
            <AnomaliesChart token={token} />
          </DashboardCard>


        </div>
      </div>
    </div>
  );
};

export default OperationsDashboardPage;