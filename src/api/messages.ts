import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

export interface User {
  id: number;
  name: string;
  avatar?: string;
}

export interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  fromUser: User;
  toUser: User;
}

export interface Conversation {
  user: User;
  lastMessage: {
    id: number;
    fromUserId: number;
    toUserId: number;
    content: string;
    readAt: string | null;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface SendMessageRequest {
  toUserId: number;
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface GetConversationsResponse {
  success: boolean;
  data: Conversation[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetMessagesResponse {
  success: boolean;
  data: Message[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export interface MarkAsReadRequest {
  fromUserId: number;
}

// Send a message
export const sendMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  try {
    const payload = {
      method: "POST",
      url: apiEndPoints.MESSAGES,
      data,
    };
    const response = await axios(payload);
    
    console.log('sendMessage API response:', response.data); // Debug log
    
    // Handle the API response format
    return {
      success: true,
      message: 'Message sent successfully',
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get all conversations for current user
export const getConversations = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<GetConversationsResponse> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.MESSAGES}/conversations`,
      params,
    };
    const response = await axios(payload);
    
    console.log('API response:', response.data); // Debug log
    
    // Your API returns data directly without a success wrapper
    return {
      success: true,
      data: response.data.data || response.data || [],
      totalItems: response.data.totalItems || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 50,
      totalPages: response.data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error getting conversations:", error);
    throw error;
  }
};

// Get messages in a conversation with specific user
export const getMessages = async (
  userId: number,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<GetMessagesResponse> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.MESSAGES}/conversation/${userId}`,
      params,
    };
    const response = await axios(payload);
    
    console.log('getMessages API response:', response.data); // Debug log
    
    // Handle the API response format
    return {
      success: true,
      data: response.data.data || response.data || [],
      totalItems: response.data.totalItems || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 50,
      totalPages: response.data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

// Get unread messages count
export const getUnreadCount = async (): Promise<GetUnreadCountResponse> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.MESSAGES}/unread-count`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
};

// Mark messages as read
export const markAsRead = async (data: MarkAsReadRequest): Promise<{ message: string }> => {
  try {
    const payload = {
      method: "PUT",
      url: `${apiEndPoints.MESSAGES}/mark-as-read`,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Mark conversation as read
export const markConversationAsRead = async (fromUserId: number): Promise<{ message: string }> => {
  try {
    const payload = {
      method: "PUT",
      url: `${apiEndPoints.MESSAGES}/mark-conversation-as-read/${fromUserId}`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};