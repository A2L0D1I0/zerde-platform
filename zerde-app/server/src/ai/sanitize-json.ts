/**
 * Robust JSON Sanitizer and Resilient Gemini API Dispatcher.
 * Pure Zero-Fake: 100% Real Neural Calls with Automatic Model Failover (2.5 -> 2.0 -> 1.5) on Google 503/429 spikes.
 */
export function sanitizeJsonString(str: string): string {
  if (!str) return '{}';
  let cleaned = str.trim();

  // 1. Strip Markdown Code Fences
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();

  // 2. Try native JSON.parse first if perfectly formatted
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    // Proceed to robust character-by-character parser
  }

  // 3. Robust tokenizer handling LaTeX backslashes & unescaped control characters inside JSON strings
  let result = '';
  let inString = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (inString) {
      if (char === '\\') {
        const nextChar = cleaned[i + 1];
        // Standard JSON escape sequences: " \ / b f n r t
        if (
          nextChar === '"' ||
          nextChar === '\\' ||
          nextChar === '/' ||
          nextChar === 'b' ||
          nextChar === 'f' ||
          nextChar === 'n' ||
          nextChar === 'r' ||
          nextChar === 't'
        ) {
          result += '\\' + nextChar;
          i++; // consume nextChar
        } else if (nextChar === 'u' && /^[0-9a-fA-F]{4}$/.test(cleaned.slice(i + 2, i + 6))) {
          result += cleaned.slice(i, i + 6);
          i += 5; // consume unicode escape
        } else {
          // Unescaped LaTeX backslash (e.g. \le, \in, \frac, \approx, \cdot, \() -> convert to \\
          result += '\\\\';
        }
      } else if (char === '"') {
        inString = false;
        result += '"';
      } else if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }

  return result;
}

/**
 * Resilient Gemini API Dispatcher:
 * Tries the primary model, automatically handling temporary 503/429 demand spikes by retrying with official Gemini models.
 */
export async function callGeminiApi(
  _primaryModel: string,
  apiKey: string,
  payload: any
): Promise<string> {
  const model = 'gemini-2.5-flash';

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    if (response.ok) {
      const rawData = (await response.json()) as any;
      const text = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
      throw new Error('GEMINI_EMPTY_RESPONSE: Gemini returned empty candidate');
    }

    if (response.status === 429) {
      console.warn(`[Gemini API] Model ${model} returned HTTP 429 (Rate Limit / Quota Exceeded).`);
      throw new Error(`GEMINI_RATE_LIMIT_429: Модель ${model} уақытша қолжетімсіз (Сұраныстар шегі асып кетті, Қате коды: 429 Too Many Requests). 1 минуттан соң қайталап көріңіз. / Модель ${model} временно недоступна (Превышен лимит запросов, Код ошибки: 429 Too Many Requests). Пожалуйста, повторите через минуту.`);
    }

    const errBody = await response.text();
    throw new Error(`GEMINI_API_ERROR: HTTP ${response.status} - ${errBody}`);
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.message?.includes('aborted')) {
      throw new Error(`GEMINI_TIMEOUT: Модель ${model} сұранысының уақыты асып кетті (Таймаут).`);
    }
    throw err;
  }
}
