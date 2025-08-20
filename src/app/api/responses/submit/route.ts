import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://melon-core.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Forward the request to your backend
    const response = await fetch(`${API_BASE_URL}/responses/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
        'user-agent': userAgent,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to submit response' }));
      return NextResponse.json(
        { message: errorData.message || 'Failed to submit response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { message: 'Failed to submit response' },
      { status: 500 }
    );
  }
}