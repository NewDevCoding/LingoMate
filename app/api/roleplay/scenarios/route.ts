import { NextResponse } from 'next/server';
import { getScenarios } from '@/features/speak/roleplay/roleplay.service';

export async function GET() {
  try {
    const scenarios = await getScenarios();
    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}
