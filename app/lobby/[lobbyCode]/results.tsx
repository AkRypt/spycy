import { LobbyCode, PrimaryButton } from "@/app/components";
import { GAME_STATE } from "@/app/constants";
import state from "@/app/context";
import { Player } from "@/app/interfaces";
import useLobby from "@/hooks/useLobby";
import { updateLobby } from "@/utils/firebase/firebaseHelpers";
import { useEffect } from "react";

export default function Results() {
    const { lobbyCode, gameState, currentGame, players } = useLobby();

    useEffect(() => {
        if (gameState === GAME_STATE.FINISHED) {
            state.showVotingModal = false;
        }
    }, [gameState]);

    const newGame = () => {
        console.log("curerntGame:", currentGame);
        updateLobby(lobbyCode, {
            gameState: GAME_STATE.GAME,
        });
    }

    const backToLobby = () => {
        updateLobby(lobbyCode, {
            gameState: GAME_STATE.LOBBY,
        });
    }

    return (
        <div className="p-4">
            <LobbyCode text={lobbyCode} />
            <h2 className="text-center text-2xl font-bold mb-6">Results</h2>

            <div className="space-y-4 mb-8">
                {players?.map((player: Player) => (
                    <div key={player.userId} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                        <span className="text-xl">{player.name}</span>
                        <span className="text-xl font-bold">{player.score}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col space-y-4">
                <PrimaryButton
                    text="Replay Game"
                    onClick={newGame}
                    className="w-full text-4xl"
                />
                <PrimaryButton
                    text="Back to Lobby"
                    onClick={backToLobby}
                    className="w-full text-xl"
                />
            </div>
        </div>
    );
}