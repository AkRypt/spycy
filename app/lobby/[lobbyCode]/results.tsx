import { GAME_STATE } from "@/app/constants";
import state from "@/app/context";
import useLobby from "@/hooks/useLobby";
import { updateLobby } from "@/utils/firebase/firebaseHelpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Results() {
    const { lobbyCode, gameState, currentGame } = useLobby();

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

    return (<>
        <div>Results</div>
        <button onClick={newGame}>New Game</button>
        <button onClick={backToLobby}>Back to Lobby</button>
    </>
    );
}