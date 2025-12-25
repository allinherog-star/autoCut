'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <html lang="zh-CN">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
                    <h2 className="text-2xl font-bold mb-4">出错了 Something went wrong!</h2>
                    <p className="mb-6 text-neutral-400 max-w-md text-center">
                        {error.message || '发生了未知错误 An unknown error occurred.'}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-md transition-colors"
                    >
                        重试 Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
