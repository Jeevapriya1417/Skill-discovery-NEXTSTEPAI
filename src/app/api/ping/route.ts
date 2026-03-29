import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    message: 'API Router is now correctly mapped.'
  });
}
