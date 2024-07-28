import { useEffect, useState } from 'react';

export default function SuccessToast({ show, text }: { show: boolean, text?: string }) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (show) {
            setTimeout(() => {
                setFadeOut(true);
            }, 1000); // Match the CSS transition duration
        } else {
            setFadeOut(false);
        }
    }, [show]);

    return (
        <>
            {show &&
                <div className={`toast toast-center toast-middle transition-scale duration-500 ease-in-out ${fadeOut ? "scale-0" : "scale-100"}`}>
                    <div className="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#34D399" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p>{text || "Speaker saved successfully!"}</p>
                    </div>
                </div>
            }
        </>
    )
}

