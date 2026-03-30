import { ref, computed } from "vue"
import type { AiModel, AiModelSelection } from "./types"

export function useAiModels() {
  const providers = ref<Array<{ id: string; name?: string; models: AiModel[] }>>([])
  const selectedModel = ref<AiModelSelection | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const availableModels = computed(() => {
    const models: AiModel[] = []
    for (const provider of providers.value) {
      for (const model of provider.models) {
        models.push({
          ...model,
          providerID: provider.id,
          providerName: provider.name || provider.id
        })
      }
    }
    return models
  })

  const selectedModelInfo = computed(() => {
    if (!selectedModel.value) return null
    return availableModels.value.find(
      m => m.providerID === selectedModel.value?.providerID && m.id === selectedModel.value.modelID
    )
  })

  async function fetchModels(client: { config: { providers: () => Promise<{ data: unknown }> } }): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const result = await client.config.providers()
      const rawData = result.data as { providers?: Array<{ id: string; name?: string; models: Record<string, { id: string; name?: string }> }> }
      const providersList = rawData?.providers || []
      providers.value = providersList.map(p => {
        const modelsObj = p.models || {}
        const modelIds = Object.keys(modelsObj)
        return {
          id: p.id,
          name: p.name,
          models: modelIds.map(mid => ({
            id: mid,
            name: modelsObj[mid]?.name || mid,
            providerID: p.id
          }))
        }
      })
      if (!selectedModel.value && availableModels.value.length > 0) {
        const first = availableModels.value[0]
        if (first) {
          selectedModel.value = { providerID: first.providerID, modelID: first.id }
        }
      }
    } catch (e: unknown) {
      const err = e as Error
      error.value = err.message || "Failed to fetch models"
      console.warn("[AiModels] Failed to fetch providers:", e)
    } finally {
      loading.value = false
    }
  }

  function selectModel(model: AiModelSelection | null): void {
    selectedModel.value = model
  }

  function selectModelById(providerID: string, modelID: string): void {
    const model = availableModels.value.find(
      m => m.providerID === providerID && m.id === modelID
    )
    if (model) {
      selectedModel.value = { providerID: model.providerID, modelID: model.id }
    }
  }

  function getModelInfo(providerID: string, modelID: string): AiModel | undefined {
    return availableModels.value.find(
      m => m.providerID === providerID && m.id === modelID
    )
  }

  function toSdkModel(): { providerID: string; modelID: string } | undefined {
    if (!selectedModel.value) return undefined
    return {
      providerID: selectedModel.value.providerID,
      modelID: selectedModel.value.modelID
    }
  }

  return {
    providers,
    availableModels,
    selectedModel,
    selectedModelInfo,
    loading,
    error,
    fetchModels,
    selectModel,
    selectModelById,
    getModelInfo,
    toSdkModel
  }
}