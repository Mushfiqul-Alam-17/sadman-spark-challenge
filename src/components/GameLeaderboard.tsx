
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { getGameScores } from '@/lib/supabase';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  TableCaption 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, User, Calendar } from 'lucide-react';

interface GameScore {
  id: string;
  user_id: string;
  game_name: string;
  score: number;
  played_at: string;
}

const GameLeaderboard: React.FC<{ gameName?: string }> = ({ gameName }) => {
  const { name } = useUser();
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      if (!name) return;
      
      setLoading(true);
      try {
        const data = await getGameScores(name, gameName);
        setScores(data);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [name, gameName]);

  return (
    <Card className="glass-card w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-kidney-yellow" />
          {gameName ? `${gameName} Leaderboard` : 'All Games Leaderboard'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse text-muted-foreground">Loading scores...</div>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No scores recorded yet. Play some games to see your scores here!
          </div>
        ) : (
          <Table>
            <TableCaption>Your game scores</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score) => (
                <TableRow key={score.id}>
                  <TableCell className="font-medium">
                    {score.game_name.replace(/-/g, ' ').split(' ').map(
                      word => word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </TableCell>
                  <TableCell className="text-right">{score.score}</TableCell>
                  <TableCell className="text-right">{new Date(score.played_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default GameLeaderboard;
