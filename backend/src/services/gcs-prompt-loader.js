import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GCS Prompt Loader - Loads AI prompts from Google Cloud Storage
 * Falls back to local file if GCS is unavailable
 * 
 * Optimizations:
 * - Singleton pattern with eager initialization option
 * - In-memory cache with configurable TTL
 * - Lazy GCS client initialization
 * - Promise deduplication to prevent concurrent loads
 */
class GCSPromptLoader {
  constructor(options = {}) {
    this.bucketName = options.bucketName || process.env.GCS_PROMPTS_BUCKET || 'my-agent-configs-v1';
    this.promptsFile = options.promptsFile || 'ai-prompts.json';
    this.localFallbackPath = options.localFallbackPath || path.join(__dirname, '../../config/ai-prompts.json');
    
    // Cache settings
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes default
    
    // GCS client (lazy initialization)
    this._storage = null;
    this._bucket = null;
    
    // Prevent concurrent loads (promise deduplication)
    this._loadingPromise = null;
    
    // Source tracking
    this.lastSource = null;
  }

  /**
   * Initialize GCS client (lazy, only when needed)
   */
  _initGCS() {
    if (!this._storage) {
      this._storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      });
      this._bucket = this._storage.bucket(this.bucketName);
    }
  }

  /**
   * Check if cache is still valid
   */
  _isCacheValid() {
    if (!this.cache || !this.cacheTimestamp) return false;
    return Date.now() - this.cacheTimestamp < this.cacheTTL;
  }

  /**
   * Load prompts from GCS
   */
  async _loadFromGCS() {
    this._initGCS();
    
    const file = this._bucket.file(this.promptsFile);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new Error(`Prompts file not found in GCS: gs://${this.bucketName}/${this.promptsFile}`);
    }
    
    const [content] = await file.download();
    const prompts = JSON.parse(content.toString('utf8'));
    
    this.lastSource = 'gcs';
    return prompts;
  }

  /**
   * Load prompts from local file (sync for speed)
   */
  _loadFromLocal() {
    if (!fs.existsSync(this.localFallbackPath)) {
      throw new Error(`Local prompts file not found: ${this.localFallbackPath}`);
    }
    
    const content = fs.readFileSync(this.localFallbackPath, 'utf8');
    const prompts = JSON.parse(content);
    
    this.lastSource = 'local';
    return prompts;
  }

  /**
   * Load prompts with GCS priority, local fallback
   * Uses promise deduplication to prevent concurrent network calls
   */
  async loadPrompts(forceRefresh = false) {
    // Return cached if valid and not forcing refresh
    if (!forceRefresh && this._isCacheValid()) {
      return this.cache;
    }

    // If already loading, wait for that promise (deduplication)
    if (this._loadingPromise) {
      return this._loadingPromise;
    }

    // Start loading
    this._loadingPromise = this._doLoad();
    
    try {
      const result = await this._loadingPromise;
      return result;
    } finally {
      this._loadingPromise = null;
    }
  }

  /**
   * Internal load implementation
   */
  async _doLoad() {
    const useGCS = process.env.USE_GCS_PROMPTS === 'true';
    
    if (useGCS) {
      try {
        const prompts = await this._loadFromGCS();
        this.cache = prompts;
        this.cacheTimestamp = Date.now();
        console.log(`[GCSPromptLoader] Loaded from GCS: gs://${this.bucketName}/${this.promptsFile}`);
        return prompts;
      } catch (error) {
        console.warn(`[GCSPromptLoader] GCS failed, using local: ${error.message}`);
      }
    }

    // Fallback to local
    const prompts = this._loadFromLocal();
    this.cache = prompts;
    this.cacheTimestamp = Date.now();
    if (useGCS) {
      console.log(`[GCSPromptLoader] Fallback to local: ${this.localFallbackPath}`);
    } else {
      console.log(`[GCSPromptLoader] Loaded from local: ${this.localFallbackPath}`);
    }
    return prompts;
  }

  /**
   * Get all prompts configuration
   */
  async getPrompts() {
    return this.loadPrompts();
  }

  /**
   * Get global rules
   */
  async getGlobalRules() {
    const prompts = await this.loadPrompts();
    return prompts.globalRules || {};
  }

  /**
   * Get a specific agent configuration
   */
  async getAgent(agentName) {
    const prompts = await this.loadPrompts();
    
    if (!prompts.agents || !prompts.agents[agentName]) {
      const available = prompts.agents ? Object.keys(prompts.agents).join(', ') : 'none';
      throw new Error(`Agent "${agentName}" not found. Available: ${available}`);
    }
    
    return prompts.agents[agentName];
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = null;
    console.log('[GCSPromptLoader] Cache cleared');
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    return {
      isCached: !!this.cache,
      cacheAge: this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null,
      cacheTTL: this.cacheTTL,
      isValid: this._isCacheValid(),
      lastSource: this.lastSource,
    };
  }

  /**
   * Upload prompts to GCS (admin use)
   */
  async uploadPrompts(prompts) {
    this._initGCS();
    
    const file = this._bucket.file(this.promptsFile);
    const content = JSON.stringify(prompts, null, 2);
    
    await file.save(content, {
      contentType: 'application/json',
      metadata: { cacheControl: 'no-cache' },
    });
    
    this.clearCache();
    console.log(`[GCSPromptLoader] Uploaded to GCS: gs://${this.bucketName}/${this.promptsFile}`);
    return true;
  }

  /**
   * Sync local prompts to GCS
   */
  async syncLocalToGCS() {
    const localPrompts = this._loadFromLocal();
    await this.uploadPrompts(localPrompts);
    return localPrompts;
  }
}

// Singleton instance
let loaderInstance = null;

/**
 * Get the singleton prompt loader instance (sync)
 */
export function getPromptLoader() {
  if (!loaderInstance) {
    loaderInstance = new GCSPromptLoader();
  }
  return loaderInstance;
}

/**
 * Preload prompts on startup (call this in server.js)
 */
export async function preloadPrompts() {
  const loader = getPromptLoader();
  await loader.loadPrompts();
  return loader;
}

/**
 * Create a new loader instance with custom options
 */
export function createPromptLoader(options) {
  return new GCSPromptLoader(options);
}

export default GCSPromptLoader;
