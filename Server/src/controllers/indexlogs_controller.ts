import { Request, Response } from "express";
import IndexLogModel from "../models/indexlogs_model";

export const getIndexLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "timestamp",
      sortOrder = "desc",
      country,
      client,
      startDate,
      endDate
    } = req.query as Record<string, string>;

    const filters: any = {};

    if (country) filters.country_code = country;
    if (client) filters.transactionSourceName = client;
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortField]: sortOrder === "asc" ? 1 : -1
    };

    const logs = await IndexLogModel.find(filters)
      .sort(sortOptions)
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const total = await IndexLogModel.countDocuments(filters);

    res.status(200).json({
      data: logs,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit)
    });
  } catch (error) {
    console.error("Error fetching index logs:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
      const thisWeekData = await IndexLogModel.find({
        timestamp: { $gte: weekAgo, $lte: now }
      });
  
      const lastWeekData = await IndexLogModel.find({
        timestamp: { $gte: twoWeeksAgo, $lt: weekAgo }
      });
  
      const calculateMetrics = (data: any[]) => {
        const totalRecords = data.reduce((sum, log) => sum + log.progress.TOTAL_RECORDS_IN_FEED, 0);
        const totalJobsInFeed = data.reduce((sum, log) => sum + log.progress.TOTAL_JOBS_IN_FEED, 0);
        const totalJobsSentToIndex = data.reduce((sum, log) => sum + log.progress.TOTAL_JOBS_SENT_TO_INDEX, 0);
        const totalFailedJobs = data.reduce((sum, log) => sum + log.progress.TOTAL_JOBS_FAIL_INDEXED, 0);
        
        const actualSuccessfulJobs = totalJobsSentToIndex - totalFailedJobs;
        
        const successRate = totalJobsInFeed > 0 ? (actualSuccessfulJobs / totalJobsInFeed) * 100 : 0;
  
        return {
          totalRecords,
          totalJobsSentToIndex,
          totalSuccessedIndexing: actualSuccessfulJobs, 
          totalFailedJobs,
          successRate
        };
      };
  
      const thisWeekMetrics = calculateMetrics(thisWeekData);
      const lastWeekMetrics = calculateMetrics(lastWeekData);
  
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
  
      const metrics = {
        totalRecords: {
          current: thisWeekMetrics.totalRecords,
          change: calculateChange(thisWeekMetrics.totalRecords, lastWeekMetrics.totalRecords)
        },
        totalJobsSentToIndex: {  
          current: thisWeekMetrics.totalJobsSentToIndex,
          change: calculateChange(thisWeekMetrics.totalJobsSentToIndex, lastWeekMetrics.totalJobsSentToIndex)
        },
        totalSuccessedIndexing: {
          current: thisWeekMetrics.totalSuccessedIndexing,
          change: calculateChange(thisWeekMetrics.totalSuccessedIndexing, lastWeekMetrics.totalSuccessedIndexing)
        },
        successRate: {
          current: thisWeekMetrics.successRate,
          change: calculateChange(thisWeekMetrics.successRate, lastWeekMetrics.successRate)
        },
        failedJobs: {
          current: thisWeekMetrics.totalFailedJobs,
          change: calculateChange(thisWeekMetrics.totalFailedJobs, lastWeekMetrics.totalFailedJobs)
        }
      };


      res.status(200).json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


  export const getJobsAnomalies = async (req: Request, res: Response) => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const logs = await IndexLogModel.find({
        timestamp: { $gte: weekAgo },
        status: "completed"
      })
        .sort({ timestamp: -1 })
        .select({
          _id: 1,
          transactionSourceName: 1,
          country_code: 1,
          timestamp: 1,
          "progress.TOTAL_JOBS_IN_FEED": 1,
          "progress.TOTAL_JOBS_SENT_TO_INDEX": 1
        });
  
      const anomaliesData = logs.map(log => ({
        _id: log._id,
        transactionSourceName: log.transactionSourceName,
        countryCode: log.country_code,
        totalJobsInFeed: log.progress.TOTAL_JOBS_IN_FEED,
        totalJobsSentToIndex: log.progress.TOTAL_JOBS_SENT_TO_INDEX,
        timestamp: log.timestamp
      }));
  
      const sortedAnomalies = anomaliesData.sort((a, b) => {
        const aIsAnomaly = a.totalJobsSentToIndex > a.totalJobsInFeed;
        const bIsAnomaly = b.totalJobsSentToIndex > b.totalJobsInFeed;
        
        if (aIsAnomaly && !bIsAnomaly) return -1;
        if (!aIsAnomaly && bIsAnomaly) return 1;
        
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  
      res.status(200).json(sortedAnomalies);
    } catch (error) {
      console.error("Error fetching jobs anomalies:", error);
      res.status(500).json({ message: "Server error" });
    }
  };



  export const getAnomaliesStats = async (req: Request, res: Response) => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const logs = await IndexLogModel.find({
        timestamp: { $gte: weekAgo },
        status: "completed"
      }).select({
        transactionSourceName: 1,
        "progress.TOTAL_RECORDS_IN_FEED": 1,
        "progress.TOTAL_JOBS_IN_FEED": 1,
        "progress.TOTAL_JOBS_SENT_TO_INDEX": 1,
        "progress.TOTAL_JOBS_SENT_TO_ENRICH": 1,
        "progress.TOTAL_JOBS_DONT_HAVE_METADATA": 1,
        "progress.TOTAL_JOBS_FAIL_INDEXED": 1,
        recordCount: 1
      });
  
      const totalClients = logs.length;
      const anomalies = {
        indexOverflow: 0,
        metadataLogicError: 0,
        feedProcessingFailure: 0,
        indexingMathError: 0,
        zeroProcessingAnomaly: 0,
        recordCountMismatch: 0
      };
  
      logs.forEach(log => {
        const progress = log.progress;
        
        if (progress.TOTAL_JOBS_SENT_TO_INDEX > progress.TOTAL_JOBS_IN_FEED) {
          anomalies.indexOverflow++;
        }
        
        if (progress.TOTAL_JOBS_DONT_HAVE_METADATA > progress.TOTAL_JOBS_SENT_TO_ENRICH) {
          anomalies.metadataLogicError++;
        }
        
        if (progress.TOTAL_JOBS_IN_FEED > progress.TOTAL_RECORDS_IN_FEED) {
          anomalies.feedProcessingFailure++;
        }
        
        const totalProcessed = progress.TOTAL_JOBS_SENT_TO_INDEX + progress.TOTAL_JOBS_FAIL_INDEXED;
        if (totalProcessed > progress.TOTAL_JOBS_IN_FEED && progress.TOTAL_JOBS_IN_FEED > 0) {
          anomalies.indexingMathError++;
        }
        
        if (progress.TOTAL_JOBS_IN_FEED === 0 && progress.TOTAL_RECORDS_IN_FEED > 0) {
          anomalies.zeroProcessingAnomaly++;
        }
        
        if (log.recordCount > progress.TOTAL_JOBS_SENT_TO_INDEX * 1.5) {
          anomalies.recordCountMismatch++;
        }
      });
  
      const stats = [
        {
          name: "Index Overflow",
          percentage: totalClients > 0 ? (anomalies.indexOverflow / totalClients) * 100 : 0,
          count: anomalies.indexOverflow,
          description: "Jobs sent to index > Jobs in feed",
          severity: "high"
        },
        {
          name: "Metadata Logic Error",
          percentage: totalClients > 0 ? (anomalies.metadataLogicError / totalClients) * 100 : 0,
          count: anomalies.metadataLogicError,
          description: "Jobs without metadata > Jobs sent to enrich",
          severity: "medium"
        },
        {
          name: "Feed Processing Failure",
          percentage: totalClients > 0 ? (anomalies.feedProcessingFailure / totalClients) * 100 : 0,
          count: anomalies.feedProcessingFailure,
          description: "Jobs in feed > Total records in feed",
          severity: "high"
        },
        {
          name: "Indexing Math Error",
          percentage: totalClients > 0 ? (anomalies.indexingMathError / totalClients) * 100 : 0,
          count: anomalies.indexingMathError,
          description: "Processed jobs count doesn't match feed",
          severity: "medium"
        },
        {
          name: "Zero Processing Anomaly",
          percentage: totalClients > 0 ? (anomalies.zeroProcessingAnomaly / totalClients) * 100 : 0,
          count: anomalies.zeroProcessingAnomaly,
          description: "Records exist but no jobs processed",
          severity: "high"
        },
        {
          name: "Record Count Mismatch",
          percentage: totalClients > 0 ? (anomalies.recordCountMismatch / totalClients) * 100 : 0,
          count: anomalies.recordCountMismatch,
          description: "Record count significantly higher than indexed",
          severity: "low"
        }
      ] as const;
  
      res.status(200).json({
        totalClients,
        anomalies: stats
      });
    } catch (error) {
      console.error("Error fetching anomalies stats:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


  export const getClients = async (req: Request, res: Response) => {
    try {
      const clients = await IndexLogModel.distinct('transactionSourceName');
      res.status(200).json(clients);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  };



export const getCountries = async (req: Request, res: Response) => {
    try {
      const countries = await IndexLogModel.distinct('country_code');
      res.status(200).json(countries);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  };


