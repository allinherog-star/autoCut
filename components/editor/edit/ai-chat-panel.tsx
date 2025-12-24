'use client'

/**
 * AI 聊天对话框组件 - 通过对话进行剪辑微调
 * AI Chat Panel Component - Fine-tune editing through conversation
 */

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
  Video,
  Music,
  Type,
  Image,
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useTimelineStore } from '@/lib/timeline/store'

interface AIChatPanelProps {
  /** 当前选中的素材 ID */
  selectedClipId: string | null
  /** 当前选中的轨道 ID */
  selectedTrackId: string | null
  /** 自定义类名 */
  className?: string
}

// 消息类型
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'pending' | 'success' | 'error'
  action?: {
    type: string
    description: string
    applied?: boolean
  }
}

// 快捷指令
const QUICK_COMMANDS = [
  { icon: Clock, label: '调整时长', prompt: '帮我调整这个片段的时长' },
  { icon: Sparkles, label: '添加特效', prompt: '给这个片段添加一个酷炫的特效' },
  { icon: Music, label: '配乐推荐', prompt: '推荐一段适合的背景音乐' },
  { icon: Type, label: '优化字幕', prompt: '帮我优化字幕样式和动画' },
]

// 示例欢迎消息
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '你好！我是 AI 剪辑助手 ✨\n\n我可以帮你：\n• 调整视频片段时长和位置\n• 添加特效和转场动画\n• 优化字幕样式\n• 推荐背景音乐\n\n选择一个素材，告诉我你想做什么调整吧！',
  timestamp: new Date(),
}

export function AIChatPanel({
  selectedClipId,
  selectedTrackId,
  className = '',
}: AIChatPanelProps) {
  const { data, playback } = useTimelineStore()
  
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 获取选中素材信息
  const selectedClipInfo = React.useMemo(() => {
    if (!selectedClipId || !selectedTrackId) return null
    
    const track = data.tracks.find(t => t.id === selectedTrackId)
    if (!track) return null
    
    const clip = track.clips.find(c => c.id === selectedClipId)
    if (!clip) return null
    
    return { clip, track }
  }, [selectedClipId, selectedTrackId, data.tracks])

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // 模拟 AI 响应
    setTimeout(() => {
      const aiResponse = generateAIResponse(input.trim(), selectedClipInfo)
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000 + Math.random() * 1500)
  }

  // 处理快捷指令
  const handleQuickCommand = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 应用 AI 建议的操作
  const handleApplyAction = (messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.action) {
        return {
          ...msg,
          action: { ...msg.action, applied: true },
        }
      }
      return msg
    }))
  }

  return (
    <div className={`flex flex-col h-full bg-[#141417] ${className}`}>
      {/* 标题栏 */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#2a2a2e] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#eee]">AI 对话微调</h3>
          <p className="text-xs text-[#666]">通过对话调整剪辑</p>
        </div>
      </div>

      {/* 当前选中素材提示 */}
      {selectedClipInfo && (
        <div className="flex-shrink-0 mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400/80">当前选中</span>
          </div>
          <p className="text-sm text-[#ddd] mt-1 truncate">{selectedClipInfo.clip.asset}</p>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              onApplyAction={() => handleApplyAction(message.id)}
            />
          ))}
        </AnimatePresence>
        
        {/* 加载中指示器 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[#666]"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI 正在思考...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷指令 */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-[#252528]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <Lightbulb className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
          {QUICK_COMMANDS.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleQuickCommand(cmd.prompt)}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#252528] hover:bg-[#2f2f32] 
                text-xs text-[#888] hover:text-[#ccc] transition-colors whitespace-nowrap"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="flex-shrink-0 p-4 border-t border-[#2a2a2e]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你想要的调整..."
            rows={1}
            className="flex-1 px-4 py-3 bg-[#1e1e22] border border-[#333] rounded-xl resize-none
              text-sm text-[#eee] placeholder:text-[#555]
              focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
              transition-all max-h-32"
            style={{ minHeight: 44 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`
              w-11 h-11 rounded-xl flex items-center justify-center transition-all
              ${input.trim() && !isLoading
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:opacity-90'
                : 'bg-[#252528] text-[#555] cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// 消息气泡组件
function MessageBubble({
  message,
  onApplyAction,
}: {
  message: ChatMessage
  onApplyAction: () => void
}) {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl
          ${isUser
            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-md'
            : 'bg-[#1e1e22] text-[#ddd] rounded-bl-md'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {/* 操作建议 */}
        {message.action && (
          <div className={`mt-3 pt-3 border-t ${isUser ? 'border-white/20' : 'border-[#333]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-3.5 h-3.5 ${isUser ? 'text-white/70' : 'text-violet-400'}`} />
              <span className={`text-xs ${isUser ? 'text-white/70' : 'text-[#888]'}`}>
                建议操作
              </span>
            </div>
            <p className={`text-sm ${isUser ? 'text-white/90' : 'text-[#ccc]'}`}>
              {message.action.description}
            </p>
            {!message.action.applied ? (
              <button
                onClick={onApplyAction}
                className={`
                  mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${isUser
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                  }
                `}
              >
                应用此操作
              </button>
            ) : (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>已应用</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// 模拟 AI 响应生成
function generateAIResponse(
  input: string,
  clipInfo: { clip: any; track: any } | null
): ChatMessage {
  const responses = [
    {
      trigger: ['时长', '长度', '缩短', '延长'],
      content: '好的，我帮你分析了这个片段。\n\n根据内容节奏，建议将时长从 {duration}s 调整为 {newDuration}s，这样可以让节奏更紧凑。',
      action: { type: 'duration', description: '将片段时长调整为建议值' },
    },
    {
      trigger: ['特效', '效果', '动画'],
      content: '为这个片段推荐几个特效：\n\n1. 🎬 电影感调色 - 增加画面质感\n2. ✨ 柔光效果 - 让画面更温暖\n3. 🌟 动态模糊 - 增强运动感',
      action: { type: 'effect', description: '应用推荐的电影感调色特效' },
    },
    {
      trigger: ['音乐', '配乐', 'bgm'],
      content: '根据视频内容和节奏，推荐以下音乐：\n\n🎵 《轻快节拍》- 适合活泼场景\n🎵 《温暖时光》- 适合温馨画面\n🎵 《动感旋律》- 适合运动镜头',
      action: { type: 'music', description: '添加推荐的背景音乐' },
    },
    {
      trigger: ['字幕', '文字', '标题'],
      content: '字幕优化建议：\n\n• 字体：使用更现代的无衬线字体\n• 动画：添加淡入淡出效果\n• 位置：调整到画面下方 1/5 处',
      action: { type: 'subtitle', description: '应用字幕样式优化' },
    },
  ]

  // 匹配响应
  const matchedResponse = responses.find(r => 
    r.trigger.some(t => input.toLowerCase().includes(t))
  )

  if (matchedResponse) {
    const duration = clipInfo?.clip?.time 
      ? (clipInfo.clip.time.end - clipInfo.clip.time.start).toFixed(1)
      : '5.0'
    const newDuration = (parseFloat(duration) * 0.8).toFixed(1)
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: matchedResponse.content
        .replace('{duration}', duration)
        .replace('{newDuration}', newDuration),
      timestamp: new Date(),
      action: matchedResponse.action,
    }
  }

  // 默认响应
  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: clipInfo
      ? `好的，我收到你对「${clipInfo.clip.asset}」的调整需求。\n\n请告诉我更具体的调整方向，比如：\n• 调整时长或位置\n• 添加特效或滤镜\n• 修改样式或动画`
      : '请先选择一个素材，然后告诉我你想做什么调整。\n\n你可以在左侧素材列表中选择，或直接在时间轴上点击。',
    timestamp: new Date(),
  }
}

