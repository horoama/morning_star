import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Yahoo News RSS Endpoints
const RSS_FEEDS: Record<string, string> = {
  top: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml',
  domestic: 'https://news.yahoo.co.jp/rss/topics/domestic.xml',
  world: 'https://news.yahoo.co.jp/rss/topics/world.xml',
  business: 'https://news.yahoo.co.jp/rss/topics/business.xml',
  entertainment: 'https://news.yahoo.co.jp/rss/topics/entertainment.xml',
  sports: 'https://news.yahoo.co.jp/rss/topics/sports.xml',
  it: 'https://news.yahoo.co.jp/rss/topics/it.xml',
  science: 'https://news.yahoo.co.jp/rss/topics/science.xml',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre') || 'top';

  const rssUrl = RSS_FEEDS[genre] || RSS_FEEDS.top;

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);

    // Limit to the latest 5 items
    const items = feed.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet,
    }));

    return NextResponse.json({
      title: feed.title,
      items
    });

  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news data.' },
      { status: 500 }
    );
  }
}
