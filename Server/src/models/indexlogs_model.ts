import mongoose, { Schema } from 'mongoose';

interface Progress {
  SWITCH_INDEX: boolean;
  TOTAL_RECORDS_IN_FEED: number;
  TOTAL_JOBS_FAIL_INDEXED: number;
  TOTAL_JOBS_IN_FEED: number;
  TOTAL_JOBS_SENT_TO_ENRICH: number;
  TOTAL_JOBS_DONT_HAVE_METADATA: number;
  TOTAL_JOBS_DONT_HAVE_METADATA_V2: number;
  TOTAL_JOBS_SENT_TO_INDEX: number;
}

export interface IndexLog {
  _id?: string; 
  country_code: string;
  currency_code: string;
  progress: Progress;
  status: string;
  timestamp: Date;
  transactionSourceName: string;
  noCoordinatesCount: number;
  recordCount: number;
  uniqueRefNumberCount: number;
}


const ProgressSchema = new Schema<Progress>(
  {
    SWITCH_INDEX: { type: Boolean, required: true },
    TOTAL_RECORDS_IN_FEED: { type: Number, required: true },
    TOTAL_JOBS_FAIL_INDEXED: { type: Number, required: true },
    TOTAL_JOBS_IN_FEED: { type: Number, required: true },
    TOTAL_JOBS_SENT_TO_ENRICH: { type: Number, required: true },
    TOTAL_JOBS_DONT_HAVE_METADATA: { type: Number, required: true },
    TOTAL_JOBS_DONT_HAVE_METADATA_V2: { type: Number, required: true },
    TOTAL_JOBS_SENT_TO_INDEX: { type: Number, required: true },
  },
  { 
    _id: false,  
    strict: true 
  } 
);


const IndexLogSchema = new Schema<IndexLog>({
  country_code: { type: String, required: true },
  currency_code: { type: String, required: true },
  progress: { type: ProgressSchema, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, required: true },
  transactionSourceName: { type: String, required: true },
  noCoordinatesCount: { type: Number, required: true },
  recordCount: { type: Number, required: true },
  uniqueRefNumberCount: { type: Number, required: true },
});

const IndexLogModel = mongoose.model('IndexLog', IndexLogSchema);
export default IndexLogModel;
