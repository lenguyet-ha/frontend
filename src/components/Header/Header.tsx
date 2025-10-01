import React from 'react';
import { Box, Typography } from '@mui/material';

const Header = () => {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
      <Typography variant="h6">Header - ECOMMERCE</Typography>
    </Box>
  );
};

export default Header;
