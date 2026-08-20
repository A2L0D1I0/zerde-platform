import { Router, Request, Response } from 'express';
import { execFile, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const router = Router();

// Neural Voices Catalog
export const NEURAL_VOICES: Record<string, { default: string; male?: string; female?: string; name: string }> = {
  kk: {
    default: 'kk-KZ-DauletNeural',
    male: 'kk-KZ-DauletNeural',
    female: 'kk-KZ-AigulNeural',
    name: 'Қазақ тілі (Kazakh Neural)'
  },
  ru: {
    default: 'ru-RU-DmitryNeural',
    male: 'ru-RU-DmitryNeural',
    female: 'ru-RU-SvetlanaNeural',
    name: 'Русский язык (Russian Neural)'
  },
  en: {
    default: 'en-US-GuyNeural',
    male: 'en-US-GuyNeural',
    female: 'en-US-JennyNeural',
    name: 'English US (Neural)'
  },
  de: {
    default: 'de-DE-KillianNeural',
    male: 'de-DE-KillianNeural',
    female: 'de-DE-KatjaNeural',
    name: 'Deutsch (German Neural)'
  }
};

/**
 * Clean text for TTS synthesis (clean markdown, LaTeX formatting to readable words)
 */
function cleanTextForSpeech(text: string, lang: string): string {
  if (!text) return '';

  let cleaned = text
    // Replace markdown bold / italics
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Replace common LaTeX patterns for better pronunciation
    .replace(/\$([^\$]+)\$/g, (match, formula) => {
      let f = formula;
      f = f.replace(/\\cdot/g, ' көбейту ')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 бөлінген $2')
        .replace(/\\le/g, ' кіші немесе тең ')
        .replace(/\\ge/g, ' үлкен немесе тең ')
        .replace(/\\neq/g, ' тең емес ')
        .replace(/\\cup/g, ' бірігуі ')
        .replace(/\\infty/g, ' шексіздік ')
        .replace(/\\pm/g, ' плюс-минус ')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\/g, '');
      return f;
    })
    .replace(/\[\s*👁️\s*.*?\]/g, '') // remove inspect button tags
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

/**
 * GET /api/tts/voices
 * List available neural voices & TTS status
 */
router.get('/voices', (req: Request, res: Response) => {
  res.json({
    success: true,
    engine: 'Microsoft Edge Neural TTS',
    supported_languages: ['kk', 'ru', 'en', 'de'],
    voices: NEURAL_VOICES
  });
});

/**
 * GET /api/tts/synthesize
 * Synthesizes neural audio or returns fallback for Web Speech API
 * Query params:
 *  - text: string
 *  - lang: 'kk' | 'ru' | 'en' | 'de' (default: 'kk')
 *  - voice: optional explicit voice name (e.g. 'kk-KZ-DauletNeural', 'kk-KZ-AigulNeural')
 */
router.get('/synthesize', async (req: Request, res: Response) => {
  const rawText = (req.query.text as string) || '';
  const lang = ((req.query.lang as string) || 'kk').toLowerCase();
  const explicitVoice = req.query.voice as string | undefined;

  if (!rawText.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Синтез үшін мәтін берілмеді (Text parameter is required)'
    });
  }

  const textToSpeak = cleanTextForSpeech(rawText, lang);

  // Select appropriate neural voice
  const langConfig = NEURAL_VOICES[lang] || NEURAL_VOICES.kk;
  const voice = explicitVoice || langConfig.default;

  // Generate unique temp file path
  const tempDir = os.tmpdir();
  const tempFileName = `zerde_tts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp3`;
  const tempFilePath = path.join(tempDir, tempFileName);

  try {
    // Attempt python -m edge_tts execution
    await new Promise<void>((resolve, reject) => {
      const child = spawn('python', [
        '-m',
        'edge_tts',
        '--text',
        textToSpeak,
        '--voice',
        voice,
        '--write-media',
        tempFilePath
      ], {
        timeout: 10000
      });

      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        reject(err);
      });

      child.on('close', (code) => {
        if (code === 0 && fs.existsSync(tempFilePath)) {
          resolve();
        } else {
          reject(new Error(`edge-tts exited with code ${code}: ${stderr}`));
        }
      });
    });

    // Successfully generated audio file -> stream to client
    const stat = fs.statSync(tempFilePath);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size,
      'Cache-Control': 'public, max-age=3600',
      'X-TTS-Engine': 'Edge-Neural-TTS',
      'X-TTS-Voice': voice,
      'X-TTS-Lang': lang
    });

    const readStream = fs.createReadStream(tempFilePath);
    readStream.pipe(res);

    readStream.on('close', () => {
      // Clean up temp file
      fs.unlink(tempFilePath, () => {});
    });

    readStream.on('error', (err) => {
      console.error('[TTS] Stream error:', err);
      fs.unlink(tempFilePath, () => {});
    });

  } catch (err: any) {
    console.warn('[TTS] edge-tts unavailable or failed, signalling Web Speech API fallback:', err.message);

    // Clean up if temp file was partially written
    if (fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (_) {}
    }

    // Return status for client-side Web Speech API fallback
    return res.status(200).json({
      success: false,
      fallback: 'web_speech_api',
      message: 'Edge Neural TTS server generation unavailable. Client Web Speech API fallback recommended.',
      text: textToSpeak,
      lang: lang,
      suggested_voice: voice,
      error_detail: err.message
    });
  }
});

export default router;
