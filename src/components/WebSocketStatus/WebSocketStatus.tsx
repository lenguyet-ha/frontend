import React, { useState, useEffect } from 'react';
import { Box, Chip } from '@mui/material';
import { WifiOff, Wifi } from '@mui/icons-material';
import socketService from '@/services/socketService';

const WebSocketStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial status check
    setIsConnected(socketService.isConnected);

    // Update status every 3 seconds
    const interval = setInterval(() => {
      setIsConnected(socketService.isConnected);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Box sx={{ ml: 1 }}>
      <Chip
        icon={isConnected ? <Wifi /> : <WifiOff />}
        label={isConnected ? 'WS' : 'OFF'}
        color={isConnected ? 'success' : 'error'}
        size="small"
        variant="outlined"
      />
    </Box>
  );
};

export default WebSocketStatus;