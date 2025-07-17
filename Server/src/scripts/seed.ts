import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import IndexLog, { IndexLog as IndexLogType } from '../models/indexlogs_model';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

type CleanIndexLog = IndexLogType & {
  _id?: string;
  progress: IndexLogType['progress'] & { _id?: string };
};

async function seed() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION as string);

    const rawData = fs.readFileSync(path.resolve(__dirname, 'transformedFeeds.json'), 'utf-8');
    const jsonData: CleanIndexLog[] = JSON.parse(rawData);

    const cleanedData = jsonData.map((doc) => {
      const cleanedDoc = { ...doc };
      
      delete cleanedDoc._id;

      if (cleanedDoc.progress && typeof cleanedDoc.progress === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...progressWithoutId } = cleanedDoc.progress as IndexLogType['progress'] & { _id?: string };
        cleanedDoc.progress = progressWithoutId;
      }

      return cleanedDoc;
    });


    await IndexLog.deleteMany({});
    await IndexLog.insertMany(cleanedData);

    console.log(`Inserted ${cleanedData.length} cleaned records`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();