import type { StoragePluginConfig, CoreScopeStorage } from '../types';
import { createStorageInstance } from '../runtime/storage-factory';

export function createStorageScope(config: StoragePluginConfig): CoreScopeStorage {
  return createStorageInstance(config);
}
