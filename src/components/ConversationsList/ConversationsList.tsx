import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  ChatBubbleOutline,
  Close,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import * as MessagesApi from '@/api/messages';
import type { Conversation, User } from '@/api/messages';

const ConversationsContainer = styled(Paper)(({ theme }) => ({
  width: 350,
  maxHeight: 500,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[8],
}));

const ConversationsHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ConversationsContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ConversationsListContainer = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: 0,
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[200],
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    borderRadius: 3,
  },
}));

const ConversationItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const UnreadBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: '0.75rem',
    height: 18,
    minWidth: 18,
  },
}));

const LastMessageText = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.palette.text.secondary,
}));

const EmptyState = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  gap: theme.spacing(1),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(3),
}));

interface ConversationsListProps {
  open: boolean;
  onClose: () => void;
  onConversationSelect: (user: User) => void;
  currentUserId: number;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  open,
  onClose,
  onConversationSelect,
  currentUserId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading conversations...'); // Debug log
      const response = await MessagesApi.getConversations({
        limit: 50,
      });
      
      console.log('Conversations response:', response); // Debug log
      
      // Handle the response format properly
      if (response && response.data && Array.isArray(response.data)) {
        console.log('Setting conversations:', response.data); // Debug log
        setConversations(response.data);
      } else if (response && Array.isArray(response)) {
        // In case API returns array directly
        console.log('Setting conversations (direct array):', response);
        setConversations(response);
      } else {
        console.log('No valid data in response'); // Debug log
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter conversations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conversation =>
        conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchTerm]);

  // Load conversations when component opens
  useEffect(() => {
    if (open) {
      console.log('Component opened, loading conversations...'); // Debug log
      loadConversations();
    }
  }, [open, loadConversations]);

  // Debug log for conversations state changes
  useEffect(() => {
    console.log('Conversations state updated:', conversations);
    console.log('Filtered conversations:', filteredConversations);
  }, [conversations, filteredConversations]);

  // Format message time
  const formatLastMessageTime = useCallback((dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'Hôm qua';
      } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    }
  }, []);

  // Handle conversation click
  const handleConversationClick = useCallback((conversation: Conversation) => {
    onConversationSelect(conversation.user);
    onClose();
  }, [onConversationSelect, onClose]);

  if (!open) return null;

  return (
    <ConversationsContainer>
      <ConversationsHeader>
        <Typography variant="h6" fontWeight={600}>
          Tin nhắn
        </Typography>
        <Tooltip title="Đóng">
          <IconButton 
            onClick={onClose}
            sx={{ color: 'inherit' }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </ConversationsHeader>

      <ConversationsContent>
        <SearchContainer>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </SearchContainer>

        {loading ? (
          <LoadingContainer>
            <CircularProgress size={24} />
          </LoadingContainer>
        ) : filteredConversations.length === 0 ? (
          <EmptyState>
            <ChatBubbleOutline sx={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant="body2">
              {searchTerm ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
            </Typography>
            {/* Debug info */}
            <Typography variant="caption" color="text.secondary">
              {searchTerm ? `Tìm kiếm: "${searchTerm}"` : `Tổng conversations: ${conversations.length}`}
            </Typography>
          </EmptyState>
        ) : (
          <ConversationsListContainer>
            {filteredConversations.map((conversation, index) => (
              <React.Fragment key={conversation.user.id}>
                <ConversationItem
                  onClick={() => handleConversationClick(conversation)}
                >
                  <ListItemAvatar>
                    <UnreadBadge 
                      badgeContent={conversation.unreadCount}
                      invisible={conversation.unreadCount === 0}
                    >
                      <Avatar 
                        src={conversation.user.avatar || undefined}
                        alt={conversation.user.name}
                      >
                        {conversation.user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </UnreadBadge>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography 
                          variant="subtitle2" 
                          fontWeight={conversation.unreadCount > 0 ? 600 : 400}
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            marginRight: 1,
                          }}
                        >
                          {conversation.user.name}
                        </Typography>
                        {conversation.lastMessage && (
                          <Typography variant="caption" color="text.secondary">
                            {formatLastMessageTime(conversation.lastMessage.createdAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      conversation.lastMessage ? (
                        <LastMessageText variant="body2">
                          {conversation.lastMessage.content}
                        </LastMessageText>
                      ) : (
                        <LastMessageText variant="body2">
                          Chưa có tin nhắn
                        </LastMessageText>
                      )
                    }
                  />
                </ConversationItem>
                
                {index < filteredConversations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </ConversationsListContainer>
        )}
      </ConversationsContent>
    </ConversationsContainer>
  );
};

export default ConversationsList;