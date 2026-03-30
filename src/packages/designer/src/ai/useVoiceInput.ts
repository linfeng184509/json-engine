import { ref, onUnmounted } from "vue"

export interface VoiceState {
  isListening: boolean
  transcript: string
  isSupported: boolean
  error: string | null
}

export function useVoiceInput() {
  const state = ref<VoiceState>({ isListening: false, transcript: "", isSupported: false, error: null })
  let recognition: any = null

  function init(lang: string = "zh-CN") {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      state.value.isSupported = false
      return
    }
    state.value.isSupported = true
    recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = (event: any) => {
      const result = event.results[0]
      state.value.transcript = result[0].transcript
    }
    recognition.onerror = (event: any) => {
      state.value.error = event.error
      state.value.isListening = false
    }
    recognition.onend = () => {
      state.value.isListening = false
    }
  }

  function start() {
    if (!recognition) return
    state.value.transcript = ""
    state.value.error = null
    state.value.isListening = true
    recognition.start()
  }

  function stop() {
    if (!recognition) return
    recognition.stop()
    state.value.isListening = false
  }

  function setLanguage(lang: string) {
    if (recognition) recognition.lang = lang
  }

  onUnmounted(() => {
    if (recognition && state.value.isListening) recognition.stop()
  })

  return { state, init, start, stop, setLanguage }
}