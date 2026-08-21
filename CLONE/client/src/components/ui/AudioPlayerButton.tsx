import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import api from '@/api/client';

interface AudioPlayerButtonProps {
  text: string;
  lang?: 'kz' | 'ru' | 'en' | 'de' | 'KZ' | 'RU' | 'EN';
  voice?: string;
  variant?: 'default' | 'compact' | 'ghost' | 'pill' | 'secondary';
  size?: 'sm' | 'default' | 'icon-sm' | 'icon';
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  text,
  lang,
  voice,
  variant = 'secondary',
  size = 'sm',
  className,
  label,
  showLabel = true,
}) => {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Normalize language code to 'kk', 'ru', 'en', 'de'
  const activeLang = (lang || language || 'KZ').toLowerCase();
  const normalizedLang = activeLang === 'kz' ? 'kk' : activeLang === 'en' ? 'en' : activeLang === 'de' ? 'de' : 'ru';

  const defaultLabel =
    normalizedLang === 'kk'
      ? 'Тыңдау'
      : normalizedLang === 'ru'
      ? 'Озвучить'
      : normalizedLang === 'de'
      ? 'Anhören'
      : 'Listen';

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const playWithWebSpeechFallback = (textToSpeak: string, langCode: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('[TTS] Web Speech API not supported on this browser');
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = textToSpeak
      .replace(/\$([^\$]+)\$/g, '$1')
      .replace(/[\*\_\[\]]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode === 'kk' ? 'kk-KZ' : langCode === 'ru' ? 'ru-RU' : langCode === 'de' ? 'de-DE' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try finding appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang.substring(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      console.error('[TTS] Web Speech Error:', e);
      setIsPlaying(false);
      setIsLoading(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (!text || !text.trim()) return;

    setIsLoading(true);

    try {
      // 1. Request Edge Neural TTS from Backend
      const rawAxios = api.getRawClient();
      const response = await rawAxios.get('/tts/synthesize', {
        params: {
          text,
          lang: normalizedLang,
          voice,
        },
        responseType: 'blob',
        timeout: 10000,
      });

      // Check if backend returned JSON fallback or audio blob
      if (response.data.type && response.data.type.includes('application/json')) {
        // Parse json fallback
        const textData = await response.data.text();
        const parsed = JSON.parse(textData);
        console.info('[TTS] Backend requested Web Speech fallback:', parsed.message);
        playWithWebSpeechFallback(text, normalizedLang);
        return;
      }

      // Valid Audio Blob received
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (err) => {
        console.warn('[TTS] Audio element error, falling back to Web Speech:', err);
        playWithWebSpeechFallback(text, normalizedLang);
      };

      await audio.play();
    } catch (error) {
      console.warn('[TTS] Backend request failed, utilizing client Web Speech API fallback');
      playWithWebSpeechFallback(text, normalizedLang);
    }
  };

  return (
    <Button
      type="button"
      variant={isPlaying ? 'primary' : variant === 'pill' ? 'secondary' : (variant as any)}
      size={size}
      onClick={handleTogglePlay}
      className={cn(
        'relative inline-flex items-center gap-1.5 transition-all select-none',
        isPlaying && 'bg-primer-accent-emphasis text-white border-primer-accent-emphasis shadow-sm',
        variant === 'pill' && 'rounded-full px-2.5 py-0.5 text-xs font-medium border border-primer-border-default',
        className
      )}
      title={isPlaying ? 'Тоқтату (Stop)' : `${defaultLabel} (Edge Neural TTS)`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primer-accent-fg" />
      ) : isPlaying ? (
        /* Animated Sound Wave Bars */
        <div className="flex items-center gap-0.5 h-3.5 px-0.5">
          <span className="w-0.5 h-full bg-white rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" />
          <span className="w-0.5 h-3/4 bg-white rounded-full animate-[soundwave_0.8s_ease-in-out_0.2s_infinite]" />
          <span className="w-0.5 h-full bg-white rounded-full animate-[soundwave_0.8s_ease-in-out_0.4s_infinite]" />
          <span className="w-0.5 h-1/2 bg-white rounded-full animate-[soundwave_0.8s_ease-in-out_0.1s_infinite]" />
        </div>
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-primer-fg-muted hover:text-primer-fg-default shrink-0" />
      )}

      {showLabel && (
        <span className="text-[11px] font-medium leading-none">
          {isPlaying ? 'Ойнатылуда...' : label || defaultLabel}
        </span>
      )}
    </Button>
  );
};

export default AudioPlayerButton;
