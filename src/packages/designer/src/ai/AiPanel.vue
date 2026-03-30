<template>
  <div class="ai-panel">
    <div class="ai-header">
      <span class="ai-title">AI 表单助手</span>
      <span class="ai-status" :class="{ connected: ai.state.value.connected }">
        {{ ai.state.value.connected ? "已连接" : ai.state.value.loading ? "连接中..." : "未连接" }}
      </span>
    </div>
    
    <div class="ai-server-config">
      <input class="ai-server-input" v-model="serverUrl" placeholder="服务器地址" :disabled="ai.state.value.connected" />
      <button class="ai-connect-btn" @click="toggleConnect" :disabled="ai.state.value.loading">
        {{ ai.state.value.connected ? "断开" : "连接" }}
      </button>
    </div>
    
    <div class="ai-auto-connect">
      <label class="ai-checkbox-label">
        <input type="checkbox" v-model="autoConnect" class="ai-checkbox" />
        <span>自动连接</span>
      </label>
    </div>

    <div v-if="ai.state.value.connected" class="ai-controls">
      <div class="ai-control-row">
        <label>模型:</label>
        <select v-model="selectedModelValue" class="ai-select" :disabled="ai.models.loading.value">
          <option v-for="model in ai.models.availableModels.value" :key="model.providerID + model.id" :value="model.providerID + '|' + model.id">
            {{ model.providerName }} / {{ model.name }}
          </option>
        </select>
      </div>
      <div class="ai-control-row">
        <label>技能:</label>
        <select v-model="selectedSkillId" class="ai-select">
          <option :value="null">无</option>
          <option v-for="skill in ai.skills.skillList.value" :key="skill.id" :value="skill.id">
            {{ skill.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="ai.state.value.connected" class="ai-session-bar">
      <span class="ai-session-title">{{ currentSessionTitle }}</span>
      <button class="ai-session-btn" @click="showSessionList = !showSessionList">📋</button>
      <button class="ai-session-btn" @click="createNewSession">➕</button>
    </div>

    <div v-if="showSessionList && ai.session.sessions.value.length > 0" class="ai-session-list">
      <div 
        v-for="s in ai.session.sessions.value" 
        :key="s.id" 
        class="ai-session-item" 
        :class="{ active: s.id === ai.session.currentSessionId.value }"
        @click="selectSession(s.id)"
      >
        <span class="ai-session-item-title">{{ s.title }}</span>
        <span class="ai-session-item-count">{{ s.messages.length }} 条</span>
        <button class="ai-session-delete" @click.stop="deleteSession(s.id)">🗑️</button>
      </div>
    </div>

    <div v-if="ai.state.value.error" class="ai-error">{{ ai.state.value.error }}</div>
    
    
    
    <div class="ai-messages" ref="messagesRef">
      <div v-for="(msg, idx) in ai.messages.value" :key="msg.id || idx" class="ai-message-row" :class="msg.role" @click="openMessagePreview(msg)">
        <div class="ai-avatar" :class="msg.role">{{ msg.role === "user" ? "🧑" : "🤖" }}</div>
        <div class="ai-msg-bubble">
          <div class="ai-msg-content" v-html="renderMarkdown(msg.content)"></div>
        </div>
      </div>
      <div v-if="ai.state.value.loading" class="ai-loading"><span></span><span></span><span></span></div>
    </div>
    
    <div v-if="previewMessage" class="ai-preview-overlay" @click="closeMessagePreview">
      <div class="ai-preview-modal" @click.stop>
        <div class="ai-preview-header">
          <span class="ai-preview-title">{{ previewMessage.role === "user" ? "🧑 用户消息" : "🤖 AI 回复" }}</span>
          <button class="ai-preview-close" @click="closeMessagePreview">✕</button>
        </div>
        <div class="ai-preview-content" v-html="renderMarkdown(previewMessage.content)"></div>
      </div>
    </div>
    
    <div class="ai-input-area">
      <input class="ai-input" v-model="inputText" :placeholder="placeholderText" @keydown.enter="sendMessage" :disabled="ai.state.value.loading || !ai.state.value.connected" />
      <button v-if="voice.state.value.isSupported" class="ai-voice-btn" :class="{ recording: voice.state.value.isListening }" @click="toggleVoice">{{ voice.state.value.isListening ? "🔴" : "🎤" }}</button>
      <button class="ai-send-btn" @click="sendMessage" :disabled="ai.state.value.loading || !inputText.trim() || !ai.state.value.connected">➤</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from "vue"
import { marked } from "marked"
import { useAiDesign } from "../ai/useAiDesign"
import { useVoiceInput } from "../ai/useVoiceInput"


marked.setOptions({
  breaks: true,
  gfm: true
})

function renderMarkdown(text: string): string {
  return marked.parse(text) as string
}

const emit = defineEmits<{ applyForm: [data: Record<string, unknown>] }>()

const ai = useAiDesign()
const voice = useVoiceInput()
const inputText = ref("")
const serverUrl = ref(ai.getStoredServerUrl() || ai.state.value.serverUrl)
const messagesRef = ref<HTMLElement | null>(null)
const showSessionList = ref(false)
const previewMessage = ref<AiMessage | null>(null)
const autoConnect = ref(ai.session.autoConnect.value)

type AiMessage = { id?: string; role: string; content: string; timestamp: number; formData?: Record<string, unknown> }

voice.init("zh-CN")

function openMessagePreview(msg: AiMessage) {
  previewMessage.value = msg
}

function closeMessagePreview() {
  previewMessage.value = null
}

const selectedModelValue = computed({
  get: () => {
    const m = ai.models.selectedModel.value
    return m ? `${m.providerID}|${m.modelID}` : ""
  },
  set: (val: string) => {
    if (val) {
      const [providerID, modelID] = val.split("|")
      ai.models.selectModel({ providerID, modelID })
      ai.session.setSessionModel({ providerID, modelID })
    }
  }
})

const selectedSkillId = computed({
  get: () => ai.skills.activeSkillId.value,
  set: async (val: string | null) => {
    if (val) {
      ai.skills.load(val)
    } else {
      ai.skills.unload()
    }
    ai.session.setSessionSkill(val)
    if (ai.state.value.connected) {
      await ai.reloadSkill()
    }
  }
})

const currentSessionTitle = computed(() => {
  return ai.session.currentSession.value?.title || "新会话"
})

const placeholderText = computed(() => {
  if (voice.state.value.isListening) return voice.state.value.transcript || "正在听..."
  if (!ai.state.value.connected) return "请先连接服务器..."
  return "输入需求..."
})

watch(() => ai.session.currentSession.value?.model, (model) => {
  if (model) {
    ai.models.selectModel(model)
  }
}, { immediate: true })

watch(() => ai.session.currentSession.value?.activeSkill, (skillId) => {
  if (skillId && ai.skills.has(skillId)) {
    ai.skills.load(skillId)
  }
}, { immediate: true })

watch(autoConnect, (enabled) => {
  ai.session.setAutoConnect(enabled)
})

onMounted(async () => {
  if (autoConnect.value && ai.session.lastServerUrl.value) {
    await ai.tryAutoConnect()
  }
})

async function toggleConnect() {
  if (ai.state.value.connected) {
    ai.disconnect()
  } else {
    await ai.connect(serverUrl.value)
  }
}

async function sendMessage() {
  const text = inputText.value.trim() || voice.state.value.transcript
  if (!text) return
  inputText.value = ""
  voice.stop()
  const result = await ai.generateForm(text)
  if (result) {
    applyForm(result)
  }
  scrollToBottom()
}



function applyForm(data: Record<string, unknown>) { 
  emit("applyForm", data) 
}

function toggleVoice() {
  if (voice.state.value.isListening) { 
    voice.stop()
    if (voice.state.value.transcript) inputText.value = voice.state.value.transcript 
  } else { 
    voice.start() 
  }
}

function createNewSession() {
  ai.createNewSession()
  showSessionList.value = false
}

function selectSession(sessionId: string) {
  ai.session.selectSession(sessionId)
  showSessionList.value = false
}

function deleteSession(sessionId: string) {
  ai.session.deleteSession(sessionId)
}

function scrollToBottom() { 
  nextTick(() => { 
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight 
  }) 
}

ai.setApplySchemaHandler((schema) => {
  emit("applyForm", schema)
})
</script>

<style scoped>
.ai-panel { height: 100%; display: flex; flex-direction: column; background: #fff; font-size: 12px; overflow: hidden; }
.ai-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.ai-title { font-size: 13px; font-weight: 500; color: #333; }
.ai-status { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #f5f5f5; color: #999; }
.ai-status.connected { background: #e6f7ff; color: #1890ff; }
.ai-server-config { display: flex; gap: 4px; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.ai-server-input { flex: 1; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 11px; }
.ai-server-input:focus { border-color: #1890ff; outline: none; }
.ai-server-input:disabled { background: #f5f5f5; }
.ai-connect-btn { padding: 4px 12px; border: 1px solid #1890ff; background: #1890ff; color: #fff; border-radius: 4px; cursor: pointer; font-size: 11px; }
.ai-connect-btn:hover { background: #40a9ff; }
.ai-connect-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ai-auto-connect { padding: 4px 12px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.ai-checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #666; cursor: pointer; }
.ai-checkbox { width: 14px; height: 14px; cursor: pointer; }

.ai-controls { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; background: #fafafa; flex-shrink: 0; }
.ai-control-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ai-control-row:last-child { margin-bottom: 0; }
.ai-control-row label { width: 36px; font-size: 11px; color: #666; flex-shrink: 0; }
.ai-select { flex: 1; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 11px; background: #fff; }

.ai-session-bar { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-bottom: 1px solid #f0f0f0; background: #fafafa; flex-shrink: 0; }
.ai-session-title { flex: 1; font-size: 11px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ai-session-btn { padding: 2px 6px; border: 1px solid #d9d9d9; border-radius: 3px; background: #fff; cursor: pointer; font-size: 12px; }
.ai-session-btn:hover { border-color: #1890ff; }

.ai-session-list { max-height: 200px; overflow-y: auto; border-bottom: 1px solid #f0f0f0; background: #fafafa; flex-shrink: 0; }
.ai-session-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
.ai-session-item:last-child { border-bottom: none; }
.ai-session-item:hover { background: #f0f0f0; }
.ai-session-item.active { background: #e6f7ff; }
.ai-session-item-title { flex: 1; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ai-session-item-count { font-size: 10px; color: #999; }
.ai-session-delete { padding: 2px 4px; border: none; background: transparent; cursor: pointer; font-size: 10px; opacity: 0.5; }
.ai-session-delete:hover { opacity: 1; }

.ai-error { padding: 4px 12px; font-size: 11px; color: #ff4d4f; background: #fff2f0; flex-shrink: 0; }
.ai-quick-actions { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.ai-quick-btn { padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; font-size: 11px; }
.ai-quick-btn:hover { border-color: #1890ff; color: #1890ff; }
.ai-messages { flex: 1; overflow-y: auto; padding: 12px; min-height: 0; display: flex; flex-direction: column; gap: 12px; }
.ai-message-row { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; }
.ai-message-row.user { flex-direction: row-reverse; }
.ai-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: #f0f0f0; }
.ai-avatar.user { background: #e6f7ff; }
.ai-avatar.assistant { background: #f6ffed; }
.ai-msg-bubble { max-width: 80%; padding: 8px 12px; border-radius: 12px; background: #f5f5f5; }
.ai-message-row.user .ai-msg-bubble { background: #1890ff; color: #fff; border-top-right-radius: 4px; }
.ai-message-row.assistant .ai-msg-bubble { border-top-left-radius: 4px; }
.ai-message-row:hover .ai-msg-bubble { opacity: 0.9; }
.ai-msg-content { line-height: 1.6; word-break: break-word; overflow-wrap: break-word; font-size: 12px; }
.ai-msg-content :deep(h1), .ai-msg-content :deep(h2), .ai-msg-content :deep(h3) { margin: 8px 0 4px; font-size: 13px; font-weight: 600; }
.ai-msg-content :deep(p) { margin: 4px 0; }
.ai-msg-content :deep(pre) { background: #282c34; color: #abb2bf; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 4px 0; font-size: 11px; }
.ai-msg-content :deep(code) { background: rgba(0,0,0,0.1); padding: 1px 4px; border-radius: 2px; font-size: 11px; font-family: Consolas, Monaco, monospace; }
.ai-msg-content :deep(pre code) { background: transparent; padding: 0; }
.ai-msg-content :deep(ul), .ai-msg-content :deep(ol) { margin: 4px 0; padding-left: 16px; }
.ai-msg-content :deep(li) { margin: 2px 0; }
.ai-msg-content :deep(blockquote) { border-left: 3px solid rgba(255,255,255,0.5); margin: 4px 0; padding-left: 8px; opacity: 0.9; }
.ai-msg-content :deep(table) { border-collapse: collapse; margin: 4px 0; font-size: 11px; }
.ai-msg-content :deep(th), .ai-msg-content :deep(td) { border: 1px solid rgba(255,255,255,0.3); padding: 4px 8px; }
.ai-msg-content :deep(th) { background: rgba(255,255,255,0.1); }
.ai-message-row.assistant .ai-msg-content :deep(blockquote) { border-left-color: #1890ff; }
.ai-message-row.assistant .ai-msg-content :deep(code) { background: #f0f0f0; }
.ai-message-row.assistant .ai-msg-content :deep(th), .ai-message-row.assistant .ai-msg-content :deep(td) { border-color: #d9d9d9; }
.ai-message-row.assistant .ai-msg-content :deep(th) { background: #fafafa; }
.ai-loading { display: flex; gap: 4px; padding: 8px; justify-content: center; }
.ai-loading span { width: 6px; height: 6px; border-radius: 50%; background: #1890ff; animation: bounce 1.4s infinite ease-in-out both; }
.ai-loading span:nth-child(1) { animation-delay: -0.32s; }
.ai-loading span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
.ai-input-area { display: flex; gap: 4px; padding: 8px 12px; border-top: 1px solid #f0f0f0; flex-shrink: 0; }
.ai-input { flex: 1; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.ai-input:focus { border-color: #1890ff; outline: none; }
.ai-voice-btn { padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; font-size: 14px; }
.ai-voice-btn.recording { border-color: #ff4d4f; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.ai-send-btn { padding: 6px 12px; border: 1px solid #1890ff; background: #1890ff; color: #fff; border-radius: 4px; cursor: pointer; font-size: 14px; }
.ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ai-preview-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.ai-preview-modal { background: #fff; border-radius: 8px; width: 90%; max-width: 800px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); }
.ai-preview-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.ai-preview-title { font-size: 14px; font-weight: 500; color: #333; }
.ai-preview-close { border: none; background: transparent; font-size: 18px; cursor: pointer; color: #999; padding: 4px 8px; }
.ai-preview-close:hover { color: #333; }
.ai-preview-content { flex: 1; overflow-y: auto; padding: 16px; line-height: 1.8; word-break: break-word; overflow-wrap: break-word; font-size: 13px; }
.ai-preview-content :deep(h1), .ai-preview-content :deep(h2), .ai-preview-content :deep(h3) { margin: 16px 0 8px; font-size: 16px; font-weight: 600; }
.ai-preview-content :deep(p) { margin: 8px 0; }
.ai-preview-content :deep(pre) { background: #282c34; color: #abb2bf; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0; font-size: 12px; }
.ai-preview-content :deep(code) { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-family: Consolas, Monaco, monospace; }
.ai-preview-content :deep(pre code) { background: transparent; padding: 0; }
.ai-preview-content :deep(ul), .ai-preview-content :deep(ol) { margin: 8px 0; padding-left: 20px; }
.ai-preview-content :deep(li) { margin: 4px 0; }
.ai-preview-content :deep(blockquote) { border-left: 4px solid #1890ff; margin: 8px 0; padding: 8px 12px; color: #666; background: #f6f6f6; }
.ai-preview-content :deep(table) { border-collapse: collapse; margin: 8px 0; width: 100%; }
.ai-preview-content :deep(th), .ai-preview-content :deep(td) { border: 1px solid #d9d9d9; padding: 8px 12px; text-align: left; }
.ai-preview-content :deep(th) { background: #fafafa; font-weight: 500; }
.ai-preview-actions { padding: 12px 16px; border-top: 1px solid #f0f0f0; flex-shrink: 0; }
.ai-preview-apply { padding: 8px 16px; border: 1px solid #52c41a; background: #52c41a; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; }
.ai-preview-apply:hover { background: #73d13d; }
</style>