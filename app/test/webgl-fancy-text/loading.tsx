export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-xl text-gray-400">加载 WebGL 渲染器...</p>
        <p className="text-sm text-gray-500 mt-2">初始化 Three.js 场景</p>
      </div>
    </div>
  )
}







