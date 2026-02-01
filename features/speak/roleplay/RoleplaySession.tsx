'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleplayScenario, ChatMessage } from '@/types/conversation';
import { AudioManager, BrowserTTSManager } from '@/lib/speech/audio.manager';

const styles = {
  Container: {
    width: '100%',
    height: '100%', // Fill the MainContent area
    backgroundColor: '#161616',
    display: 'flex',
    flexDirection: 'row' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  } as React.CSSProperties,

  ChatSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0, // Allows flex to shrink
    height: '100%',
    overflow: 'hidden' as const,
    position: 'relative' as const,
  } as React.CSSProperties,

  TranslationPanel: {
    width: '400px',
    backgroundColor: '#1f1f1f',
    borderLeft: '1px solid #313131',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden' as const,
    flexShrink: 0,
    position: 'relative' as const,
  } as React.CSSProperties,

  TranslationHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #313131',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  } as React.CSSProperties,

  TranslationTitle: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 600,
  } as React.CSSProperties,

  CloseButton: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  TranslationContent: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    minHeight: 0, // Important for flex scrolling
  } as React.CSSProperties,

  TranslationEmpty: {
    color: '#a0a0a0',
    fontSize: '14px',
    textAlign: 'center' as const,
    marginTop: '40px',
  } as React.CSSProperties,

  TranslationSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,

  TranslationLabel: {
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  TranslationText: {
    color: '#ffffff',
    fontSize: '15px',
    lineHeight: '24px',
    padding: '16px',
    backgroundColor: '#262626',
    borderRadius: '8px',
    border: '1px solid #313131',
  } as React.CSSProperties,

  Header: {
    padding: '16px 20px',
    borderBottom: '1px solid #313131',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f1f1f',
    flexShrink: 0,
  } as React.CSSProperties,

  HeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  BackButton: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  HeaderTitle: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 600,
  } as React.CSSProperties,

  HeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  IconButton: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  ProfileSection: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #313131',
    backgroundColor: '#1f1f1f',
    flexShrink: 0,
  } as React.CSSProperties,

  ThemeLabel: {
    color: '#a0a0a0',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  ThemeText: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
  } as React.CSSProperties,

  MessagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    width: '100%',
    minHeight: 0, // Important for flex scrolling
    // Hide scrollbar but keep scrolling functionality
    scrollbarWidth: 'none' as const, // Firefox
    msOverflowStyle: 'none' as const, // IE and Edge
  } as React.CSSProperties,

  MessageWrapper: {
    display: 'flex',
    width: '100%',
  } as React.CSSProperties,

  MessageWrapperAI: {
    justifyContent: 'flex-start' as const,
  } as React.CSSProperties,

  MessageWrapperUser: {
    justifyContent: 'flex-end' as const,
  } as React.CSSProperties,

  MessageBubble: {
    maxWidth: '75%',
    borderRadius: '16px',
    padding: '12px 16px',
    wordWrap: 'break-word' as const,
  } as React.CSSProperties,

  MessageBubbleAI: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: '4px',
  } as React.CSSProperties,

  MessageBubbleUser: {
    backgroundColor: '#8b5cf6',
    borderBottomRightRadius: '4px',
  } as React.CSSProperties,

  MessageText: {
    color: '#000000',
    fontSize: '15px',
    lineHeight: '22px',
    margin: 0,
  } as React.CSSProperties,

  MessageTextUser: {
    color: '#ffffff',
  } as React.CSSProperties,

  MessageActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,

  MessageActionsUser: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  } as React.CSSProperties,

  ActionButton: {
    background: 'transparent',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#000000',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  ActionButtonUser: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  SuggestedResponses: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginTop: '12px',
  } as React.CSSProperties,

  SuggestedResponseButton: {
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#000000',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background-color 0.2s',
    maxWidth: '75%',
  } as React.CSSProperties,

  SuggestedResponsesWrapper: {
    display: 'flex',
    justifyContent: 'flex-end' as const,
    width: '100%',
  } as React.CSSProperties,

  InputContainer: {
    padding: '16px 20px',
    borderTop: '1px solid #313131',
    backgroundColor: '#1f1f1f',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,

  InputButtons: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,

  InputButton: {
    backgroundColor: '#262626',
    border: '1px solid #313131',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
  } as React.CSSProperties,

  InputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  Input: {
    flex: 1,
    backgroundColor: '#161616',
    border: '1px solid #313131',
    borderRadius: '24px',
    padding: '12px 50px 12px 20px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  SendButton: {
    position: 'absolute' as const,
    right: '8px',
    background: '#8b5cf6',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    transition: 'background-color 0.2s, transform 0.2s',
  } as React.CSSProperties,

  LoadingIndicator: {
    color: '#a0a0a0',
    fontSize: '14px',
    padding: '12px 16px',
    alignSelf: 'flex-start',
  } as React.CSSProperties,
};

interface RoleplaySessionProps {
  scenario: RoleplayScenario;
}

interface Translation {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export default function RoleplaySession({ scenario }: RoleplaySessionProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const browserTTSRef = useRef<BrowserTTSManager | null>(null);
  const messageAudioCacheRef = useRef<Map<string, string>>(new Map()); // Cache audio URLs by message ID

  const generateInitialSuggestions = useCallback(async (aiMessage: string) => {
    try {
      const response = await fetch('/api/roleplay/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: [],
          aiMessage,
          count: 3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const suggestions = data.suggestedResponses || [];
        // Update the initial message with suggestions
        setMessages((prev) => {
          if (prev.length > 0 && prev[0].id === 'initial') {
            return [
              { ...prev[0], suggestedResponses: suggestions },
              ...prev.slice(1),
            ];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error generating initial suggestions:', error);
    }
  }, []);

  // Initialize audio managers
  useEffect(() => {
    audioManagerRef.current = new AudioManager();
    browserTTSRef.current = new BrowserTTSManager();

    return () => {
      // Cleanup on unmount
      audioManagerRef.current?.cleanup();
      browserTTSRef.current?.cleanup();
      // Clean up cached audio URLs
      messageAudioCacheRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      messageAudioCacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    // Initialize with the scenario's initial message
    if (messages.length === 0 && scenario.initialMessage) {
      const initialMessage: ChatMessage = {
        id: 'initial',
        role: 'assistant',
        content: scenario.initialMessage,
        timestamp: new Date(),
        suggestedResponses: [],
      };
      setMessages([initialMessage]);
      // Generate initial suggested responses
      generateInitialSuggestions(scenario.initialMessage);
      // Auto-play TTS for initial message
      playMessageAudio(initialMessage);
    }
  }, [scenario, messages.length, generateInitialSuggestions]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Mark that user has sent their first message
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/roleplay/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          conversationHistory: updatedMessages,
          userMessage: messageText,
          language: scenario.language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.aiMessage,
        timestamp: new Date(),
        // Don't include suggested responses for subsequent messages
        suggestedResponses: [],
      };

      setMessages([...updatedMessages, aiMessage]);
      
      // Auto-play TTS for the new AI message
      playMessageAudio(aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestedResponseClick = (suggestion: string) => {
    // Mark that user has sent their first message
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    sendMessage(suggestion);
  };

  const handleSuggestResponse = async () => {
    // Get the last AI message
    const lastAIMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
    if (!lastAIMessage) return;

    try {
      const response = await fetch('/api/roleplay/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: messages,
          aiMessage: lastAIMessage.content,
          count: 1,
          scenarioId: scenario.id,
          language: scenario.language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const suggestions = data.suggestedResponses || [];
        if (suggestions.length > 0) {
          // Fill the input field with the suggestion, but don't send it
          setInputValue(suggestions[0]);
        }
      }
    } catch (error) {
      console.error('Error getting suggested response:', error);
    }
  };

  const handleAnotherQuestion = async () => {
    // Ask the AI to ask another question
    const prompt = 'Hazme otra pregunta interesante sobre este tema.';
    sendMessage(prompt);
  };

  /**
   * Play audio for a message (TTS)
   */
  const playMessageAudio = useCallback(async (message: ChatMessage) => {
    if (message.role !== 'assistant' || !message.content.trim()) {
      return;
    }

    // Stop any currently playing audio
    audioManagerRef.current?.stop();
    browserTTSRef.current?.stop();
    setIsPlayingAudio(true);

    try {
      // Check if we have cached audio for this message
      const cachedUrl = messageAudioCacheRef.current.get(message.id);
      
      if (cachedUrl) {
        // Use cached audio
        await audioManagerRef.current?.playAudio(cachedUrl);
        setIsPlayingAudio(false);
        return;
      }

      // Fetch TTS audio from API
      const response = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          language: scenario.language,
          speakingRate: 1.0, // Normal speed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If browser TTS fallback is suggested
        if (errorData.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(message.content, scenario.language);
          setIsPlayingAudio(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Check if response is JSON (browser TTS fallback)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.method === 'browser' && browserTTSRef.current) {
          await browserTTSRef.current.speak(message.content, scenario.language);
          setIsPlayingAudio(false);
          return;
        }
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      messageAudioCacheRef.current.set(message.id, audioUrl);
      
      // Play the audio
      await audioManagerRef.current?.playAudio(audioUrl);
    } catch (error) {
      console.error('Error playing message audio:', error);
      // Fallback to browser TTS if available
      if (browserTTSRef.current) {
        try {
          await browserTTSRef.current.speak(message.content, scenario.language);
        } catch (browserError) {
          console.error('Browser TTS also failed:', browserError);
        }
      }
    } finally {
      setIsPlayingAudio(false);
    }
  }, [scenario.language]);

  /**
   * Handle replay button click - replay audio for a specific message
   */
  const handleReplay = useCallback((message: ChatMessage) => {
    playMessageAudio(message);
  }, [playMessageAudio]);

  const handleTranslate = async (message: ChatMessage) => {
    setIsTranslating(true);
    try {
      const response = await fetch('/api/roleplay/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          sourceLang: scenario.language,
          targetLang: 'en', // Translate to English
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslation({
          originalText: data.originalText,
          translatedText: data.translatedText,
          sourceLanguage: data.sourceLanguage,
          targetLanguage: data.targetLanguage,
        });
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to translate' }));
        console.error('Translation error:', error);
        // Could show a toast notification here instead
      }
    } catch (error) {
      console.error('Error translating message:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'es': 'Spanish',
      'en': 'English',
      'fr': 'French',
      'de': 'German',
    };
    return languages[code] || code.toUpperCase();
  };

  return (
    <>
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .messages-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div style={styles.Container}>
      {/* Chat Section */}
      <div style={styles.ChatSection}>
        {/* Header */}
        <div style={styles.Header}>
        <div style={styles.HeaderLeft}>
          <button
            style={styles.BackButton}
            onClick={() => router.push('/speak/roleplay')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 style={styles.HeaderTitle}>Chat</h2>
        </div>
        <div style={styles.HeaderRight}>
          <button
            style={styles.IconButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343a9 9 0 000 12.728M9.172 9.172a5 5 0 000 7.071" />
            </svg>
          </button>
          <button
            style={styles.IconButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Theme Section */}
      <div style={styles.ProfileSection}>
        <div style={styles.ThemeLabel}>Theme</div>
        <div style={styles.ThemeText}>{scenario.title}</div>
      </div>

        {/* Messages */}
        <div style={styles.MessagesContainer} ref={messagesContainerRef} className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.MessageWrapper,
                ...(message.role === 'assistant'
                  ? styles.MessageWrapperAI
                  : styles.MessageWrapperUser),
              }}
            >
              <div
                style={{
                  ...styles.MessageBubble,
                  ...(message.role === 'assistant'
                    ? styles.MessageBubbleAI
                    : styles.MessageBubbleUser),
                }}
              >
                <p
                  style={{
                    ...styles.MessageText,
                    ...(message.role === 'user' ? styles.MessageTextUser : {}),
                  }}
                >
                  {message.content}
                </p>
                {message.role === 'assistant' && (
                  <div style={styles.MessageActions}>
                    <button
                      style={styles.ActionButton}
                      onClick={() => handleReplay(message)}
                      disabled={isPlayingAudio}
                      onMouseEnter={(e) => {
                        if (!isPlayingAudio) {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.5 2.5L21 8M3 12v4m0-4h4m13-4v4m0-4h-4" />
                      </svg>
                      {isPlayingAudio ? 'Playing...' : 'Replay'}
                    </button>
                    <button
                      style={styles.ActionButton}
                      onClick={() => handleTranslate(message)}
                      disabled={isTranslating}
                      onMouseEnter={(e) => {
                        if (!isTranslating) {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v18M3 12h18" />
                      </svg>
                      {isTranslating ? 'Translating...' : 'Translate'}
                    </button>
                  </div>
                )}
                {message.role === 'user' && (
                  <div style={styles.MessageActionsUser}>
                    <button
                      style={styles.ActionButtonUser}
                      onClick={() => handleTranslate(message)}
                      disabled={isTranslating}
                      onMouseEnter={(e) => {
                        if (!isTranslating) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v18M3 12h18" />
                      </svg>
                      {isTranslating ? 'Translating...' : 'Translate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Show suggested responses only for the initial message and only before user sends first message */}
          {!hasUserSentMessage && messages.length > 0 && messages[0].id === 'initial' && messages[0].suggestedResponses && messages[0].suggestedResponses.length > 0 && (
            <div key={`suggestions-initial`} style={styles.SuggestedResponsesWrapper}>
              <div style={styles.SuggestedResponses}>
                {messages[0].suggestedResponses.map((suggestion, index) => (
                  <button
                    key={index}
                    style={styles.SuggestedResponseButton}
                    onClick={() => handleSuggestedResponseClick(suggestion)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isLoading && (
            <div style={styles.LoadingIndicator}>Emma is typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.InputContainer}>
          {/* Action Buttons */}
          <div style={styles.InputButtons}>
            <button
              type="button"
              style={styles.InputButton}
              onClick={handleAnotherQuestion}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#313131';
                  e.currentTarget.style.borderColor = '#404040';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#262626';
                e.currentTarget.style.borderColor = '#313131';
              }}
            >
              Another question
            </button>
            <button
              type="button"
              style={styles.InputButton}
              onClick={handleSuggestResponse}
              disabled={isLoading || messages.length === 0}
              onMouseEnter={(e) => {
                if (!isLoading && messages.length > 0) {
                  e.currentTarget.style.backgroundColor = '#313131';
                  e.currentTarget.style.borderColor = '#404040';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#262626';
                e.currentTarget.style.borderColor = '#313131';
              }}
            >
              Suggest a response
            </button>
          </div>

          {/* Input Field */}
          <form onSubmit={handleSubmit} style={styles.InputWrapper}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Aa"
              style={styles.Input}
              disabled={isLoading}
            />
            <button
              type="submit"
              style={styles.SendButton}
              disabled={isLoading || !inputValue.trim()}
              onMouseEnter={(e) => {
                if (!isLoading && inputValue.trim()) {
                  e.currentTarget.style.backgroundColor = '#7c3aed';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8b5cf6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Translation Panel */}
      <div style={styles.TranslationPanel}>
        <div style={styles.TranslationHeader}>
          <h3 style={styles.TranslationTitle}>Translation</h3>
          {translation && (
            <button
              style={styles.CloseButton}
              onClick={() => setTranslation(null)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div style={styles.TranslationContent}>
          {translation ? (
            <>
              <div style={styles.TranslationSection}>
                <div style={styles.TranslationLabel}>
                  {getLanguageName(translation.sourceLanguage)}
                </div>
                <div style={styles.TranslationText}>
                  {translation.originalText}
                </div>
              </div>
              <div style={styles.TranslationSection}>
                <div style={styles.TranslationLabel}>
                  {getLanguageName(translation.targetLanguage)}
                </div>
                <div style={styles.TranslationText}>
                  {translation.translatedText}
                </div>
              </div>
            </>
          ) : (
            <div style={styles.TranslationEmpty}>
              Click "Translate" on any message to see its translation here
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
