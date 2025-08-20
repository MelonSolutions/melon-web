import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { recipients, personalMessage } = await request.json();

  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");

    console.log("Auth Header:", authHeader);
  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backendResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "https://melon-core.onrender.com"}/reports/${id}/share-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        recipients,
        personalMessage,
      }),
    }
  );

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: data.message || "Failed to share report" },
      { status: backendResponse.status }
    );
  }

  return NextResponse.json(data);
}
