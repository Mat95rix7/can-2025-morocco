import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/* =========================
   Paths
========================= */

const rankingsPath = path.join(process.cwd(), 'public', 'rankings.json');

/* =========================
   Types FIFA (partiels)
========================= */

interface RankingDateItem {
  id: string;
  iso: string;
  dateText: string;
  matchWindowEndDate: string;
}

interface YearGroup {
  year: string;
  dates: RankingDateItem[];
}

interface FifaRankingItem {
  rankingItem: {
    rank: number;
    previousRank: number | null;
    name: string;
    countryCode: string;
    totalPoints: number;
    flag: {
      src: string;
    };
    countryURL: string;
  };
  previousPoints: number | null;
  tag: {
    text: string;
  };
  lastUpdateDate?: string;
  nextUpdateDate?: string;
}

interface FifaRankingResponse {
  rankings: FifaRankingItem[];
}

interface LocalRankingData {
  dateId: string;
  lastUpdate: string;
  nextUpdate?: string;
  rankings: {
    rank: number;
    previousRank: number | null;
    name: string;
    countryCode: string;
    points: number;
    previousPoints: number | null;
    flag: string;
    countryURL: string;
    confederation: string;
  }[];
}

/* =========================
   Utils
========================= */

function loadJSON<T>(filePath: string): T | null {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch (err) {
    console.error(`Erreur lecture ${filePath}:`, err);
  }
  return null;
}

/* =========================
   Get latest dateId
========================= */

async function getLatestDateId(): Promise<string | null> {
  try {
    const response = await fetch('https://www.fifa.com/fifa-world-ranking/men', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
    );

    if (!match) return null;

    const nextData = JSON.parse(match[1]);
    const datesByYear: YearGroup[] =
      nextData?.props?.pageProps?.pageData?.ranking?.dates;

    if (!Array.isArray(datesByYear) || datesByYear.length === 0) return null;

    datesByYear.sort(
      (a, b) => parseInt(b.year, 10) - parseInt(a.year, 10)
    );

    const latestYear = datesByYear[0];
    if (!latestYear.dates.length) return null;

    const latestDateId = latestYear.dates[0].id;

    console.log(`📅 DateId le plus récent: ${latestDateId} (${latestYear.dates[0].dateText} ${latestYear.year})`);

    return latestYear.dates[0].id;
  } catch (err) {
    console.error('Erreur récupération dateId:', err);
    return null;
  }
}

/* =========================
   Route GET
========================= */

export async function GET() {
  try {
    const cachedData = loadJSON<LocalRankingData>(rankingsPath);

    const latestDateId = await getLatestDateId();
    if (!latestDateId) {
      console.error('❌ Impossible de récupérer le dateId');
      if (cachedData) return NextResponse.json(cachedData);
      return NextResponse.json(
        { error: 'Impossible de récupérer le dateId' },
        { status: 500 }
      );
    }

    console.log(`📅 DateId récupéré: ${latestDateId}`);

    // Déjà à jour
    if (cachedData?.dateId === latestDateId) {
      console.log('✅ Classement déjà à jour');
      return NextResponse.json(cachedData);
    }

    const response = await fetch(
      `https://inside.fifa.com/api/ranking-overview?locale=en&dateId=${latestDateId}&rankingType=football`
    );

    if (!response.ok) {
      if (cachedData) return NextResponse.json(cachedData);
      return NextResponse.json(
        { error: 'Impossible de récupérer les données FIFA' },
        { status: 500 }
      );
    }

    const data: FifaRankingResponse = await response.json();

    console.log('📊 Nouveau classement FIFA détecté, mise à jour...');

    const rankings = data.rankings.map((item) => ({
      rank: item.rankingItem.rank,
      previousRank: item.rankingItem.previousRank,
      name: item.rankingItem.name,
      countryCode: item.rankingItem.countryCode,
      points: item.rankingItem.totalPoints,
      previousPoints: item.previousPoints,
      flag: item.rankingItem.flag.src,
      countryURL: `https://inside.fifa.com${item.rankingItem.countryURL}`,
      confederation: item.tag.text
    }));

    const newData: LocalRankingData = {
      dateId: latestDateId,
      lastUpdate:
        data.rankings[0]?.lastUpdateDate ?? new Date().toISOString(),
      nextUpdate: data.rankings[0]?.nextUpdateDate,
      rankings
    };

    fs.writeFileSync(
      rankingsPath,
      JSON.stringify(newData, null, 2),
      'utf-8'
    );
    console.log('💾 Classement sauvegardé');

    return NextResponse.json(newData);
  } catch (err) {
    console.error('Erreur serveur:', err);

    const cachedData = loadJSON<LocalRankingData>(rankingsPath);
    if (cachedData) return NextResponse.json(cachedData);

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
