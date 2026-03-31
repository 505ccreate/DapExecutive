import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { BookingDetails, ConnectionStatus, DebugInfo, TranscriptMessage } from '../types';

const MODEL = "gemini-3.1-flash-live-preview";

export function useGeminiLive(
  onBookingUpdate: (details: Partial<BookingDetails>) => void,
  onBookingSubmit: () => void,
  onIntensityUpdate: (voice: number, user: number) => void
) {
  const [status, setStatus] = useState<ConnectionStatus>('offline');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [debug, setDebug] = useState<DebugInfo>({
    micPermission: 'prompt',
    wsStatus: 'closed',
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<ConnectionStatus>('offline');
  const updateStatus = (newStatus: ConnectionStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
    if (newStatus !== 'connecting' && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const hasGreetedRef = useRef(false);

  const initAudio = async () => {
    if (!audioContextRef.current) {
      console.log("Creating new AudioContext with 16000Hz sample rate...");
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      console.log("Resuming AudioContext...");
      await audioContextRef.current.resume();
    }
    console.log("AudioContext sample rate:", audioContextRef.current.sampleRate);
  };

  const scheduleAudio = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) return;
    const ctx = audioContextRef.current;
    
    if (nextPlayTimeRef.current < ctx.currentTime) {
      nextPlayTimeRef.current = ctx.currentTime + 0.05;
    }

    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift()!;
      const float32Data = new Float32Array(chunk.length);
      for (let i = 0; i < chunk.length; i++) float32Data[i] = chunk[i] / 32768.0;

      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      activeSourcesRef.current.push(source);
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const monitorAI = () => {
        if (statusRef.current === 'speaking') {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          onIntensityUpdate((sum / dataArray.length) / 60, 0);
          requestAnimationFrame(monitorAI);
        }
      };
      monitorAI();

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        if (ctx.currentTime >= nextPlayTimeRef.current - 0.05) {
          isPlayingRef.current = false;
          if (statusRef.current === 'speaking') {
            updateStatus('listening');
            onIntensityUpdate(0, 0);
          }
        }
      };
    }
    
    isPlayingRef.current = true;
    if (statusRef.current !== 'speaking') updateStatus('speaking');
  }, [onIntensityUpdate]);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
  };

  const connect = async () => {
    console.log("Connect initiated...");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (statusRef.current === 'connecting') {
        console.error("Connection process timed out after 20 seconds. Current state:", {
          audioContextState: audioContextRef.current?.state,
          hasStream: !!streamRef.current,
          hasSession: !!sessionRef.current
        });
        updateStatus('error');
        disconnect();
      }
    }, 20000);

    try {
      setTranscript([]);
      hasGreetedRef.current = false;
      updateStatus('connecting');
      
      console.log("Step 1: Initializing audio context...");
      await initAudio();
      console.log("Step 1 complete. Audio context state:", audioContextRef.current?.state);
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        console.error("GEMINI_API_KEY is missing or invalid (found:", apiKey, ")");
        updateStatus('error');
        return;
      }
      
      console.log("Step 2: Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 } 
      });
      console.log("Step 2 complete. Microphone access granted.");
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });
      console.log("Step 3: Connecting to Gemini Live API with model:", MODEL);
      
      const sessionPromise = ai.live.connect({
        model: MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `Name: Cam
Role: Lead Executive Transportation Concierge for DAP Executive Services
Voice: Charon

STRICT IDENTITY RULES
- Cam must never mention Gemini, Google, language model, AI model, or any underlying platform.
- Cam is a dedicated part of the DAP Executive team.
- Maintain the magic: Cam is the executive concierge, not a chatbot demo.

PERSONA
- Smooth professionalism.
- Sophisticated Black American tone, late-night R&B swagger.
- Deep, resonant, calm, polished, premium.
- Concise, not robotic, not goofy, not overly chatty.

GREETING BEHAVIOR
- Greet FIRST automatically.
- Opening styles: "Welcome to DAP Executives, I’m Cam. Can I help you book a car today?", "Hello, my name is Cam. Are we making a reservation today?", "Good to have you with us. I’m Cam. Ready to arrange your executive transport?"
- Vary the opening. Stay focused on booking and logistics immediately.

PRIMARY JOB
- Guide a luxury transportation reservation and update the live reservation form on the right.
- Listen naturally, extract details, and call 'update_reservation' immediately when you hear a detail.
- The right-side form is the PRIMARY source of truth.

CONVERSATION FLOW & CONFIRMATION RULES
- ASK ONE QUESTION AT A TIME. Wait for the user to answer before moving to the next detail.
- YOU MUST EXPLICITLY CONFIRM critical details before moving on.
- Confirmation Examples:
  - "I have your first name as Ashley, correct?"
  - "And your last name as Cream, correct?"
  - "Let me confirm your pickup: City Hall, Philadelphia, Pennsylvania. Is that right?"
  - "I have your dropoff as Airport, Philadelphia, Pennsylvania. Correct?"
- Fields to confirm: first name, last name, pickup address (including city/state), dropoff address (including city/state), vehicle type.
- If a vehicle type is mentioned, update it immediately so the visual preview changes.

FLIRTY OR OFF-TOPIC USERS
- Brief, classy response, then return to booking. E.g., "You can charm me later. Right now, let’s lock in your transport."`,
          tools: [{
            functionDeclarations: [
              {
                name: "update_reservation",
                description: "Update the current reservation draft.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    service_type: { type: Type.STRING },
                    vehicle_type: { 
                      type: Type.STRING,
                      description: "The type of vehicle. Allowed values: 'sedan', 'suv', 'sprinter'."
                    },
                    pickup_date: { type: Type.STRING },
                    pickup_time: { type: Type.STRING },
                    pickup_address: { type: Type.STRING },
                    dropoff_address: { type: Type.STRING },
                    passenger_count: { type: Type.INTEGER },
                    luggage_count: { type: Type.INTEGER },
                    customer_name: { type: Type.STRING },
                    customer_phone: { type: Type.STRING },
                    customer_email: { type: Type.STRING },
                    flight_number: { type: Type.STRING },
                    special_requests: { type: Type.STRING },
                  }
                }
              },
              {
                name: "submit_reservation",
                description: "Finalize the reservation.",
                parameters: {
                  type: Type.OBJECT,
                  properties: { confirmed: { type: Type.BOOLEAN } },
                  required: ["confirmed"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live connection opened.");
            setDebug(prev => ({ ...prev, wsStatus: 'open' }));
            updateStatus('listening');

            sessionPromise.then((session) => {
              sessionRef.current = session;
              if (!hasGreetedRef.current) {
                hasGreetedRef.current = true;
                console.log("Sending initial greeting trigger...");
                session.sendRealtimeInput({
                  text: "The executive session has begun. Please initiate your opening greeting as Cam from DAP Executives. Welcome the user to DAP Executives and ask how you can assist with their reservation."
                });
              }
            });

            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            const userAnalyser = audioContextRef.current!.createAnalyser();
            userAnalyser.fftSize = 256;
            source.connect(userAnalyser);
            userAnalyserRef.current = userAnalyser;

            const dataArray = new Uint8Array(userAnalyser.frequencyBinCount);
            const monitorUser = () => {
              if (statusRef.current === 'listening') {
                userAnalyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                onIntensityUpdate(0, (sum / dataArray.length) / 80);
              }
              if (statusRef.current !== 'offline') requestAnimationFrame(monitorUser);
            };
            monitorUser();

            let chunksSent = 0;
            processor.onaudioprocess = (e) => {
              if (statusRef.current === 'offline') return;
              
              if (!sessionRef.current) {
                if (chunksSent % 100 === 0) {
                  console.log("Audio chunk skipped: sessionRef.current is not yet set.");
                }
                chunksSent++;
                return;
              }

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              
              for (let i = 0; i < inputData.length; i++) {
                // Clamp and convert to 16-bit PCM
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              
              sessionRef.current.sendRealtimeInput({
                audio: { data: arrayBufferToBase64(pcmData.buffer), mimeType: 'audio/pcm;rate=16000' }
              });
              
              chunksSent++;
              if (chunksSent % 100 === 0) {
                console.log(`Streaming audio: sent ${chunksSent} chunks to Gemini.`);
              }
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent) {
              console.log("Gemini Live server content received:", message.serverContent);
            }
            if (message.toolCall) {
              console.log("Gemini Live tool call received:", message.toolCall);
            }
            
            // Handle Audio Output
            const audioParts = message.serverContent?.modelTurn?.parts?.filter(p => p.inlineData);
            if (audioParts?.length) {
              audioParts.forEach(part => {
                const binaryString = window.atob(part.inlineData!.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                audioQueueRef.current.push(new Int16Array(bytes.buffer));
              });
              scheduleAudio();
            }

            // Handle Transcription
            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              const text = modelParts.filter(p => p.text).map(p => p.text).join("");
              if (text) {
                setTranscript(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'model') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                  }
                  return [...prev, { role: 'model', text }];
                });
              }
            }

            const userParts = (message.serverContent as any)?.userTurn?.parts;
            if (userParts) {
              const text = userParts.filter(p => p.text).map(p => p.text).join("");
              if (text) {
                setTranscript(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'user') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                  }
                  return [...prev, { role: 'user', text }];
                });
              }
            }

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              activeSourcesRef.current = [];
              isPlayingRef.current = false;
              updateStatus('listening');
            }

            if (message.toolCall) {
              const functionResponses = [];
              for (const call of message.toolCall.functionCalls) {
                if (call.name === 'update_reservation') {
                  onBookingUpdate(call.args as Partial<BookingDetails>);
                  functionResponses.push({ name: call.name, response: { output: { success: true } }, id: call.id });
                } else if (call.name === 'submit_reservation') {
                  onBookingSubmit();
                  functionResponses.push({ name: call.name, response: { output: { success: true } }, id: call.id });
                }
              }
              sessionRef.current?.sendToolResponse({ functionResponses });
            }
          },
          onclose: () => {
            console.log("Gemini Live connection closed.");
            disconnect();
          },
          onerror: (e) => {
            console.error("Gemini Live connection error callback:", e);
            updateStatus('error');
            disconnect();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
      console.log("Session promise resolved.");
    } catch (err) {
      console.error("Gemini Live Connection Error (catch):", err);
      updateStatus('error');
      disconnect();
    }
  };

  const disconnect = useCallback(() => {
    updateStatus('offline');
    onIntensityUpdate(0, 0);
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    activeSourcesRef.current = [];
    if (sessionRef.current) { try { sessionRef.current.close(); } catch(e){} sessionRef.current = null; }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, [onIntensityUpdate]);

  return { status, transcript, debug, connect, disconnect };
}
