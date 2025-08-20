import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { recipients, personalMessage } = await request.json();
    
    const authHeader = request.headers.get('authorization');
    
    console.log('Auth Header:', authHeader);
    
    if (!authHeader || authHeader === 'Bearer null') {
      return NextResponse.json({ 
        message: 'Authentication required. Please log in again.' 
      }, { status: 401 });
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com'}/reports/${id}/share-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          recipients,
          personalMessage,
        }),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { message: data.message || 'Failed to share report' },
        { status: backendResponse.status }
      );
    }

    console.log('Success:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in share-email API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}