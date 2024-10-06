import { GAME_STATE } from "@/app/constants";
import { Player } from "@/app/interfaces";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby"
import { unjoinLobby, updateGameSession, updateLobby } from "@/utils/firebase/firebaseHelpers";
import { useRouter } from "next/navigation";

export default function Game() {
    const router = useRouter();
    const { playerLobbyCode, userId } = useUser();
    const { lobbyCode, players, currentGame } = useLobby();

    const endGame = () => {
        updateGameSession(lobbyCode, {
            isGameOver: true,
        });
    }

    return (
        <div className="min-h-screen md:px-10">
            <h1>GAME SCREEN</h1>
            {lobbyCode}
            {userId === currentGame.spy ? "You are the spy" : "You are not the spy"}
            {currentGame.word}

            <button onClick={endGame}>End Game</button>

        </div>
    );
}