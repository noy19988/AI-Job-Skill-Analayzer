import axios from 'axios';

const API_URL = 'http://localhost:5000/api/indexlogs';

export interface IndexLog {
  _id: string;
  country_code: string;
  currency_code: string;
  progress: {
    SWITCH_INDEX: boolean;
    TOTAL_RECORDS_IN_FEED: number;
    TOTAL_JOBS_FAIL_INDEXED: number;
    TOTAL_JOBS_IN_FEED: number;
    TOTAL_JOBS_SENT_TO_ENRICH: number;
    TOTAL_JOBS_DONT_HAVE_METADATA: number;
    TOTAL_JOBS_DONT_HAVE_METADATA_V2: number;
    TOTAL_JOBS_SENT_TO_INDEX: number;
  };
  status: string;
  timestamp: string;
  transactionSourceName: string;
  noCoordinatesCount: number;
  recordCount: number;
  uniqueRefNumberCount: number;
}

export interface IndexLogsResponse {
  data: IndexLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IndexLogsFilters {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  country?: string;
  client?: string;
  startDate?: string;
  endDate?: string;
}



export interface DashboardMetrics {
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


  export interface JobAnomalyData {
    _id: string;
    transactionSourceName: string;
    countryCode: string;
    totalJobsInFeed: number;
    totalJobsSentToIndex: number;
    timestamp: string;
  }


  export interface AnomalyStats {
    name: string;
    percentage: number;
    count: number;
    description: string;
    severity: "high" | "medium" | "low";
  }
  
  export interface AnomaliesStatsResponse {
    totalClients: number;
    healthyClients: number;
    anomalies: AnomalyStats[];
  }

  export interface CriticalAnomaliesClient {
    clientName: string;
    criticalAnomaliesCount: number;
    totalLogs: number;
    criticalAnomaliesPercentage: number;
  }
  
  export interface CriticalAnomaliesStatsResponse {
    totalClients: number;
    clientsWithCriticalAnomalies: CriticalAnomaliesClient[];
  }

export const getIndexLogs = async (filters: IndexLogsFilters, token: string): Promise<IndexLogsResponse> => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Index logs fetch error:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { error: "Unknown error" };
  }
};

export const getClients = async (token: string): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Clients fetch error:", error);
    return ['Deal1', 'Deal2', 'Deal3', 'Deal4', 'Deal5'];
  }
};

export const getCountries = async (token: string): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/countries`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Countries fetch error:", error);
    return ['US', 'CA', 'UK', 'DE', 'FR', 'AU', 'JP', 'BR', 'IN', 'CN'];
  }
};


export const getDashboardMetrics = async (token: string): Promise<DashboardMetrics> => {
    try {
      const response = await axios.get(`${API_URL}/dashboard-metrics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Dashboard metrics fetch error:", error);
      throw error;
    }
  };


  export const getJobsAnomalies = async (token: string): Promise<JobAnomalyData[]> => {
    try {
      const response = await axios.get(`${API_URL}/jobs-anomalies`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Jobs anomalies fetch error:", error);
      throw error;
    }
  };


  export const getAnomaliesStats = async (token: string): Promise<AnomaliesStatsResponse> => {
    try {
      const response = await axios.get(`${API_URL}/anomalies-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Anomalies stats fetch error:", error);
      throw error;
    }
  };



export const getCriticalAnomaliesStats = async (token: string): Promise<CriticalAnomaliesStatsResponse> => {
    try {
      const response = await axios.get(`${API_URL}/critical-anomalies-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Critical anomalies stats fetch error:", error);
      throw error;
    }
  };