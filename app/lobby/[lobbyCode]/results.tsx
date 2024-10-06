import { GAME_STATE } from "@/app/constants";
import useLobby from "@/hooks/useLobby";
import { updateLobby } from "@/utils/firebase/firebaseHelpers";

export default function Results() {
    const { lobbyCode } = useLobby();

    const newGame = () => {
        updateLobby(lobbyCode, {
            gameState: GAME_STATE.GAME,
        });
    }
    return (<>
        <div>Results</div>
        <button onClick={newGame}>New Game</button>
    </>
    );
}