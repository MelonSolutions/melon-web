import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://melon-core.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    const response = await fetch(`${API_BASE_URL}/reports/public/${shareToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Report not found' }));
      return NextResponse.json(
        { message: errorData.message || 'Report not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching public report:', error);
    return NextResponse.json(
      { message: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}