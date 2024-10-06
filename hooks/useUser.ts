import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import state from '../app/context';

export default function useUser() {
    const snap = useSnapshot(state);

    const userId = useMemo(() => snap.userData?.userId, [snap.userData?.userId]);
    const playerName = useMemo(() => snap.userData?.playerName, [snap.userData?.playerName]);
    const playerLobbyCode = useMemo(() => snap.userData?.playerLobbyCode, [snap.userData?.playerLobbyCode]);

    const userFetched = useMemo(() => snap.userData?.userFetched, [snap.userData?.userFetched]);

    return {
        userId,
        playerName,
        playerLobbyCode,
        userFetched,
    };
}