import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';

export interface WebRTCHookReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  startCall: (isInitiator: boolean, signal?: SimplePeer.SignalData) => void;
  sendSignal: (signal: SimplePeer.SignalData) => void;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export const useWebRTC = (): WebRTCHookReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const peerRef = useRef<SimplePeer.Instance | null>(null);

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const getLocalMedia = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      throw new Error('Failed to access camera/microphone');
    }
  };

  const createPeer = (isInitiator: boolean, stream: MediaStream): SimplePeer.Instance => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream,
      config
    });

    peer.on('signal', (data) => {
      // This will be handled by the calling component
      console.log('Signal data:', data);
    });

    peer.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    peer.on('stream', (stream) => {
      setRemoteStream(stream);
    });

    peer.on('close', () => {
      setIsConnected(false);
      setRemoteStream(null);
    });

    peer.on('error', (err) => {
      setError(err.message);
      setIsConnecting(false);
      setIsConnected(false);
    });

    return peer;
  };

  const startCall = async (isInitiator: boolean, signal?: SimplePeer.SignalData) => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await getLocalMedia();
      const peer = createPeer(isInitiator, stream);
      
      peerRef.current = peer;

      if (signal && !isInitiator) {
        peer.signal(signal);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setIsConnecting(false);
    }
  };

  const sendSignal = (signal: SimplePeer.SignalData) => {
    if (peerRef.current) {
      peerRef.current.signal(signal);
    }
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    error,
    startCall,
    sendSignal,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  };
};
