import express from 'express';
import { getPromptLoader } from '../services/gcs-prompt-loader.js';

const router = express.Router();

/**
 * GET /api/prompts/status
 * Get current prompt loader status (cache, source, etc.)
 */
router.get('/status', async (req, res) => {
  try {
    const loader = await getPromptLoader();
    const status = loader.getCacheStatus();
    
    res.json({
      success: true,
      status: {
        ...status,
        bucketName: loader.bucketName,
        promptsFile: loader.promptsFile,
        useGCS: process.env.USE_GCS_PROMPTS === 'true',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/prompts/agents
 * List all available agents
 */
router.get('/agents', async (req, res) => {
  try {
    const loader = await getPromptLoader();
    const prompts = await loader.getPrompts();
    const agents = Object.keys(prompts.agents || {});
    
    res.json({
      success: true,
      agents,
      count: agents.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/prompts/agents/:name
 * Get a specific agent's configuration
 */
router.get('/agents/:name', async (req, res) => {
  try {
    const loader = await getPromptLoader();
    const agent = await loader.getAgent(req.params.name);
    
    res.json({ success: true, agent });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/prompts/refresh
 * Force refresh prompts from source (GCS or local)
 */
router.post('/refresh', async (req, res) => {
  try {
    const loader = await getPromptLoader();
    loader.clearCache();
    await loader.loadPrompts(true);
    
    res.json({
      success: true,
      message: 'Prompts refreshed',
      source: loader.lastSource,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/prompts/sync-to-gcs
 * Upload local prompts to GCS (admin only)
 */
router.post('/sync-to-gcs', async (req, res) => {
  try {
    if (process.env.USE_GCS_PROMPTS !== 'true') {
      return res.status(400).json({
        success: false,
        error: 'GCS is not enabled. Set USE_GCS_PROMPTS=true',
      });
    }
    
    const loader = await getPromptLoader();
    await loader.syncLocalToGCS();
    
    res.json({
      success: true,
      message: `Synced to gs://${loader.bucketName}/${loader.promptsFile}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/prompts/global-rules
 * Get global rules configuration
 */
router.get('/global-rules', async (req, res) => {
  try {
    const loader = await getPromptLoader();
    const rules = await loader.getGlobalRules();
    
    res.json({ success: true, globalRules: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
