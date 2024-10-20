import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface SuccessToastProps {
  text?: string;
}

export interface SuccessToastRef {
  showToast: () => void;
}

const SuccessToast = forwardRef<SuccessToastRef, SuccessToastProps>(({ text }, ref) => {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useImperativeHandle(ref, () => ({
    showToast: () => {
      setShow(true);
      setFadeOut(false);
    },
  }));

  useEffect(() => {
    if (show) {
      const fadeOutTimer = setTimeout(() => {
        setFadeOut(true);
      }, 1000);

      const hideTimer = setTimeout(() => {
        setShow(false);
      }, 1500);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={`toast toast-center toast-middle transition-scale duration-500 ease-in-out z-50 ${fadeOut ? "scale-0" : "scale-100"}`}>
      <div className="alert gap-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#34D399" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-lg">{text || "Copied successfully!"}</p>
      </div>
    </div>
  );
});

SuccessToast.displayName = 'SuccessToast';

export default SuccessToast;