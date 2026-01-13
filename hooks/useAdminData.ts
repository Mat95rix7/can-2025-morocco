import { matchService } from "@/lib/services/match.service";
import { playerService } from "@/lib/services/player.service";
import { teamService } from "@/lib/services/team.service";
import { Match, Player, Team } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

// ==================== CUSTOM HOOKS ====================
export const useAdminData = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [matchesData, teamsData, playersData] = await Promise.all([
        matchService.getAll(),
        teamService.getAll(),
        playerService.getAll(),
      ]);

      setMatches(matchesData);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { matches, setMatches, teams, setTeams, players, setPlayers, loading, setLoading, error, setError, loadData };
};