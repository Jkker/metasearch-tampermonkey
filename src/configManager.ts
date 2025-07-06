/**
 * Configuration Management Module
 * 
 * Handles loading and saving search engine configuration using Tampermonkey's GM_setValue/GM_getValue.
 * Provides fallback to default configuration if no custom configuration is found.
 */

import { config as defaultConfig } from './config'
import type { Engine } from './types'

const CONFIG_KEY = 'metasearch-engines'

export interface ConfigData {
  engines: Engine[]
}

/**
 * Loads the search engine configuration from storage.
 * Falls back to default configuration if no custom configuration exists.
 */
export function loadConfiguration(): ConfigData {
  try {
    const saved = GM_getValue(CONFIG_KEY, null)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Validate that the parsed data has the expected structure
      if (parsed && Array.isArray(parsed.engines)) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('[MetaSearch] Failed to load configuration:', error)
  }
  
  // Return default configuration if no valid saved configuration
  return defaultConfig
}

/**
 * Saves the search engine configuration to storage.
 */
export function saveConfiguration(config: ConfigData): void {
  try {
    GM_setValue(CONFIG_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('[MetaSearch] Failed to save configuration:', error)
    throw error
  }
}

/**
 * Resets the configuration to default values.
 */
export function resetConfiguration(): void {
  try {
    GM_setValue(CONFIG_KEY, JSON.stringify(defaultConfig))
  } catch (error) {
    console.error('[MetaSearch] Failed to reset configuration:', error)
    throw error
  }
}

/**
 * Checks if a custom configuration exists in storage.
 */
export function hasCustomConfiguration(): boolean {
  try {
    const saved = GM_getValue(CONFIG_KEY, null)
    return saved !== null
  } catch (error) {
    console.warn('[MetaSearch] Failed to check for custom configuration:', error)
    return false
  }
}