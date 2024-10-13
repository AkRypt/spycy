import { useState } from "react";

export default function HowToPlayModal({ show }: { show: boolean }) {
    return (
        <div>
            {show && (
                <div className="fixed top-0 left-0 z-50 w-full h-full bg-gray-900 bg-opacity-50">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="bg-white px-4 py-8 w-[90%] md:w-[30%] rounded-lg flex flex-col justify-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="gray" className="w-[140px] h-[140px]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            <p className="text-2xl md:text-3xl text-gray-500 text-center">Please reload this page!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}