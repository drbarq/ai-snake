import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh as RefreshIcon, BugReport as BugIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1A1A1A 0%, #0F1419 100%)',
            p: 4
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: 4
            }}
          >
            <BugIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main', 
                mb: 2,
                animation: 'pulse 2s ease-in-out infinite'
              }} 
            />
            
            <Typography 
              variant="h4" 
              color="error.main" 
              fontWeight="700"
              sx={{ mb: 2 }}
            >
              System Error
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              The AI Snake interface encountered an unexpected error. 
              This might be due to a connection issue or system malfunction.
            </Typography>

            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                textAlign: 'left',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)'
              }}
            >
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                Error Details:
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {this.state.error && this.state.error.toString()}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3
                }}
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3
                }}
              >
                Reload App
              </Button>
            </Box>

            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mt: 3, display: 'block' }}
            >
              If the problem persists, check the backend server connection.
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;