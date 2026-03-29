import connectDB from './src/lib/mongodb.js'; // Note: I might need to adjust imports for a standalone script
import InterviewSession from './src/models/InterviewSession.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function verifyBulkFlow() {
  console.log('--- Verifying Bulk Evaluation Flow ---');
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI missing');
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Create a dummy session with transcripts but NO content scores
    const dummySession = new InterviewSession({
      userId: new mongoose.Types.ObjectId(), // Random ID
      domain: 'Cloud Architect',
      status: 'in-progress',
      currentSection: 4,
      section1: {
        transcript: "I am a cloud engineer with 5 years of experience in AWS and Azure. I love building scalable systems.",
        vocalMetrics: { score: 85, fillerWordCount: { total: 2 }, speakingPace: { wordsPerMinute: 140 } },
        score: 85
      },
      section2: [
        { 
          question: "What is the difference between S3 and EBS?", 
          transcript: "S3 is object storage for the web, while EBS is block storage for EC2 instances. S3 is highly durable and cost-effective for large files.",
          vocalMetrics: { fillerWordCount: { total: 1 }, speakingPace: { wordsPerMinute: 150 } }
        },
        { 
          question: "Explain the Shared Responsibility Model.", 
          transcript: "AWS is responsible for security 'of' the cloud (hardware, regions), while the customer is responsible for security 'in' the cloud (data, IAM, OS).",
          vocalMetrics: { fillerWordCount: { total: 0 }, speakingPace: { wordsPerMinute: 130 } }
        }
      ],
      section3: {
        sectionType: '3B',
        questions: [
          {
            question: "How would you handle a sudden traffic spike in a production environment?",
            transcript: "I would use Auto Scaling to add more instances, along with a Load Balancer to distribute traffic. I'd also check if caching could offload some DB pressure.",
            vocalMetrics: { fillerWordCount: { total: 2 }, speakingPace: { wordsPerMinute: 145 } }
          }
        ]
      },
      section4: {
        topic: "Future of Serverless",
        transcript: "Serverless will continue to grow because it removes the operational burden. It's great for event-driven apps but has cold start challenges.",
        vocalMetrics: { score: 90, fillerWordCount: { total: 1 }, speakingPace: { wordsPerMinute: 155 } },
        score: 90
      }
    });

    await dummySession.save();
    console.log('Created dummy session:', dummySession._id);

    // 2. We can't easily call the API route directly from this script due to Next.js environment
    // So we'll point the user to test it via the UI or I'll try to trigger the logic manually if I had access to the lib
    // Actually, I'll just check if the model is valid.
    
    console.log('SUCCESS: Dummy data prepared. Now the user can trigger the /api/interview/feedback via UI or Postman.');
    console.log(`Session ID to test: ${dummySession._id}`);
    
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

verifyBulkFlow();
