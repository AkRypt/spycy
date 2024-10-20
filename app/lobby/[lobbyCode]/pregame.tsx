import { LobbyCode } from "@/app/components";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { GAME_STATE } from "@/app/constants";
import { Player } from "@/app/interfaces";
import useLobby from "@/hooks/useLobby"
import { updateLobby } from "@/utils/firebase/firebaseHelpers";

export default function Pregame() {
    const { lobbyCode, players } = useLobby();

    const startGame = () => {
        updateLobby(lobbyCode as string, { gameState: GAME_STATE.GAME });
    }

    return (
        <div className="p-4">
            <LobbyCode text={lobbyCode} />

            <h2 className="text-center text-2xl font-bold mb-6">Players</h2>

            {/* Players List */}
            <div className="my-4">
                {players.map((player: Player) => (
                    <div className="p-2 border bg-gray-800 rounded-2xl my-2 text-center text-xl"
                        key={player.name}>{player.name}</div>
                ))}
            </div>

            <div className="flex justify-center gap-4">
                <PrimaryButton
                    text="Start Game"
                    onClick={startGame}
                />
            </div>
        </div>
    );
}