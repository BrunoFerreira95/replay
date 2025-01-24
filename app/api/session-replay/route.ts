import { NextRequest, NextResponse } from 'next/server';
import { insertEvent, getEventsById, getAllSessions } from '../../../utils/sqlite'; // Correct import


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { events } = body;

    for (const event of events) {
      await insertEvent(event);
    }

    return NextResponse.json({ message: 'Events saved successfully!' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error saving events:', error);
    return NextResponse.json(
      { message: 'Failed to save events.', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const events = await getEventsById(id);  // call the function, instead of using the object
        return NextResponse.json({ events });
    } else {
      const sessions = await getAllSessions();
      return NextResponse.json(sessions);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch data', error: error.message },
      { status: 500 }
    );
  }
}