import { PrimaryButton } from "@/app/components";
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
        <div className="bg-white p-4 rounded">
            <div>Results</div>
            {players?.map((player: Player) => (
                <div key={player.userId}>{player.name} - {player.score}</div>
            ))}
            <PrimaryButton
                text="New Game"
                className="mr-1"
                onClick={newGame}
            />
            <PrimaryButton
                text="Back to Lobby"
                onClick={backToLobby}
            />
        </div>
    );
}