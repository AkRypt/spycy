"use client";

export default function Background({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex flex-col min-h-screen w-full  bg-slate-900 relative overflow-hidden">
            {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
            </div> */}

            {/* Miscellaneous */}
            {/* <div className="mt-8 w-full">
                    <p className="text-center mb-2">Miscellaneous:</p>
                    <div className="flex flex-col gap-2">
                        <button onClick={addWordsToFirestore} className="bg-gray-200 p-2 rounded">Add Words</button>
                        <button onClick={getRando} className="bg-gray-200 p-2 rounded">Get Random Word</button>
                        <p className="text-center mt-2">{randomWord}</p>
                    </div>
                </div> */}

            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-500 rounded-full blur-2xl opacity-55 animate-blob"></div>
            <div className="absolute top-[30%] right-[-10%] w-72 h-72 bg-purple-500 rounded-full blur-2xl opacity-55 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-72 h-72 bg-pink-900 rounded-full blur-2xl opacity-55 animate-blob animation-delay-4000"></div>

            {children}
        </div>
    );
};