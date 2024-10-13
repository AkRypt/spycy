import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import state from '../app/context';

export default function useGame() {
    const snap = useSnapshot(state);
    const currentGame = useMemo(() => snap.lobbyData?.currentGame, [snap.lobbyData?.currentGame]);

    const round = useMemo(() => currentGame?.round, [currentGame?.round]);
    const spy = useMemo(() => currentGame?.spy, [currentGame?.spy]);
    const defenders = useMemo(() => currentGame?.defenders, [currentGame?.defenders]);
    const word = useMemo(() => currentGame?.word, [currentGame?.word]);
    const startTime = useMemo(() => currentGame?.startTime, [currentGame?.startTime]);
    const endTime = useMemo(() => currentGame?.endTime, [currentGame?.endTime]);
    const winner = useMemo(() => currentGame?.winner, [currentGame?.winner]);
    const isGameOver = useMemo(() => currentGame?.isGameOver, [currentGame?.isGameOver]);
    const votes = useMemo(() => currentGame?.votes, [currentGame?.votes]);
    const votingComplete = useMemo(() => currentGame?.votingComplete, [currentGame?.votingComplete]);
    const votingStartTime = useMemo(() => currentGame?.votingStartTime, [currentGame?.votingStartTime]);
    const votingEndTime = useMemo(() => currentGame?.votingEndTime, [currentGame?.votingEndTime]);
    const votingDuration = useMemo(() => currentGame?.votingDuration, [currentGame?.votingDuration]);
    const voteResults = useMemo(() => currentGame?.voteResults, [currentGame?.voteResults]);

    return {
        round,
        spy,
        defenders,
        word,
        startTime,
        endTime,
        winner,
        isGameOver,
        votes,
        votingComplete,
        votingStartTime,
        votingEndTime,
        votingDuration,
        voteResults,
    };
}