import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Default URL format for Yahoo Transit (e.g., Yamanote Line)
  const transitUrl = searchParams.get('url') || 'https://transit.yahoo.co.jp/diainfo/21/0';

  // Basic SSRF protection: only allow Yahoo Transit URLs
  if (!transitUrl.startsWith('https://transit.yahoo.co.jp/')) {
    return NextResponse.json(
      { error: 'Invalid URL. Only transit.yahoo.co.jp is allowed.' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(transitUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const $ = cheerio.load(response.data);

    // Scrape Yahoo Transit info. Usually, there's a title and a status description.
    // .titleAndButtonContainer h1 = Line Name
    const lineName = $('h1.title').text().trim() || '不明な路線';

    // .trouble p or dd gives the detail
    // .icnNormal = "平常運転", .icnAlert = "遅延" etc.
    let status = '情報取得失敗';
    let detail = '';

    const normalIco = $('.icnNormal');
    const alertIco = $('.icnAlert');
    const suspendIco = $('.icnSuspend');

    if (normalIco.length > 0) {
      status = '平常運転';
      detail = '現在、平常どおり運転しています。';
    } else if (alertIco.length > 0) {
      status = '遅延等の発生';
      detail = $('#mdServiceStatus dd').text().trim() || 'ダイヤに乱れが発生しています。';
    } else if (suspendIco.length > 0) {
      status = '運転見合わせ';
      detail = $('#mdServiceStatus dd').text().trim() || '運転を見合わせています。';
    } else {
      // Fallback scraping
      const infoBox = $('.trouble');
      if (infoBox.length > 0) {
         status = infoBox.find('dt').text().trim() || '遅延・障害';
         detail = infoBox.find('dd').text().trim();
      } else {
         const altInfo = $('#mdServiceStatus dd').text().trim();
         if(altInfo) {
           status = '情報あり';
           detail = altInfo;
         }
      }
    }

    return NextResponse.json({
      lineName,
      status,
      detail,
      url: transitUrl
    });

  } catch (error) {
    console.error('Transit API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transit data.' },
      { status: 500 }
    );
  }
}
