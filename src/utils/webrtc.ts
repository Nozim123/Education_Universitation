// WebRTC Voice Chat Utilities

export interface VoiceParticipant {
  id: string;
  name: string;
  stream?: MediaStream;
  isMuted: boolean;
  isSpeaking: boolean;
}

export class VoiceRoom {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private onParticipantUpdate: (participants: VoiceParticipant[]) => void;
  private onSpeakingChange: (isSpeaking: boolean) => void;
  private participants: Map<string, VoiceParticipant> = new Map();
  private speakingCheckInterval: number | null = null;
  private isMuted = false;

  constructor(
    onParticipantUpdate: (participants: VoiceParticipant[]) => void,
    onSpeakingChange: (isSpeaking: boolean) => void
  ) {
    this.onParticipantUpdate = onParticipantUpdate;
    this.onSpeakingChange = onSpeakingChange;
  }

  async joinRoom(userId: string, userName: string): Promise<void> {
    try {
      // Get user's microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Set up audio analysis for speaking detection
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      // Add self to participants
      this.participants.set(userId, {
        id: userId,
        name: userName,
        stream: this.localStream,
        isMuted: false,
        isSpeaking: false,
      });

      // Start speaking detection
      this.startSpeakingDetection(userId);

      this.notifyUpdate();
      console.log("Joined voice room successfully");
    } catch (error) {
      console.error("Failed to join voice room:", error);
      throw error;
    }
  }

  private startSpeakingDetection(userId: string): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const threshold = 30; // Adjust sensitivity

    this.speakingCheckInterval = window.setInterval(() => {
      if (!this.analyser || this.isMuted) {
        this.updateSpeakingState(userId, false);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const isSpeaking = average > threshold;

      this.updateSpeakingState(userId, isSpeaking);
      this.onSpeakingChange(isSpeaking);
    }, 100);
  }

  private updateSpeakingState(userId: string, isSpeaking: boolean): void {
    const participant = this.participants.get(userId);
    if (participant && participant.isSpeaking !== isSpeaking) {
      participant.isSpeaking = isSpeaking;
      this.notifyUpdate();
    }
  }

  addRemoteParticipant(participantId: string, participantName: string): void {
    if (!this.participants.has(participantId)) {
      this.participants.set(participantId, {
        id: participantId,
        name: participantName,
        isMuted: false,
        isSpeaking: false,
      });
      this.notifyUpdate();
    }
  }

  removeRemoteParticipant(participantId: string): void {
    const pc = this.peerConnections.get(participantId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(participantId);
    }
    this.participants.delete(participantId);
    this.notifyUpdate();
  }

  toggleMute(): boolean {
    if (this.localStream) {
      this.isMuted = !this.isMuted;
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });

      // Update local participant
      const userId = Array.from(this.participants.keys())[0];
      if (userId) {
        const participant = this.participants.get(userId);
        if (participant) {
          participant.isMuted = this.isMuted;
          this.notifyUpdate();
        }
      }
    }
    return this.isMuted;
  }

  private notifyUpdate(): void {
    this.onParticipantUpdate(Array.from(this.participants.values()));
  }

  async createOffer(remoteUserId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeerConnection(remoteUserId);
    
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(
    remoteUserId: string, 
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeerConnection(remoteUserId);
    
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(remoteUserId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(remoteUserId);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(remoteUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnections.get(remoteUserId);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  }

  private createPeerConnection(remoteUserId: string): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const pc = new RTCPeerConnection(config);
    this.peerConnections.set(remoteUserId, pc);

    pc.ontrack = (event) => {
      console.log("Received remote track from:", remoteUserId);
      const participant = this.participants.get(remoteUserId);
      if (participant) {
        participant.stream = event.streams[0];
        this.notifyUpdate();

        // Play the remote audio
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play().catch(console.error);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // This would be sent via signaling server (Supabase Realtime)
        console.log("ICE candidate:", event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${remoteUserId}:`, pc.connectionState);
    };

    return pc;
  }

  leaveRoom(): void {
    // Stop speaking detection
    if (this.speakingCheckInterval) {
      clearInterval(this.speakingCheckInterval);
      this.speakingCheckInterval = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Close all peer connections
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();

    // Clear participants
    this.participants.clear();
    this.notifyUpdate();

    console.log("Left voice room");
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }
}
