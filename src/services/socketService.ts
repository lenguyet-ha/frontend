import { io, Socket } from 'socket.io-client';

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  fromUser: User;
  toUser: User;
}

interface MessageEventData {
  event: 'message';
  data: Message;
}

interface TypingData {
  userId: number;
  userName: string;
  isTyping: boolean;
}

interface MessageNotification {
  fromUserId: number;
  fromUserName: string;
  message: Message;
}

interface MessagesReadData {
  readByUserId: number;
  readByUserName: string;
  readAt: string;
}

type SocketEventListeners = {
  connected: () => void;
  disconnected: () => void;
  error: (error: any) => void;
  new_message: (data: MessageEventData) => void;
  message_notification: (data: MessageNotification) => void;
  user_typing: (data: TypingData) => void;
  messages_read: (data: MessagesReadData) => void;
  joined_conversation: (data: { otherUserId: number; roomName: string; message: string }) => void;
  left_conversation: (data: { otherUserId: number; roomName: string; message: string }) => void;
  marked_as_read: (data: { fromUserId: number; message: string }) => void;
};

class SocketService {
  private socket: Socket | null = null;
  private listeners: Partial<SocketEventListeners> = {};
  private currentConversation: number | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }

    console.log('Connecting to WebSocket server...', process.env.NEXT_PUBLIC_WS_URL);
    
    // Use correct WebSocket URL format
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    
    this.socket = io(`${wsUrl}/messages`, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentConversation = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully to server');
      console.log('Socket ID:', this.socket?.id);
      console.log('Connection status:', this.isConnected);
      this.listeners.connected?.();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected from server');
      console.log('Disconnect reason:', reason);
      console.log('Connection status:', this.isConnected);
      this.listeners.disconnected?.();
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error);
      console.log('Connection status:', this.isConnected);
      this.listeners.error?.(error);
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
      this.listeners.error?.(error);
    });

    this.socket.on('new_message', (data: MessageEventData) => {
      console.log('📨 New message received:', data);
      this.listeners.new_message?.(data);
    });

    this.socket.on('message_notification', (data: MessageNotification) => {
      console.log('Message notification received:', data);
      this.listeners.message_notification?.(data);
    });

    this.socket.on('user_typing', (data: TypingData) => {
      this.listeners.user_typing?.(data);
    });

    this.socket.on('messages_read', (data: MessagesReadData) => {
      this.listeners.messages_read?.(data);
    });

    this.socket.on('joined_conversation', (data: any) => {
      console.log('Joined conversation:', data);
      this.listeners.joined_conversation?.(data);
    });

    this.socket.on('left_conversation', (data: any) => {
      console.log('Left conversation:', data);
      this.listeners.left_conversation?.(data);
    });

    this.socket.on('marked_as_read', (data: any) => {
      console.log('Marked as read:', data);
      this.listeners.marked_as_read?.(data);
    });
  }

  // Connection status methods
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus() {
    const status = {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      currentConversation: this.currentConversation,
      url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
    };
    
    console.log('🔍 WebSocket Connection Status:', status);
    return status;
  }

  // Event listener management
  on<K extends keyof SocketEventListeners>(event: K, callback: SocketEventListeners[K]) {
    this.listeners[event] = callback;
  }

  off<K extends keyof SocketEventListeners>(event: K) {
    delete this.listeners[event];
  }

  // Message operations
  sendMessage(toUserId: number, content: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, attempting to reconnect...');
      // Try to reconnect if we have a token
      const token = localStorage.getItem('token');
      if (token) {
        this.connect(token);
      }
      throw new Error('Socket not connected');
    }

    this.socket.emit('send_message', {
      toUserId,
      content,
    });
  }

  // Conversation operations
  joinConversation(otherUserId: number) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, attempting to reconnect...');
      // Try to reconnect if we have a token
      const token = localStorage.getItem('token');
      if (token) {
        this.connect(token);
        // Wait for connection and then join
        setTimeout(() => {
          if (this.socket?.connected) {
            this.socket.emit('join_conversation', { otherUserId });
          }
        }, 1000);
      }
      return;
    }

    this.currentConversation = otherUserId;
    this.socket.emit('join_conversation', { otherUserId });
  }

  leaveConversation(otherUserId: number) {
    if (!this.socket?.connected) {
      return;
    }

    if (this.currentConversation === otherUserId) {
      this.currentConversation = null;
    }
    
    this.socket.emit('leave_conversation', { otherUserId });
  }

  // Typing indicator
  setTyping(toUserId: number, isTyping: boolean) {
    if (!this.socket?.connected) {
      console.log('Socket not connected, skipping typing indicator');
      return;
    }

    this.socket.emit('typing', { toUserId, isTyping });
  }

  // Mark messages as read
  markAsRead(fromUserId: number) {
    if (!this.socket?.connected) {
      console.log('Socket not connected, skipping mark as read');
      return;
    }

    this.socket.emit('mark_as_read', { fromUserId });
  }

  // Getters
  get currentConversationWith() {
    return this.currentConversation;
  }

  // Force reconnect method
  reconnect() {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔄 Force reconnecting...');
      this.disconnect();
      setTimeout(() => {
        this.connect(token);
      }, 1000);
    }
  }

  // Debug method for console testing
  debug() {
    const status = this.getConnectionStatus();
    console.log('=== WebSocket Debug Info ===');
    console.log('Service instance:', this);
    console.log('Connection status:', status);
    console.log('Socket instance:', this.socket);
    console.log('Event listeners:', this.listeners);
    console.log('============================');
    return status;
  }
}

// Singleton instance
const socketService = new SocketService();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).socketService = socketService;
}

export default socketService;
export type { Message, User, MessageEventData, TypingData, MessageNotification, MessagesReadData };