import { GAME_STATE } from "@/app/constants";
import useLobby from "@/hooks/useLobby";
import { updateLobby } from "@/utils/firebase/firebaseHelpers";
import { useRouter } from "next/navigation";

export default function Results() {
    const router = useRouter();
    const { lobbyCode } = useLobby();

    const newGame = () => {
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