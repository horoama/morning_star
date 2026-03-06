import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weather, transit, news } = body;

    // Use environment variable for Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Format the inputs for the prompt
    const weatherInfo = weather ? `天気情報: ${weather.area} - ${weather.weathers ? weather.weathers[0] : 'データなし'}` : '天気情報なし';
    const transitInfo = transit ? `交通情報: ${transit.lineName || '路線不明'} - ${transit.status} (${transit.detail})` : '交通情報なし';
    const newsInfo = news?.items ? `ニュース (最新${news.items.length}件):\n${news.items.map((n: { title: string }) => `- ${n.title}`).join('\n')}` : 'ニュースなし';

    const prompt = `あなたは親切で有能なパーソナルアシスタントです。以下の天気、交通、ニュースの情報をもとに、本日の「今日のレポート（全体の要約）」を作成してください。
文体は丁寧で読みやすく、要点を絞って伝えてください。見出しは使わず、全体で3〜4文程度の短いパラグラフにまとめてください。

【情報元】
${weatherInfo}

${transitInfo}

${newsInfo}

それでは、今日のレポートを作成してください。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });

  } catch (error) {
    console.error('Summary API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary.' },
      { status: 500 }
    );
  }
}
