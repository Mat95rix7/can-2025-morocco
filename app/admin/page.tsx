
'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogOverlay } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, MapPin, Save, X, Users, Trophy, UserCircle, Building2, Search, ArrowLeft, LogOut } from 'lucide-react';

import { matchService } from '@/lib/services/match.service';
import { teamService } from '@/lib/services/team.service';
import { playerService } from '@/lib/services/player.service';

import { Team, Player } from '@/types/types';
import { OFFICIAL_STADIUMS, TABS } from '@/types/constants';
import { SearchFilterBar } from '@/components/admin/SearchFilter';
import { MatchCard } from '@/components/admin/MatchCard';
import { MatchFormFields } from '@/components/admin/MatchFormFields';
import { TeamFormFields } from '@/components/admin/TeamFormField';
import { PlayerFormFields } from '@/components/admin/PlayerFormField';

// ==================== COMPONENTS ====================

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
      <p className="text-lg font-medium text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

// Error Alert Component
const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
    <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
  </div>
);

// Empty State Component
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <Card className="border-0 shadow-xl">
    <CardContent className="py-16 text-center">
      {icon}
      <p className="text-lg font-medium text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </CardContent>
  </Card>
);

// Team Card Component
const TeamCard: React.FC<{
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
  onClick: (team: Team) => void;
  playerCount: number;
}> = ({ team, onEdit, onDelete, onClick, playerCount }) => (
  <Card 
    className="bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
    onClick={() => onClick(team)}
  >
    <CardContent className="pt-6">
      <div className="flex items-start justify-between gap-4">
        {/* Section gauche : Info équipe */}
        <div className="flex items-start gap-3 flex-1">
          <div className="text-4xl shrink-0">
            {team.flag_url ? (
              <img src={team.flag_url} alt={team.name} className="w-12 h-8 object-cover rounded" />
            ) : '🏳️'}
          </div>
          <div className="space-y-2">
            <div>
              <h3 className="font-bold">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{team.code}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {team.fifa_rank_before && <Badge variant="outline">Rang: {team.fifa_rank_before}</Badge>}
              {team.fifa_points_before && <Badge variant="outline">Points: {team.fifa_points_before}</Badge>}
            </div>
          </div>
        </div>

        {/* Section droite : Groupe et actions */}
        <div className="flex flex-col items-end gap-3">
          {team.group_name && <Badge variant="outline">{team.group_name}</Badge>}
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            {playerCount} joueurs
          </Badge>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onEdit(team); }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onDelete(team.id); }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Player Card Component
const PlayerCard: React.FC<{
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}> = ({ player, onEdit, onDelete }) => (
  <Card className="bg-slate-900">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl font-bold">
            {player.number || '?'}
          </div>
          <div>
            <h3 className="font-bold">{player.name}</h3>
            <p className="text-sm text-muted-foreground">{player.team?.name || 'Sans équipe'}</p>
            {player.position && <Badge variant="outline" className="mt-1">{player.position}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(player)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(player.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Stadium Card Component
const StadiumCard: React.FC<{ stadium: typeof OFFICIAL_STADIUMS[0] }> = ({ stadium }) => (
  <Card className="bg-slate-900 hover:bg-slate-800 transition-all duration-300 overflow-hidden group border border-slate-700">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        {/* Icône du stade */}
        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        
        {/* Informations */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-2 truncate">{stadium.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{stadium.city}</span>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Users className="w-3 h-3" />
            {stadium.capacity.toLocaleString()} places
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

const useFilters = () => {
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  return { search, setSearch, filterPhase, setFilterPhase, filterStatus, setFilterStatus };
};

// ==================== MAIN COMPONENT ====================
export default function AdminPage() {
  const [tab, setTab] = useState('matches');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { matches, setMatches, teams, setTeams, players, setPlayers, loading, setLoading, error, setError } = useAdminData();
  const { search, setSearch, filterPhase, setFilterPhase, filterStatus, setFilterStatus } = useFilters();

  // Filtrage mémorisé
  const filteredData = useMemo(() => ({
    matches: matches.filter(m => {
      const matchSearch =
        m.home_team?.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.away_team?.name?.toLowerCase().includes(search.toLowerCase());
      const matchPhase = filterPhase === 'all' || m.phase === filterPhase;
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchPhase && matchStatus;
    }),
    teams: teams.filter(t =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.code?.toLowerCase().includes(search.toLowerCase())
    ),
    players: players.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.team?.name?.toLowerCase().includes(search.toLowerCase())
    ),
    stadiums: OFFICIAL_STADIUMS.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
    )
  }), [matches, teams, players, search, filterPhase, filterStatus]);

  const teamsByGroup = useMemo(() => {
    const grouped = filteredData.teams.reduce<Record<string, typeof filteredData.teams>>((acc, team) => {
      const group = team.group_name ?? "Sans groupe";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(team);
      return acc;
    }, {});

    Object.values(grouped).forEach(teams => {
      teams.sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [filteredData.teams]);

  const getPlayersByTeam = useCallback((teamId: string) => {
    return players.filter(p => p.team_id === teamId);
  }, [players]);

  const groupPlayersByPosition = useCallback((players: Player[]) => {
    // Mapping des positions courtes vers les noms complets
    const positionNames: Record<string, string> = {
      'GK': 'Gardien',
      'DF': 'Défenseur',
      'MF': 'Milieu',
      'FW': 'Attaquant',
    };
    
    const positionOrder = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Sans poste'];
    
    const grouped = players.reduce((acc, player) => {
      const rawPosition = player.position || 'Sans poste';
      // Normaliser le nom de la position
      const position = positionNames[rawPosition] || rawPosition;
      if (!acc[position]) acc[position] = [];
      acc[position].push(player);
      return acc;
    }, {} as Record<string, Player[]>);

    return Object.entries(grouped).sort(
      ([a], [b]) => positionOrder.indexOf(a) - positionOrder.indexOf(b)
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (tab === 'matches') {
        const data = {
          home_team_id: form.home_team_id || null,
          away_team_id: form.away_team_id || null,
          home_score: form.home_score || 0,
          away_score: form.away_score || 0,
          match_date: form.match_date,
          phase: form.phase || 'group',
          stadium: form.stadium || null,
          status: form.status || 'scheduled',
          group_name: form.group_name || null
        };
        
        if (editing) {
          await matchService.update(editing.id, data);
        } else {
          await matchService.create(data);
        }
        const updatedMatches = await matchService.getAll();
        setMatches(updatedMatches);
      } else if (tab === 'teams') {
        const data = {
          name: form.name,
          code: form.code,
          flag_url: form.flag_url || null,
          group_name: form.group_name || null,
          fifa_points_before: form.fifa_points_before,
          fifa_rank_before: form.fifa_rank_before || null,
        };
        
        if (editing) {
          await teamService.update(editing.id, data);
        } else {
          await teamService.create(data);
        }
        const updatedTeams = await teamService.getAll();
        setTeams(updatedTeams);
      } else if (tab === 'players') {
        const data = {
          name: form.name,
          team_id: form.team_id || null,
          position: form.position || null,
          number: form.number || null
        };
        
        if (editing) {
          await playerService.update(editing.id, data);
        } else {
          await playerService.create(data);
        }
        const updatedPlayers = await playerService.getAll();
        setPlayers(updatedPlayers);
      }

      closeDialog();
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [tab, form, editing, setLoading, setError, setMatches, setTeams, setPlayers]);

  const handleDelete = useCallback(async () => {
    if (!deleting) return;

    setLoading(true);
    setError('');

    try {
      if (tab === 'matches') {
        await matchService.delete(deleting);
        const updatedMatches = await matchService.getAll();
        setMatches(updatedMatches);
      } else if (tab === 'teams') {
        await teamService.delete(deleting);
        const updatedTeams = await teamService.getAll();
        setTeams(updatedTeams);
      } else if (tab === 'players') {
        await playerService.delete(deleting);
        const updatedPlayers = await playerService.getAll();
        setPlayers(updatedPlayers);
      }

      setDeleteOpen(false);
      setDeleting(null);
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      setError('Erreur lors de la suppression. L\'élément est peut-être utilisé ailleurs.');
    } finally {
      setLoading(false);
    }
  }, [deleting, tab, setLoading, setError, setMatches, setTeams, setPlayers]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditing(null);
    setForm({});
    setError('');
  }, [setError]);

  const openEdit = useCallback((item: any) => {
    setEditing(item);
    setError('');

    if (tab === 'matches') {
      setForm({
        home_team_id: item.home_team_id || '',
        away_team_id: item.away_team_id || '',
        home_score: item.home_score || 0,
        away_score: item.away_score || 0,
        match_date: item.match_date?.slice(0, 16) || '',
        phase: item.phase || 'group',
        stadium: item.stadium || '',
        status: item.status || 'scheduled',
        group_name: item.group_name || ''
      });
    } else if (tab === 'teams') {
      setForm({
        name: item.name || '',
        code: item.code || '',
        flag_url: item.flag_url || '',
        group_name: item.group_name || '',
        fifa_points_before: item.fifa_points_before,
        fifa_rank_before: item.fifa_rank_before || 0,
      });
    } else if (tab === 'players') {
      setForm({
        name: item.name || '',
        team_id: item.team_id || '',
        position: item.position || '',
        number: item.number || 0
      });
    }

    setDialogOpen(true);
  }, [tab, setError]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({});
    setError('');
    setDialogOpen(true);
  }, [setError]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleting(id);
    setDeleteOpen(true);
  }, []);

  // Fonction pour gérer le clic sur une équipe
  const handleTeamClick = useCallback((team: Team) => {
    setSelectedTeam(team);
    setTab('players'); // Change automatiquement d'onglet
    setSearch(''); // Réinitialise la recherche
  }, []);

  // Fonction pour revenir à la liste des équipes
  const handleBackToTeams = useCallback(() => {
    setSelectedTeam(null);
    setTab('teams');
    setSearch('');
  }, []);

  // Fonction pour se déconnecter
  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, []);

  if (loading && matches.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Administration CAN 2025
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gérer les matchs, équipes, joueurs et stades
              </p>
            </div>
            <Trophy className="w-12 h-12 text-primary opacity-20" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {error && <ErrorAlert message={error} />}

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-transparent h-auto p-0">
            {TABS.map(({ value, label, icon: Icon, gradient }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={`data-[state=active]:bg-linear-to-br data-[state=active]:${gradient} data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 h-20 rounded-2xl transition-all`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* MATCHS */}
          <TabsContent value="matches" className="space-y-6">
            <SearchFilterBar
              search={search}
              onSearchChange={setSearch}
              filterPhase={filterPhase}
              onFilterPhaseChange={setFilterPhase}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              onCreateClick={openCreate}
              createLabel="Nouveau match"
              showFilters
            />

            <div className="grid grid-cols-2 gap-4">
              {filteredData.matches.length === 0 ? (
                <EmptyState
                  icon={<Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />}
                  title="Aucun match trouvé"
                  description="Ajoutez votre premier match pour commencer"
                />
              ) : (
                filteredData.matches.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onEdit={openEdit}
                    onDelete={handleDeleteClick}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* ÉQUIPES */}
          <TabsContent value="teams" className="space-y-4">
            <SearchFilterBar
              search={search}
              onSearchChange={setSearch}
              onCreateClick={openCreate}
              createLabel="Ajouter"
            />
            {filteredData.teams.length === 0 ? (
              <EmptyState
                icon={<Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />}
                title="Aucune équipe trouvée"
                description="Ajoutez votre première équipe pour commencer"
              />
            ) : (
              Object.entries(teamsByGroup)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([groupName, teams]) => (
                  <div key={groupName} className="space-y-3 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold">
                      {groupName}
                    </h3>

                    <div className="grid gap-4 grid-cols-2">
                      {teams.map(team => (
                        <TeamCard
                          key={team.id}
                          team={team}
                          onEdit={openEdit}
                          onDelete={handleDeleteClick}
                          onClick={handleTeamClick}
                          playerCount={getPlayersByTeam(team.id).length}
                        />
                      ))}
                    </div>
                  </div>
                ))
            )}
          </TabsContent>

          {/* JOUEURS */}
          <TabsContent value="players" className="space-y-6">
            {selectedTeam ? (
              // Vue détaillée d'une équipe avec ses joueurs
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToTeams}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux équipes
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {selectedTeam.flag_url ? (
                        <img src={selectedTeam.flag_url} alt={selectedTeam.name} className="w-12 h-8 object-cover rounded" />
                      ) : '🏳️'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                      <p className="text-muted-foreground">
                        {getPlayersByTeam(selectedTeam.id).length} joueurs
                      </p>
                    </div>
                  </div>
                </div>

                {getPlayersByTeam(selectedTeam.id).length === 0 ? (
                  <EmptyState
                    icon={<UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />}
                    title="Aucun joueur"
                    description="Cette équipe n'a pas encore de joueurs"
                  />
                ) : (
                  <div className="space-y-8">
                    {groupPlayersByPosition(getPlayersByTeam(selectedTeam.id)).map(([position, players]) => (
                      <div key={position} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-slate-200">
                          {position} ({players.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {players.map(p => (
                            <PlayerCard
                              key={p.id}
                              player={p}
                              onEdit={openEdit}
                              onDelete={handleDeleteClick}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Vue globale de tous les joueurs
              <>
                <SearchFilterBar
                  search={search}
                  onSearchChange={setSearch}
                  onCreateClick={openCreate}
                  createLabel="Ajouter"
                />

                {filteredData.players.length === 0 ? (
                  <EmptyState
                    icon={<UserCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />}
                    title="Aucun joueur trouvé"
                    description="Ajoutez votre premier joueur pour commencer"
                  />
                ) : (
                  <div className="space-y-8">
                    {groupPlayersByPosition(filteredData.players).map(([position, players]) => (
                      <div key={position} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-slate-200">
                          {position} ({players.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {players.map(p => (
                            <PlayerCard
                              key={p.id}
                              player={p}
                              onEdit={openEdit}
                              onDelete={handleDeleteClick}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* STADES */}
          <TabsContent value="stadiums" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un stade ou une ville..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.stadiums.map(stadium => (
                <StadiumCard key={stadium.id} stadium={stadium} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog Formulaire */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editing ? 'Modifier' : 'Ajouter'}{' '}
                {tab === 'matches' ? 'un match' : tab === 'teams' ? 'une équipe' : 'un joueur'}
              </DialogTitle>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {tab === 'matches' && <MatchFormFields form={form} setForm={setForm} teams={teams} />}
              {tab === 'teams' && <TeamFormFields form={form} setForm={setForm} />}
              {tab === 'players' && <PlayerFormFields form={form} setForm={setForm} teams={teams} />}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeDialog} className="h-11">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Dialog Suppression */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet élément ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleting(null)}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                {loading ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}