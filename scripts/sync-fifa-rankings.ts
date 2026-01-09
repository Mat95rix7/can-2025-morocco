// scripts/sync-fifa-rankings.ts
// Système d'actualisation automatique du classement FIFA

import { supabaseBrowser } from "@/lib/supabase/browser";
import { get } from "http";

// URL de l'API FIFA (à adapter selon la vraie API)
const FIFA_API_URL = 'https://api.fifa.com/api/v3/ranking/men';

const getClient = () => supabaseBrowser();

interface FifaApiResponse {
  dateId: string;
  lastUpdate: string;
  rankings: Array<{
    rank: number | null;
    previousRank: number | null;
    name: string;
    countryCode: string;
    points: number;
    previousPoints: number;
    flag: string;
    countryURL: string;
    confederation: string;
  }>;
}

/**
 * Vérifie si une nouvelle version du classement FIFA est disponible
 */
async function checkForNewRanking(): Promise<{ hasUpdate: boolean; data?: FifaApiResponse }> {
  try {
    // Récupérer le dernier dateId stocké
    const { data: currentRanking } = await getClient()
      .from('fifa_world_rankings')
      .select('date_id, last_update')
      .order('last_update', { ascending: false })
      .limit(1)
      .single();

    console.log('📅 Dernier classement enregistré:', currentRanking?.date_id);

    // Option 1: Fetch depuis l'API FIFA (si disponible)
    const response = await fetch(FIFA_API_URL);
    const fifaData: FifaApiResponse = await response.json();

    // Option 2: Lire depuis le fichier local
    // const filePath = path.join(process.cwd(), 'data', 'fifa-rankings.json');
    // const fileContent = await fs.readFile(filePath, 'utf-8');
    // const fifaData: FifaApiResponse = JSON.parse(fileContent);

    // Vérifier si c'est une nouvelle version
    if (currentRanking && currentRanking.date_id === fifaData.dateId) {
      console.log('✅ Le classement est déjà à jour');
      return { hasUpdate: false };
    }

    console.log('🆕 Nouveau classement détecté:', fifaData.dateId);
    return { hasUpdate: true, data: fifaData };

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

/**
 * Met à jour le classement dans Supabase
 */
async function updateRankings(fifaData: FifaApiResponse) {
  try {
    console.log('🔄 Début de la mise à jour...');

    // 1. Archiver l'ancien classement
    const { data: oldRankings } = await getClient()
      .from('fifa_world_rankings')
      .select('country_code, rank, points, date_id, confederation');

    if (oldRankings && oldRankings.length > 0) {
      const historyData = oldRankings.map(old => ({
        country_code: old.country_code,
        rank: old.rank,
        points: old.points,
        date_id: old.date_id,
        confederation: old.confederation,
        snapshot_date: new Date().toISOString()
      }));

      await getClient().from('fifa_ranking_history').insert(historyData);
      console.log('📦 Ancien classement archivé');
    }

    // 2. Supprimer les anciennes données
    await getClient().from('fifa_world_rankings').delete().neq('id', 0);

    // 3. Insérer les nouvelles données
    const newRankings = fifaData.rankings
      .filter(r => r.rank !== null)
      .map(r => ({
        rank: r.rank,
        previous_rank: r.previousRank,
        name: r.name,
        country_code: r.countryCode,
        points: r.points,
        previous_points: r.previousPoints,
        flag_url: r.flag,
        country_url: r.countryURL,
        confederation: r.confederation,
        date_id: fifaData.dateId,
        last_update: new Date(fifaData.lastUpdate).toISOString()
      }));

    const { error } = await getClient()
      .from('fifa_world_rankings')
      .insert(newRankings);

    if (error) throw error;

    // 4. Mettre à jour les équipes CAN
    await getClient().rpc('update_teams_world_rank');

    console.log('✅ Mise à jour terminée avec succès');

    // 5. Envoyer une notification (optionnel)
    await sendUpdateNotification(fifaData.dateId);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  }
}

/**
 * Envoie une notification après mise à jour
 */
async function sendUpdateNotification(dateId: string) {
  // Vous pouvez implémenter :
  // - Email via Resend/SendGrid
  // - Webhook Discord/Slack
  // - Notification push
  
  console.log(`📧 Notification envoyée pour le classement ${dateId}`);
}

/**
 * Fonction principale de synchronisation
 */
async function syncFifaRankings() {
  try {
    console.log('🚀 Vérification du classement FIFA...');
    
    const { hasUpdate, data } = await checkForNewRanking();

    if (hasUpdate && data) {
      await updateRankings(data);
      console.log('✅ Synchronisation terminée');
    } else {
      console.log('ℹ️  Aucune mise à jour nécessaire');
    }

  } catch (error) {
    console.error('❌ Erreur de synchronisation:', error);
    process.exit(1);
  }
}

// Exécuter la synchronisation
syncFifaRankings();

// ===================================
// Configuration Cron Job / GitHub Actions
// ===================================

/*
Pour automatiser l'exécution, créez :

1. GitHub Actions (.github/workflows/sync-fifa.yml) :

name: Sync FIFA Rankings
on:
  schedule:
    - cron: '0 12 * * 4'  # Tous les jeudis à 12h (jour de publication FIFA)
  workflow_dispatch:  # Permet le déclenchement manuel

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run sync-fifa
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}

2. Vercel Cron Jobs (vercel.json) :

{
  "crons": [{
    "path": "/api/cron/sync-fifa",
    "schedule": "0 12 * * 4"
  }]
}

3. API Route pour Vercel (/app/api/cron/sync-fifa/route.ts) :

import { syncFifaRankings } from '@/scripts/sync-fifa-rankings';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    await syncFifaRankings();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
*/