import { GAME_STATE } from "@/app/constants";
import { Player } from "@/app/interfaces";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby"
import { unjoinLobby, updateLobby } from "@/utils/firebase/firebaseHelpers";
import { useRouter } from "next/navigation";

export default function Pregame() {
    const router = useRouter();
    const { playerLobbyCode, userId } = useUser();
    const { lobbyCode, players } = useLobby();

    const startGame = () => {
        updateLobby(lobbyCode as string, { gameState: GAME_STATE.GAME });
    }

    const leaveLobby = () => {
        unjoinLobby(playerLobbyCode, userId);
        router.push('/');
    }

    return (
        <div className="min-h-screen md:px-10">
            {lobbyCode}
            {players.map((player: Player) => (
                <div key={player.name}>{player.name}</div>
            ))}
            <button onClick={startGame}>Start</button>
            <button onClick={leaveLobby}>Leave</button>
        </div>
    );
}