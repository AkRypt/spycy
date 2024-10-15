export default function SignOutButton({ text, style, onClick }: { text?: string, style?: string, onClick: () => void }) {
    return (
        <div className="flex flex-col items-end">
            <p className="text-xs text-primary-bg rounded-full px-2 mb-1 font-bold">{text}</p>
            <button
                className={`flex items-center justify-center w-[100px] z-10 bg-white rounded-full  px-2 py-0.5 hover:bg-gray-300 ${style}`}
                onClick={onClick}
            >
                <p className="text-primary-bg underline text-xs">Sign Out</p>
            </button>
        </div>
    )
}

