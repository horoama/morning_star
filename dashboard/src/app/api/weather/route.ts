import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionCode = searchParams.get('regionCode') || '130000'; // Default: Tokyo

  try {
    const response = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${regionCode}.json`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status}`);
    }

    const data = await response.json();

    // Extract basic information
    // JSON structure: https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json
    // First element contains the short-term forecast
    const timeSeries = data[0].timeSeries;

    // timeSeries[0] has weather descriptions
    const weathers = timeSeries[0].areas[0].weathers;
    const publishingOffice = data[0].publishingOffice;
    const reportDatetime = data[0].reportDatetime;
    const areaName = timeSeries[0].areas[0].area.name;

    // timeSeries[2] has temperatures (might be missing depending on time)
    let temps = [];
    if (timeSeries.length > 2 && timeSeries[2].areas && timeSeries[2].areas.length > 0) {
      temps = timeSeries[2].areas[0].temps || [];
    }

    // timeSeries[1] has POP (probability of precipitation)
    let pops = [];
    if (timeSeries.length > 1 && timeSeries[1].areas && timeSeries[1].areas.length > 0) {
      pops = timeSeries[1].areas[0].pops || [];
    }

    return NextResponse.json({
      area: areaName,
      office: publishingOffice,
      reportDatetime,
      weathers,
      temps,
      pops
    });

  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data.' },
      { status: 500 }
    );
  }
}
