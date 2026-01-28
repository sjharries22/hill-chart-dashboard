import { NextResponse } from 'next/server';
import { fetchClickUpTasks, getMockProjects } from '@/lib/clickup';

export const revalidate = 30; // Cache for 30 seconds

export async function GET() {
  const apiKey = process.env.CLICKUP_API_KEY;
  const listId = process.env.CLICKUP_LIST_ID;

  // Return mock data if no API key configured
  if (!apiKey || !listId) {
    console.log('No ClickUp credentials configured, returning mock data');
    return NextResponse.json({
      projects: getMockProjects(),
      lastUpdated: new Date().toISOString(),
      isMockData: true,
    });
  }

  try {
    const projects = await fetchClickUpTasks(apiKey, listId);
    return NextResponse.json({
      projects,
      lastUpdated: new Date().toISOString(),
      isMockData: false,
    });
  } catch (error) {
    console.error('ClickUp API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ClickUp data', details: String(error) },
      { status: 500 }
    );
  }
}
