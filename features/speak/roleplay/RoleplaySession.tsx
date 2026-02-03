'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleplayScenario, ChatMessage } from '@/types/conversation';
import { AudioManager, BrowserTTSManager } from '@/lib/speech/audio.manager';
import { useAuth } from '@/components/AuthProvider';

const styles = {
  Container: {
    width: '100%',
    height: '100%', // Fill the MainContent area
    backgroundColor: '#161616',
    display: 'flex',
    flexDirection: 'row' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    overscrollBehavior: 'none' as any,
  } as React.CSSProperties,

  ChatSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0, // Allows flex to shrink
    height: '100%',
    overflow: 'hidden' as const,
    position: 'relative' as const,
    overscrollBehavior: 'none' as any,
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
    overscrollBehavior: 'none' as any,
    transition: 'width 0.3s ease, border 0.3s ease',
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

  ToggleButton: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    marginLeft: 'auto',
    marginRight: '8px',
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
    overscrollBehavior: 'none' as any, // Prevent bouncy scroll on touchpad
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
    gap: '16px',
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

  HeaderMiddle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    justifyContent: 'center',
  } as React.CSSProperties,

  LanguageButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1f1f1f',
    border: '1px solid #313131',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    outline: 'none',
  } as React.CSSProperties,

  FlagIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(to bottom, #aa151b 0%, #aa151b 25%, #f1bf00 25%, #f1bf00 50%, #aa151b 50%, #aa151b 75%, #f1bf00 75%, #f1bf00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  } as React.CSSProperties,

  ProfilePicture: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
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
    // Low-profile scrollbar styling
    scrollbarWidth: 'thin' as const, // Firefox
    scrollbarColor: '#404040 transparent' as any, // Firefox
    overscrollBehavior: 'none' as any, // Prevent bouncy scroll on touchpad
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
    backgroundColor: '#8b5cf6',
    border: '1px solid #8b5cf6',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#ffffff',
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
    width: '100%',
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
    position: 'relative' as const,
    zIndex: 1,
  } as React.CSSProperties,

  InputRecording: {
    flex: 1,
    backgroundColor: '#161616',
    border: '1px solid #8b5cf6',
    borderRadius: '24px',
    padding: '12px 50px 12px 50px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
  } as React.CSSProperties,

  VolumeBarsContainer: {
    position: 'absolute' as const,
    left: '50px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    height: '20px',
    zIndex: 2,
    pointerEvents: 'none' as const,
  } as React.CSSProperties,

  VolumeBar: {
    width: '3px',
    backgroundColor: '#8b5cf6',
    borderRadius: '2px',
    transition: 'height 0.1s ease-out',
    minHeight: '4px',
    maxHeight: '20px',
  } as React.CSSProperties,

  SendButton: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
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
    zIndex: 20,
    pointerEvents: 'auto' as const,
  } as React.CSSProperties,

  MicrophoneButton: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#262626',
    border: '2px solid #404040',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    transition: 'background-color 0.2s, transform 0.2s, border-color 0.2s',
    zIndex: 20,
    pointerEvents: 'auto' as const,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  } as React.CSSProperties,

  MicrophoneButtonRecording: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    animation: 'pulse 1.5s ease-in-out infinite',
    zIndex: 20,
    pointerEvents: 'auto' as const,
  } as React.CSSProperties,

  TrashButton: {
    position: 'absolute' as const,
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ef4444',
    transition: 'background-color 0.2s, transform 0.2s',
    zIndex: 20,
    pointerEvents: 'auto' as const,
  } as React.CSSProperties,

  TypingIndicator: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: '12px',
  } as React.CSSProperties,

  TypingBubble: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    padding: '12px 16px',
    maxWidth: '75px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  } as React.CSSProperties,

  TypingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#999999',
    animation: 'typingDot 1.4s infinite ease-in-out',
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
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isTranslationPanelCollapsed, setIsTranslationPanelCollapsed] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('ES');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0-100 for animation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const browserTTSRef = useRef<BrowserTTSManager | null>(null);
  const messageAudioCacheRef = useRef<Map<string, string>>(new Map()); // Cache audio URLs by message ID
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeAnimationRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  const getUserInitials = (): string => {
    if (!user) return 'U';
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      if (parts.length === 1 && parts[0].length >= 2) {
        return parts[0].substring(0, 2).toUpperCase();
      }
    }
    if (user.email) {
      const emailParts = user.email.split('@');
      const localPart = emailParts[0];
      if (localPart.includes('.') || localPart.includes('_') || localPart.includes('-')) {
        const parts = localPart.split(/[._-]/);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
      }
      if (localPart.length >= 2) {
        return localPart.substring(0, 2).toUpperCase();
      }
      return localPart[0].toUpperCase();
    }
    return 'U';
  };

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


  /**
   * Load session from database if sessionId exists
   */
  const loadSession = useCallback(async (id: string) => {
    setIsLoadingSession(true);
    try {
      const response = await fetch(`/api/roleplay/sessions/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.session && data.session.messages) {
          // Load all messages from the session
          const loadedMessages = data.session.messages || [];
          console.log(`Loaded ${loadedMessages.length} messages from session ${id}`);
          setMessages(loadedMessages);
          setHasUserSentMessage(loadedMessages.some((msg: ChatMessage) => msg.role === 'user'));
          return true;
        } else {
          console.warn(`Session ${id} has no messages`);
          return false;
        }
      } else {
        console.error(`Failed to load session ${id}:`, response.status);
        return false;
      }
    } catch (error) {
      console.error('Error loading session:', error);
      return false;
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  /**
   * Create a new session in the database
   */
  const createNewSession = useCallback(async () => {
    try {
      const response = await fetch('/api/roleplay/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          language: scenario.language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSessionId = data.sessionId;
        setSessionId(newSessionId);
        
        // Store sessionId in localStorage for this scenario
        const storedSessionKey = `roleplay_session_${scenario.id}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem(storedSessionKey, newSessionId);
        }
        
        // Update URL with session ID
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('sessionId', newSessionId);
        router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
        
        return newSessionId;
      }
      return null;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }, [scenario.id, scenario.language, router]);

  /**
   * Save messages to database immediately (no debounce)
   * Used when we need to ensure messages are saved before navigation
   */
  const saveMessagesImmediately = useCallback(async (messagesToSave: ChatMessage[], targetSessionId?: string) => {
    const idToUse = targetSessionId || sessionId;
    if (!idToUse || messagesToSave.length === 0) return;

    try {
      const response = await fetch(`/api/roleplay/sessions/${idToUse}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSave.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            suggestedResponses: msg.suggestedResponses,
          })),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error saving messages to database:', error);
      } else {
        console.log(`Saved ${messagesToSave.length} messages to session ${idToUse}`);
      }
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [sessionId]);

  /**
   * Save messages to database
   * Saves all messages to ensure complete history is persisted
   */
  const saveMessagesToDatabase = useCallback(async (messagesToSave: ChatMessage[], targetSessionId?: string) => {
    const idToUse = targetSessionId || sessionId;
    if (!idToUse || messagesToSave.length === 0) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves - wait 500ms after last message
    // This ensures we save the complete message history, not just the latest message
    saveTimeoutRef.current = setTimeout(async () => {
      await saveMessagesImmediately(messagesToSave, idToUse);
    }, 500);
  }, [sessionId, saveMessagesImmediately]);

  // Save messages before navigation/unmount
  useEffect(() => {
    return () => {
      // Save messages before unmounting to ensure they're persisted
      if (sessionId && messages.length > 0) {
        // Clear any pending debounced save
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        // Save immediately before navigation (use current values from closure)
        const currentMessages = messages;
        const currentSessionId = sessionId;
        saveMessagesImmediately(currentMessages, currentSessionId).catch(console.error);
      }
    };
  }, [sessionId, messages.length, saveMessagesImmediately]);

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
    setPlayingMessageId(message.id);

    try {
      // Check if we have cached audio for this message
      const cachedUrl = messageAudioCacheRef.current.get(message.id);
      
      if (cachedUrl) {
        // Use cached audio
        await audioManagerRef.current?.playAudio(cachedUrl);
        setPlayingMessageId(null);
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
          setPlayingMessageId(null);
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
          setPlayingMessageId(null);
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
      setPlayingMessageId(null);
    }
  }, [scenario.language]);

  /**
   * Check for existing session for this scenario and load it
   * For anonymous users, we check localStorage for a stored sessionId
   */
  const checkAndLoadExistingSession = useCallback(async () => {
    if (isLoadingSession || sessionId || isInitializing) return;
    
    setIsLoadingSession(true);
    try {
      // First, check localStorage for a stored sessionId for this scenario
      const storedSessionKey = `roleplay_session_${scenario.id}`;
      const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem(storedSessionKey) : null;
      
      if (storedSessionId) {
        // Try to load the stored session
        const loaded = await loadSession(storedSessionId);
        if (loaded) {
          setSessionId(storedSessionId);
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('sessionId', storedSessionId);
          router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
          setIsLoadingSession(false);
          return true;
        } else {
          // Session doesn't exist, remove from localStorage
          localStorage.removeItem(storedSessionKey);
        }
      }
      
      // Try to get the latest session for this scenario from API (for authenticated users)
      const response = await fetch(`/api/roleplay/sessions?scenarioId=${scenario.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.session && data.session.id) {
          // Found existing session, load it
          setSessionId(data.session.id);
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('sessionId', data.session.id);
          router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
          await loadSession(data.session.id);
          setIsLoadingSession(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking for existing session:', error);
      return false;
    } finally {
      setIsLoadingSession(false);
    }
  }, [scenario.id, isLoadingSession, sessionId, isInitializing, loadSession, router]);

  /**
   * Reset the scenario - delete current session and start fresh
   */
  const resetScenario = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      // Delete the current session
      const response = await fetch(`/api/roleplay/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Clear localStorage
        const storedSessionKey = `roleplay_session_${scenario.id}`;
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storedSessionKey);
        }
        
        // Clear state
        setSessionId(null);
        setMessages([]);
        setHasUserSentMessage(false);
        
        // Remove sessionId from URL
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('sessionId');
        router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
        
        // Initialize with fresh session
        setIsInitializing(true);
        const initialMessage: ChatMessage = {
          id: 'initial',
          role: 'assistant',
          content: scenario.initialMessage,
          timestamp: new Date(),
          suggestedResponses: [],
        };
        setMessages([initialMessage]);
        generateInitialSuggestions(scenario.initialMessage);
        
        createNewSession().then((newSessionId) => {
          if (newSessionId) {
            // Store new sessionId in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(storedSessionKey, newSessionId);
            }
            saveMessagesToDatabase([initialMessage], newSessionId);
            setTimeout(() => {
              setIsInitializing(false);
            }, 1000);
          } else {
            setIsInitializing(false);
          }
        });
      }
    } catch (error) {
      console.error('Error resetting scenario:', error);
    }
  }, [sessionId, scenario, generateInitialSuggestions, createNewSession, saveMessagesToDatabase, router]);

  // Check for sessionId in URL on mount (but don't load if we're initializing)
  useEffect(() => {
    const urlSessionId = searchParams.get('sessionId');
    if (urlSessionId && urlSessionId !== sessionId && !isInitializing) {
      setSessionId(urlSessionId);
      // Store in localStorage
      const storedSessionKey = `roleplay_session_${scenario.id}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(storedSessionKey, urlSessionId);
      }
      loadSession(urlSessionId);
    } else if (!urlSessionId && !sessionId && !isLoadingSession && !isInitializing) {
      // No sessionId in URL, check for existing session for this scenario
      checkAndLoadExistingSession();
    }
  }, [searchParams, loadSession, sessionId, isInitializing, isLoadingSession, checkAndLoadExistingSession, scenario.id]);

  // Initialize with scenario's initial message if no session loaded
  // Only run this if we're not loading a session and have no messages
  useEffect(() => {
    // Don't initialize if:
    // - We're loading a session (wait for it to finish)
    // - We already have messages (session was loaded)
    // - We already have a sessionId (session exists)
    // - We're currently initializing
    if (isLoadingSession || messages.length > 0 || sessionId || isInitializing) {
      return;
    }

    // Only initialize if we have an initial message and no session
    if (scenario.initialMessage) {
      setIsInitializing(true);
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
      // Note: Auto-play removed for initial message due to browser autoplay policy
      // Users can manually click the play button to hear the initial message
      // Create session in database
      createNewSession().then((newSessionId) => {
        if (newSessionId) {
          // Store sessionId in localStorage for anonymous users
          const storedSessionKey = `roleplay_session_${scenario.id}`;
          if (typeof window !== 'undefined') {
            localStorage.setItem(storedSessionKey, newSessionId);
          }
          // Save initial message - pass sessionId directly
          saveMessagesToDatabase([initialMessage], newSessionId);
          // Set initializing to false after a short delay to ensure message is saved
          setTimeout(() => {
            setIsInitializing(false);
          }, 1000);
        } else {
          setIsInitializing(false);
        }
      });
    }
  }, [scenario.initialMessage, isLoadingSession, messages.length, sessionId, isInitializing, generateInitialSuggestions, createNewSession, saveMessagesToDatabase]);

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

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Auto-play TTS for the new AI message
      playMessageAudio(aiMessage);
      
      // Save messages to database
      if (sessionId) {
        saveMessagesToDatabase(finalMessages);
      } else {
        // If no session yet, create one
        const newSessionId = await createNewSession();
        if (newSessionId) {
          // Pass the new sessionId directly since state might not be updated yet
          saveMessagesToDatabase(finalMessages, newSessionId);
        }
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If recording, stop recording, transcribe, and send
    if (isRecording) {
      try {
        // Stop recording and get the audio blob
        const blob = await stopRecording();
        
        if (blob) {
          // Transcribe the audio
          const transcribedText = await transcribeAudio(blob);
          if (transcribedText.trim()) {
            // Send the transcribed text
            sendMessage(transcribedText);
            // Clear the input after sending
            setInputValue('');
          } else {
            alert('Could not transcribe audio. Please try again or type your message.');
          }
        } else {
          alert('No audio recorded. Please try again.');
        }
      } catch (error) {
        console.error('Error processing audio:', error);
        alert('Failed to process audio. Please try again or type your message.');
      }
    } else if (inputValue.trim()) {
      // Normal text message
      sendMessage(inputValue);
    }
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
   * Handle replay button click - replay audio for a specific message
   */
  const handleReplay = useCallback((message: ChatMessage) => {
    playMessageAudio(message);
  }, [playMessageAudio]);

  /**
   * Handle stop button click - stop currently playing audio
   */
  const handleStop = useCallback(() => {
    audioManagerRef.current?.stop();
    browserTTSRef.current?.stop();
    setPlayingMessageId(null);
  }, []);

  const handleTranslate = async (message: ChatMessage) => {
    // Auto-expand translation panel if collapsed
    if (isTranslationPanelCollapsed) {
      setIsTranslationPanelCollapsed(false);
    }
    
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

  // Audio Recording Functions
  const getSupportedMimeType = (): string | null => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return null;
  };

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported audio format found');
      }

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });
      mediaRecorderRef.current = mediaRecorder;

      // Reset state
      audioChunksRef.current = [];
      setAudioChunks([]);
      setRecordingDuration(0);
      setAudioBlob(null);

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk received:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
          setAudioChunks([...audioChunksRef.current]);
        } else {
          console.warn('Empty audio chunk received');
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', audioChunksRef.current.length);
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log('Created blob:', {
            size: blob.size,
            type: blob.type,
            mimeType: mimeType,
          });
          setAudioBlob(blob);
        } else {
          console.warn('No audio chunks collected during recording');
        }
        // Clean up stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        stopRecording();
      };

      // Set up audio context and analyser for volume detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      isRecordingRef.current = true;
      setVolumeLevel(0);

      // Start volume detection animation loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current || !isRecordingRef.current) {
          return;
        }
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate RMS (Root Mean Square) for volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Normalize to 0-100 range (adjust sensitivity as needed)
        const normalizedVolume = Math.min(100, (rms / 128) * 100);
        setVolumeLevel(normalizedVolume);
        
        if (isRecordingRef.current) {
          volumeAnimationRef.current = requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();

      // Start timer
      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);
        
        // Auto-stop at 60 seconds
        if (elapsed >= 60) {
          stopRecording().catch(console.error);
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      isRecordingRef.current = false;
      
      // Handle specific error cases
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        alert('Microphone is already in use by another application. Please close other applications using the microphone and try again.');
      } else {
        alert('Failed to start recording. Please check your microphone permissions and try again.');
      }
    }
  };


  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      isRecordingRef.current = false;
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        // Store the original onstop handler
        const originalOnStop = mediaRecorderRef.current.onstop;
        
        // Override onstop to capture the blob
        mediaRecorderRef.current.onstop = () => {
          // Call original handler if it exists
          if (originalOnStop) {
            originalOnStop.call(mediaRecorderRef.current);
          }
          
          // Get the blob from chunks
          if (audioChunksRef.current.length > 0) {
            const mimeType = getSupportedMimeType();
            if (mimeType) {
              const blob = new Blob(audioChunksRef.current, { type: mimeType });
              setAudioBlob(blob);
              resolve(blob);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        
        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }

      // Stop volume animation
      if (volumeAnimationRef.current !== null) {
        cancelAnimationFrame(volumeAnimationRef.current);
        volumeAnimationRef.current = null;
      }
      setVolumeLevel(0);
      
      // Disconnect analyser from source
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      analyserRef.current = null;

      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      setIsRecording(false);
    });
  };

  const cancelRecording = async () => {
    await stopRecording();
    audioChunksRef.current = [];
    setAudioChunks([]);
    setAudioBlob(null);
    setRecordingDuration(0);
    setVolumeLevel(0);
  };

  // Transcription function
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      setIsTranscribing(true);
      
      // Validate audio blob
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('No audio recorded. Please check your microphone permissions and try again.');
      }

      console.log('Transcribing audio:', {
        size: audioBlob.size,
        type: audioBlob.type,
        language: scenario.language,
      });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', scenario.language);

      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Transcription failed' }));
        console.error('Transcription API error:', error);
        throw new Error(error.error || error.message || 'Failed to transcribe audio');
      }

      const data = await response.json();
      if (!data.text || data.text.trim() === '') {
        throw new Error('No text was transcribed. Please try speaking more clearly or check your microphone.');
      }
      
      return data.text.trim();
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <>
      <style>{`
        /* Low-profile scrollbar for messages container */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }
        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .messages-container::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 3px;
        }
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #505050;
        }
        /* Prevent bouncy scroll on touchpad - still allows normal scrolling */
        .messages-container {
          overscroll-behavior: none;
          overscroll-behavior-y: none;
        }
        
        /* Pulse animation for recording button */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        /* Typing indicator animation */
        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        
        .typing-dot-1 {
          animation-delay: 0s;
        }
        
        .typing-dot-2 {
          animation-delay: 0.2s;
        }
        
        .typing-dot-3 {
          animation-delay: 0.4s;
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
          
          {/* Middle section with Theme */}
          <div style={styles.HeaderMiddle}>
            <div style={styles.ThemeLabel}>Theme</div>
            <div style={styles.ThemeText}>{scenario.title}</div>
          </div>
          
          <div style={styles.HeaderRight}>
            {/* Options Menu (triple dot) - leftmost */}
            <div style={{ position: 'relative' }}>
              <button
                style={styles.IconButton}
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                title="Options"
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
              {showOptionsMenu && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1000,
                    }}
                    onClick={() => setShowOptionsMenu(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #313131',
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '200px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    zIndex: 1001,
                  }}>
                    {sessionId && (
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          resetScenario();
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2a2a2a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          <path d="M3 21v-5h5" />
                        </svg>
                        Reset Scenario
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Language Selector - middle */}
            <button
              style={styles.LanguageButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#262626';
                e.currentTarget.style.borderColor = '#404040';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1f1f1f';
                e.currentTarget.style.borderColor = '#313131';
              }}
            >
              <div style={styles.FlagIcon}>🇪🇸</div>
              <span>{selectedLanguage}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            
            {/* User Profile - rightmost */}
            {user && (
              <div style={{ position: 'relative' }}>
                <div
                  style={styles.ProfilePicture}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>{getUserInitials()}</span>
                </div>
                {showProfileMenu && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000,
                      }}
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '40px',
                      right: '0',
                      backgroundColor: '#1f1f1f',
                      border: '1px solid #313131',
                      borderRadius: '8px',
                      padding: '8px',
                      minWidth: '200px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      zIndex: 1001,
                    }}>
                      <div style={{ padding: '8px 12px', color: '#ffffff', fontSize: '14px', borderBottom: '1px solid #313131', marginBottom: '4px' }}>
                        {user.email}
                      </div>
                      <button
                        onClick={async () => {
                          await signOut();
                          router.push('/auth/login');
                          router.refresh();
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ff8888',
                          fontSize: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2a2a2a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
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
                    {playingMessageId === message.id ? (
                      <button
                        style={styles.ActionButton}
                        onClick={handleStop}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                        Stop
                      </button>
                    ) : (
                      <button
                        style={styles.ActionButton}
                        onClick={() => handleReplay(message)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.5 2.5L21 8M3 12v4m0-4h4m13-4v4m0-4h-4" />
                        </svg>
                        Replay
                      </button>
                    )}
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
                      e.currentTarget.style.backgroundColor = '#7c3aed';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#8b5cf6';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isLoading && (
            <div style={styles.TypingIndicator}>
              <div style={styles.TypingBubble}>
                <div style={{ ...styles.TypingDot, animationDelay: '0s' }} className="typing-dot-1" />
                <div style={{ ...styles.TypingDot, animationDelay: '0.2s' }} className="typing-dot-2" />
                <div style={{ ...styles.TypingDot, animationDelay: '0.4s' }} className="typing-dot-3" />
              </div>
            </div>
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
            {/* Trash Button (only shown when recording) */}
            {isRecording && (
              <button
                type="button"
                style={styles.TrashButton}
                onClick={cancelRecording}
                title="Cancel recording"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isRecording ? `Recording... ${Math.floor(recordingDuration / 60)}:${String(recordingDuration % 60).padStart(2, '0')}` : "Aa"}
              style={isRecording ? styles.InputRecording : styles.Input}
              disabled={isLoading || isRecording}
            />
            {/* Volume Bars Animation (only shown when recording) */}
            {isRecording && (
              <div style={styles.VolumeBarsContainer}>
                {[0, 1, 2, 3, 4].map((index) => {
                  // Calculate height for each bar based on volume level
                  // Each bar responds to different frequency ranges with variation
                  const baseHeight = (volumeLevel / 100) * 16;
                  const variation = Math.sin(Date.now() / 200 + index) * 2;
                  const barHeight = Math.max(4, Math.min(20, baseHeight + variation));
                  return (
                    <div
                      key={index}
                      style={{
                        ...styles.VolumeBar,
                        height: `${barHeight}px`,
                      }}
                    />
                  );
                })}
              </div>
            )}
            {/* Microphone Button (shown when not recording and no text) */}
            {!isRecording && !inputValue.trim() && (
              <button
                type="button"
                style={styles.MicrophoneButton}
                onClick={startRecording}
                disabled={isLoading || isTranscribing}
                title="Start recording"
                onMouseEnter={(e) => {
                  if (!isLoading && !isTranscribing) {
                    e.currentTarget.style.backgroundColor = '#313131';
                    e.currentTarget.style.borderColor = '#404040';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !isTranscribing) {
                    e.currentTarget.style.backgroundColor = '#262626';
                    e.currentTarget.style.borderColor = '#313131';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
            {/* Send Button (shown when recording or when has text) */}
            {(isRecording || inputValue.trim()) && (
              <button
                type="submit"
                style={styles.SendButton}
                disabled={isLoading || isTranscribing}
                title={isRecording ? "Stop recording and send" : "Send message"}
                onMouseEnter={(e) => {
                  if (!isLoading && !isTranscribing) {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b5cf6';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Translation Panel */}
      <div style={{
        ...styles.TranslationPanel,
        width: isTranslationPanelCollapsed ? '0px' : '400px',
        borderLeft: isTranslationPanelCollapsed ? 'none' : '1px solid #313131',
        overflow: isTranslationPanelCollapsed ? 'hidden' : 'hidden',
      }}>
        {!isTranslationPanelCollapsed && (
          <>
            <div style={styles.TranslationHeader}>
              <h3 style={styles.TranslationTitle}>Translation</h3>
              <button
                style={styles.CloseButton}
                onClick={() => setIsTranslationPanelCollapsed(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Collapse translation panel"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
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
          </>
        )}
      </div>
    </div>
    </>
  );
}
