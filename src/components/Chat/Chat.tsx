import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CircularProgress,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Close,
  Send,
  ChatBubbleOutline,
} from '@mui/icons-material';
import * as MessagesApi from '@/api/messages';
import socketService from '@/services/socketService';
import type { Message, User } from '@/api/messages';
import {
  ChatContainer,
  ChatHeader,
  ChatHeaderTitle,
  CloseButton,
  MessagesContainer,
  MessageBubble,
  MessageTime,
  MessageInputContainer,
  MessageInput,
  SendButton,
  TypingIndicator,
  EmptyState,
  LoadingContainer,
  ChatAvatar,
  ChatHeaderTitleStyled,
  ChatCloseButton,
  MessageBubbleContainer,
  MessageBubbleContent,
  MessageBubbleStyled,
  MessageAvatar,
  ReadStatus,
  SendButtonStyled,
} from './Chat.styles';

interface ChatProps {
  open: boolean;
  onClose: () => void;
  otherUser: User;
  currentUserId: number;
}

const Chat: React.FC<ChatProps> = ({
  open,
  onClose,
  otherUser,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!open) return;

    setLoading(true);
    try {
      console.log('Loading messages for user:', otherUser.id); // Debug log
      const response = await MessagesApi.getMessages(otherUser.id, {
        limit: 50,
      });
      
      console.log('Messages response:', response); // Debug log
      
      if (response && response.data) {
        console.log('Setting messages:', response.data); // Debug log
        setMessages(response.data);
        
        // Mark messages as read
        await MessagesApi.markConversationAsRead(otherUser.id);
        if (socketService.isConnected) {
          socketService.markAsRead(otherUser.id);
        }
      } else {
        console.log('No messages data in response');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [open, otherUser.id]);

  // Handle new message from WebSocket
  const handleNewMessage = useCallback((data: any) => {
    console.log('Received new message:', data); // Debug log
    const message = data.data;
    
    // Check if this message belongs to current conversation
    if (
      (message?.fromUserId === otherUser.id && message.toUserId === currentUserId) ||
      (message?.fromUserId === currentUserId && message.toUserId === otherUser.id)
    ) {
      console.log('Adding message to current conversation:', message); // Debug log
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.find(m => m.id === message.id);
        if (exists) {
          console.log('Message already exists, skipping'); // Debug log
          return prev;
        }
        
        // If this is from current user, check if we need to replace a temporary message
        if (message.fromUserId === currentUserId) {
          // Find and replace any temporary message with similar content and timestamp
          const tempMessageIndex = prev.findIndex(m => 
            m.id < 0 && // Temporary messages have negative IDs
            m.content === message.content &&
            m.fromUserId === currentUserId &&
            m.toUserId === otherUser.id &&
            Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 10000 // Within 10 seconds
          );
          
          if (tempMessageIndex !== -1) {
            console.log('Replacing temporary message with real message'); // Debug log
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = message;
            return newMessages.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
        }
        
        // Add new message and sort by createdAt
        const newMessages = [...prev, message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        console.log('Updated messages:', newMessages); // Debug log
        return newMessages;
      });
      
      // Mark as read if message is from other user and chat is open
      if (message.fromUserId === otherUser.id) {
        setTimeout(() => {
          if (socketService.isConnected) {
            socketService.markAsRead(otherUser.id);
          }
        }, 500);
      }
    }
  }, [otherUser.id, currentUserId]);

  // Handle typing indicator
  const handleTyping = useCallback((data: any) => {
    if (data.userId === otherUser.id) {
      setOtherUserTyping(data.isTyping);
    }
  }, [otherUser.id]);

 // Setup WebSocket listeners
  useEffect(() => {
    if (!open) return;

    console.log('🔌 Setting up WebSocket listeners for chat with user:', otherUser.id);

    // Ensure socket is connected before setting up listeners
    const token = localStorage.getItem('accessToken');
    if (token && !socketService.isConnected) {
      console.log('🔌 Connecting to WebSocket...');
      socketService.connect(token);
      
      // Log connection status after a delay
      setTimeout(() => {
        console.log('🔍 Connection check after 2s:', {
          connected: socketService.isConnected,
          status: socketService.getConnectionStatus()
        });
      }, 2000);
    }

    // Setup listeners
    socketService.on('new_message', handleNewMessage);
    socketService.on('user_typing', handleTyping);
    socketService.on('message_notification', handleNewMessage); // Also listen to notifications

    // Join conversation with a delay to ensure connection
    const joinTimer = setTimeout(() => {
      console.log('🔍 Checking connection before joining conversation...');
      socketService.getConnectionStatus(); // This will log the status
      
      if (socketService.isConnected) {
        console.log('Joining conversation with user:', otherUser.id);
        socketService.joinConversation(otherUser.id);
      } else {
        console.warn('Socket still not connected after timeout');
      }
    }, 500);

    return () => {
      console.log('Cleaning up WebSocket listeners for user:', otherUser.id); // Debug log
      clearTimeout(joinTimer);
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('message_notification');
      if (socketService.isConnected) {
        socketService.leaveConversation(otherUser.id);
      }
    };
  }, [open, otherUser.id, handleNewMessage, handleTyping]);

  // Load messages when chat opens
  useEffect(() => {
    if (open) {
      loadMessages();
    }
  }, [open, loadMessages]);

  // Cleanup polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('Cleaned up polling interval');
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, scrollToBottom]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    const tempId = `temp_${Date.now()}`; // Temporary ID for optimistic update
    setMessageText('');
    setSending(true);

    // Create temporary message for immediate display
    const tempMessage: Message = {
      id: -Date.now(), // Use negative number for temp messages
      content: text,
      fromUserId: currentUserId,
      toUserId: otherUser.id,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fromUser: {
        id: currentUserId,
        name: 'You' // Simple display name for current user
      },
      toUser: {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar
      }
    };

    // Add message immediately for optimistic UI update
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Try WebSocket first, fallback to REST API
      if (socketService.isConnected) {
        console.log('Sending message via WebSocket to user:', otherUser.id);
        socketService.sendMessage(otherUser.id, text);
        // Note: Real message will be received via WebSocket event and replace temp message
      } else {
        // Fallback to REST API
        console.log('Using REST API fallback for sending message');
        const response = await MessagesApi.sendMessage({
          toUserId: otherUser.id,
          content: text,
        });
        
        // Replace temporary message with real message data
        if (response.data) {
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          ));
        } else {
          // Remove temp message and reload all messages if no direct response
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
          loadMessages();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message on error and restore input
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessageText(text); // Restore message on error
    } finally {
      setSending(false);
    }
  }, [messageText, sending, otherUser.id, otherUser.name, otherUser.avatar, currentUserId, loadMessages]);

  // Handle typing
  const handleTypingChange = useCallback((typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      socketService.setTyping(otherUser.id, typing);
    }
  }, [isTyping, otherUser.id]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);

    // Handle typing indicator
    if (value.trim()) {
      handleTypingChange(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingChange(false);
      }, 3000);
    } else {
      handleTypingChange(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [handleTypingChange]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Format message time
  const formatMessageTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }, []);

  if (!open) return null;

  return (
    <ChatContainer>
      <ChatHeader>
        <Avatar 
          src={otherUser.avatar} 
          alt={otherUser.name}
          sx={{ width: 40, height: 40, border: '2px solid #fff', boxShadow: 2 }}
        >
          {otherUser.name.charAt(0)}
        </Avatar>
        <ChatHeaderTitleStyled variant="h6">
          {otherUser.name}
        </ChatHeaderTitleStyled>
        <Tooltip title="Đóng chat">
          <ChatCloseButton onClick={onClose}>
            <Close />
          </ChatCloseButton>
        </Tooltip>
      </ChatHeader>

      <MessagesContainer>
        {loading ? (
          <LoadingContainer>
            <CircularProgress size={24} />
          </LoadingContainer>
        ) : messages.length === 0 ? (
          <EmptyState>
            <ChatBubbleOutline sx={{ fontSize: 48, opacity: 0.5 }} />
            <span>Chưa có tin nhắn nào</span>
            <span>Hãy bắt đầu cuộc trò chuyện!</span>
          </EmptyState>
        ) : (
          <>
            {messages.map((message, idx) => {
              const isOwn = message.fromUserId === currentUserId;
              const showAvatar = !isOwn && (idx === 0 || messages[idx-1].fromUserId !== message.fromUserId);
              return (
                <MessageBubbleContainer key={message.id}>
                  {!isOwn && showAvatar && (
                    <Avatar src={message.fromUser?.avatar} alt={message.fromUser?.name} sx={{ width: 28, height: 28, marginRight: 1, fontSize: 14 }}>
                      {message.fromUser?.name?.charAt(0)}
                    </Avatar>
                  )}
                  <MessageBubbleContent>
                    <MessageBubbleStyled isOwn={isOwn}>
                      {message.content}
                      {isOwn && message.readAt && (
                        <ReadStatus>✓✓</ReadStatus>
                      )}
                    </MessageBubbleStyled>
                    <MessageTime isOwn={isOwn}>
                      {formatMessageTime(message.createdAt)}
                    </MessageTime>
                  </MessageBubbleContent>
                </MessageBubbleContainer>
              );
            })}

            {otherUserTyping && (
              <TypingIndicator>
                {otherUser.name} đang nhập...
              </TypingIndicator>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <MessageInputContainer>
        <MessageInput
          placeholder="Nhập tin nhắn..."
          value={messageText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          disabled={sending}
        />
        <Tooltip title="Gửi tin nhắn">
          <SendButtonStyled
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
            sending={sending}
          >
            {sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
          </SendButtonStyled>
        </Tooltip>
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default Chat;