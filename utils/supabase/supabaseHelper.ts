import state from '@/app/context';
import { Lobby, Player } from '@/app/interfaces';
import { createClient } from '@/utils/supabase/client';

export const supabase = createClient();

export const createLobby = async (lobbyCode: string) => {
    state.isLoading = true;
    const { data, error } = await supabase
        .from('lobbies')
        .insert([{ lobby_code: lobbyCode }]);
    if (error) throw error;
    state.isLoading = false;
    return data;
};

export const joinLobby = async (lobbyCode: string) => {
    try {
        console.log("Join lobby called")
        const playerName = localStorage.getItem('playerName');
        let { data: existingLobby } = await supabase
            .from('lobbies')
            .select('*')
            .eq('lobby_code', lobbyCode)
            .maybeSingle();

        if (!existingLobby) {
            console.log("Tried to join a non-existent lobby:", lobbyCode, playerName);
            return { ok: false, message: 'Lobby not found. Please check the lobby code and try again.' };
        }

        const players = existingLobby.players || [];
        if (players.some((player: Player) => player.name === playerName)) {
            console.log("Player name already exists:", playerName, lobbyCode);
            return { ok: false, message: 'Player name already exists. Please change your name and try again.' };
        }
        const currentPlayer = { name: playerName, role: 'lobby_player', prompt: '' };
        const updatedPlayers: Player[] = [...players, currentPlayer];
        const { data: updatedLobby } = await supabase
            .from('lobbies')
            .update({ players: updatedPlayers })
            .eq('lobby_code', lobbyCode)
            .select()
            .single();
        return { ok: true, data: updatedLobby };
    } catch (error) {
        console.log(error);
        return { ok: false, message: 'An error occurred while joining the lobby. Please try again.' };
    }
};

export const unjoinLobby = async (lobbyCode: string) => {
    try {
        console.log("Unjoin lobby called")
        const playerName = localStorage.getItem('playerName');
        let { data: existingLobby } = await supabase
            .from('lobbies')
            .select('*')
            .eq('lobby_code', lobbyCode)
            .single();

        if (!existingLobby) {
            console.log("Tried to unjoin a non-existent lobby!");
            return { ok: false, message: 'Lobby not found.' };
        }

        const updatedPlayers = existingLobby.players.filter((player: Player) => player.name !== playerName);
        const { data: updatedLobby } = await supabase
            .from('lobbies')
            .update({ players: updatedPlayers })
            .eq('lobby_code', lobbyCode)
            .select()
            .single();
        return { ok: true, data: updatedLobby };
    } catch (error) {
        console.log(error);
        return { ok: false, message: 'An error occurred while leaving the lobby.' };
    }
};

export const subscribeToLobbyChanges = (lobbyCode: string, onUpdate: (lobby: Lobby) => void) => {
    const subscription = supabase
        .channel('lobby_changes')
        .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `lobby_code=eq.${lobbyCode}` },
            (payload) => {
                onUpdate(payload.new as Lobby);
            }
        )
        .subscribe();

    return subscription;
};