import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import state from '../app/context';

export default function useLobby() {
    const snap = useSnapshot(state);

    const lobbyCode = useMemo(() => snap.lobbyData?.lobbyCode, [snap.lobbyData?.lobbyCode]);
    const gameState = useMemo(() => snap.lobbyData?.gameState, [snap.lobbyData?.gameState]);
    const players = useMemo(() => snap.lobbyData?.players, [snap.lobbyData?.players]);
    const currentGame = useMemo(() => snap.lobbyData?.currentGame, [snap.lobbyData?.currentGame]);
    const games = useMemo(() => snap.lobbyData?.games, [snap.lobbyData?.games]);

    const lobbyFetched = useMemo(() => snap.lobbyData?.lobbyFetched, [snap.lobbyData?.lobbyFetched]);

    return {
        lobbyCode,
        gameState,
        players,
        lobbyFetched,
        currentGame,
        games,
    };
}