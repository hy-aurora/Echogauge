import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Summarize route is valid.' });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  // Add your summarize logic here
  return NextResponse.json({ received: data });
}
