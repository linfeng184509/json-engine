import { ref, computed } from 'vue'
import zhCN from './zh-CN'
import enUS from './en-US'

type Locale = 'zh-CN' | 'en-US'

const messages: Record<Locale, any> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const currentLocale = ref<Locale>('zh-CN')

export function useLocale() {
  const locale = computed(() => currentLocale.value)
  const t = computed(() => messages[currentLocale.value])

  function setLocale(l: Locale) {
    currentLocale.value = l
  }

  function getLocale(): Locale {
    return currentLocale.value
  }

  return { locale, t, setLocale, getLocale, messages }
}
