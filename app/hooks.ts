import { useCallback, useEffect, useState } from "react";

// Handling keyboard inputs
export function keyboardHandler({ gameOver, isMobile, correctFunc, skipFunc }: { gameOver: boolean, isMobile: boolean, correctFunc: () => void, skipFunc: () => void }) {
    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (gameOver) return;

        if (!isMobile) {
            if (e.key === "Enter") {
                correctFunc();
            }
            if (e.key === "Backspace") {
                skipFunc();
            }
        }
    }, [correctFunc, skipFunc]);

    useEffect(() => {
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyUp]);
}

// Preventing reload on swipe
export function preventReload() {
    useEffect(() => {
        document.body.style.overscrollBehaviorY = 'contain';
        return () => {
            document.body.style.overscrollBehaviorY = 'auto';
        };
    }, []);
}

// Confirm going back


// Handling swipe events
export function swipeHandler({ gameOver, loading, correctFunc, skipFunc }: { gameOver: boolean, loading: boolean, correctFunc: () => void, skipFunc: () => void }) {
    const [startX, setStartX] = useState(0);
    const [endX, setEndX] = useState(0);

    useEffect(() => {
        if (!gameOver) {
            const touchStart = (e: TouchEvent) => {
                setStartX(e.touches[0].screenX);
            };

            const touchMove = (e: TouchEvent) => {
                setEndX(e.touches[0].screenX);
            };

            const touchEnd = () => {
                if (loading) return;
                if (endX > 0) {
                    if (startX - endX > 50) {
                        skipFunc();
                    } else if (endX - startX > 50) {
                        correctFunc();
                    } else {
                        console.log("onSwipeNone")
                    }
                }
                setStartX(0);
                setEndX(0);
            };

            window.addEventListener('touchstart', touchStart);
            window.addEventListener('touchmove', touchMove);
            window.addEventListener('touchend', touchEnd);
            return () => {
                window.removeEventListener('touchstart', touchStart);
                window.removeEventListener('touchmove', touchMove);
                window.removeEventListener('touchend', touchEnd);
            };
        }
    }, [startX, endX]);
}