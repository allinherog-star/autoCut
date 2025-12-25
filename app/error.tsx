'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
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
        <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px] p-6 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-200">
                组件加载失败 Component Error
            </h2>
            <p className="text-sm text-neutral-400 mb-6 text-center max-w-sm">
                {error.message || '发生了意外错误 Something went wrong.'}
            </p>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors text-sm font-medium"
            >
                <RefreshCcw className="w-4 h-4" />
                重试 Try again
            </button>
        </div>
    )
}
