export default function Loading() {
    return (
        <div className="fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="w-12 h-12 bg-gradient-to-r from-action-bg via-transparent to-secondary-bg p-4 rounded-full animate-spin"></div>
        </div>
    )
}