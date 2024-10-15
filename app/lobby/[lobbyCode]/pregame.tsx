import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { GAME_STATE } from "@/app/constants";
import { Player } from "@/app/interfaces";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby"
import { addWordsToFirestore, unjoinLobby, updateLobby } from "@/utils/firebase/firebaseHelpers";
import { useRouter } from "next/navigation";

export default function Pregame() {
    const router = useRouter();
    const { playerLobbyCode, userId } = useUser();
    const { lobbyCode, players } = useLobby();

    const startGame = () => {
        updateLobby(lobbyCode as string, { gameState: GAME_STATE.GAME });
    }

    const leaveLobby = async () => {
        await unjoinLobby(playerLobbyCode, userId);
        router.push('/');
    }

    return (
        <div className="bg-white rounded-xl p-4">
            <div className="text-xl text-center font-bold border-4 border-cyan-300 rounded-md py-1 px-2">
                {lobbyCode}
            </div>

            {/* Players List */}
            {players.map((player: Player) => (
                <div className="p-2 border bg-gray-200 rounded-2xl my-1" 
                key={player.name}>{player.name}</div>
            ))}

            <div className="flex justify-center gap-4">
                <PrimaryButton
                    text="Start Game"
                    onClick={startGame}
                />
                <PrimaryButton
                    text="Leave Game"
                    onClick={leaveLobby}
                />
            </div>
        </div>
    );
}