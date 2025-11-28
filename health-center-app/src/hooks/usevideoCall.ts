import { useState, useEffect, useRef } from 'react';
import { VideoCall } from '../types';

export const useVideoCall = (appointmentId: string) => {
  const [call, setCall] = useState<VideoCall | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    initializeCall();
    return () => {
      endCall();
    };
  }, [appointmentId]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC connection
      const newCall: VideoCall = {
        id: Date.now().toString(),
        appointmentId,
        roomId: `room-${appointmentId}`,
        participants: ['patient', 'doctor'],
        status: 'active',
        startTime: new Date().toISOString()
      };

      setCall(newCall);
      setIsConnected(true);

      // Simulate connection to remote peer
      // In real implementation, you would connect to signaling server
      setTimeout(() => {
        // Simulate remote video
        if (remoteVideoRef.current) {
          // In real implementation, this would be the remote stream
          remoteVideoRef.current.srcObject = stream;
        }
      }, 2000);

    } catch (err) {
      setError('Failed to initialize video call');
      console.error('Video call initialization error:', err);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (peerConnectionRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
        
        setIsScreenSharing(true);
      } else {
        // Switch back to camera
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current?.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen sharing error:', err);
      setError('Failed to share screen');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (call) {
      setCall({
        ...call,
        status: 'ended',
        endTime: new Date().toISOString()
      });
    }

    setIsConnected(false);
  };

  return {
    call,
    isConnected,
    error,
    isVideoOn,
    isMicOn,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    toggleVideo,
    toggleMic,
    toggleScreenShare,
    endCall
  };
};