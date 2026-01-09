import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const rankingsPath = path.join(process.cwd(), 'data', 'rankings.json');

// Fonction pour charger un fichier JSON de manière sûre
function loadJSON(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Erreur lecture ${filePath}:`, err);
  }
  return null;
}

// Fonction pour récupérer le dateId le plus récent
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
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    
    if (!nextDataMatch) return null;

    const nextData = JSON.parse(nextDataMatch[1]);
    const datesByYear = nextData.props.pageProps.pageData.ranking.dates;
    
    if (!datesByYear || datesByYear.length === 0) return null;
    
    // Trier par année décroissante pour garantir qu'on a la plus récente
    // (normalement déjà trié, mais par sécurité)
    datesByYear.sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year));
    
    // Prendre l'année la plus récente
    const latestYear = datesByYear[0];
    
    if (!latestYear.dates || latestYear.dates.length === 0) return null;
    
    // Dans cette année, prendre la date la plus récente (premier élément)
    const latestDateId = latestYear.dates[0].id;
    
    console.log(`📅 DateId le plus récent: ${latestDateId} (${latestYear.dates[0].dateText} ${latestYear.year})`);
    
    return latestDateId;
  } catch (err) {
    console.error('Erreur lors de la récupération du dateId:', err);
    return null;
  }
}
export async function GET() {
  try {
    // Charger les données locales
    const cachedData = loadJSON(rankingsPath);

    // 1. Récupérer le dateId le plus récent
    const latestDateId = await getLatestDateId();
    
    if (!latestDateId) {
      console.error('❌ Impossible de récupérer le dateId');
      if (cachedData) return NextResponse.json(cachedData);
      return NextResponse.json({ error: 'Impossible de récupérer le dateId' }, { status: 500 });
    }

    console.log(`📅 DateId récupéré: ${latestDateId}`);

    // 2. Vérifier si le classement local est déjà à jour
    if (cachedData?.dateId === latestDateId) {
      console.log('✅ Classement déjà à jour');
      return NextResponse.json(cachedData);
    }

    // 3. Récupérer le nouveau classement
    const response = await fetch(`https://inside.fifa.com/api/ranking-overview?locale=en&dateId=${latestDateId}&rankingType=football`);
    
    if (!response.ok) {
      if (cachedData) return NextResponse.json(cachedData);
      return NextResponse.json({ error: 'Impossible de récupérer les données FIFA' }, { status: 500 });
    }

    const data = await response.json();
    
    console.log('📊 Nouveau classement FIFA détecté, mise à jour...');

    // 4. Mapper les données (previousRank est déjà fourni par l'API)
    const rankings = data.rankings.map((item: any) => ({
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

    const newData = { 
      dateId: latestDateId,
      lastUpdate: data.rankings[0]?.lastUpdateDate || new Date().toISOString(),
      nextUpdate: data.rankings[0]?.nextUpdateDate,
      rankings
    };

    // 5. Sauvegarder dans un seul fichier
    fs.writeFileSync(rankingsPath, JSON.stringify(newData, null, 2), 'utf-8');
    console.log('💾 Classement sauvegardé');

    return NextResponse.json(newData);
  } catch (err) {
    console.error('❌ Erreur serveur:', err);
    
    // Fallback : renvoyer les données locales si disponibles
    const cachedData = loadJSON(rankingsPath);
    if (cachedData) return NextResponse.json(cachedData);
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}