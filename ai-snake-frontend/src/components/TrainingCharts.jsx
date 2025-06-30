import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function TrainingCharts({ gameState }) {
  const stats = gameState.stats || {};
  
  // Prepare data for score history chart
  const scoreHistory = (stats.all_scores || []).map((score, index) => ({
    episode: index + 1,
    score: score,
    avgScore: stats.all_scores.slice(0, index + 1).reduce((a, b) => a + b, 0) / (index + 1)
  })).slice(-30); // Last 30 episodes

  // Prepare data for loss chart
  const lossHistory = (stats.training_losses || []).map((loss, index) => ({
    step: index + 1,
    loss: loss
  }));

  // Prepare data for steps per episode
  const stepsHistory = (stats.episode_steps || []).map((steps, index) => ({
    episode: index + 1,
    steps: steps
  })).slice(-20); // Last 20 episodes

  // Performance metrics
  const performanceData = [
    { name: 'Wins', value: stats.win_rate || 0, color: '#00FF88' },
    { name: 'Losses', value: 100 - (stats.win_rate || 0), color: '#FF6B35' }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 1.5,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: 2
          }}
        >
          <Typography variant="caption" color="white">
            {`${label}: ${payload[0].value.toFixed(2)}`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (!gameState.training) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Start training mode to see real-time analytics
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3,
          background: "linear-gradient(45deg, #00D4FF, #00FF88)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
          textAlign: 'center'
        }}
      >
        AI Training Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Score Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              height: 350
            }}
          >
            <Typography variant="h6" color="primary.main" fontWeight="600" sx={{ mb: 2 }}>
              Score Performance
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.2)" />
                <XAxis 
                  dataKey="episode" 
                  stroke="#E0E0E0" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#E0E0E0" 
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00FF88"
                  strokeWidth={3}
                  dot={{ fill: '#00FF88', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00FF88', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Win Rate Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              height: 350
            }}
          >
            <Typography variant="h6" color="secondary.main" fontWeight="600" sx={{ mb: 2 }}>
              Win Rate
            </Typography>
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="h4" color="success.main" fontWeight="700">
                {(stats.win_rate || 0).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Success Rate (Score > 5)
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Training Loss Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              height: 300
            }}
          >
            <Typography variant="h6" color="warning.main" fontWeight="600" sx={{ mb: 2 }}>
              Training Loss
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={lossHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.2)" />
                <XAxis 
                  dataKey="step" 
                  stroke="#E0E0E0" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#E0E0E0" 
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Episode Steps Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              height: 300
            }}
          >
            <Typography variant="h6" color="info.main" fontWeight="600" sx={{ mb: 2 }}>
              Survival Steps
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={stepsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.2)" />
                <XAxis 
                  dataKey="episode" 
                  stroke="#E0E0E0" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#E0E0E0" 
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="steps"
                  fill="#8B5CF6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Key Metrics Cards */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: "linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%)",
            border: "1px solid rgba(0, 255, 136, 0.3)"
          }}>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" color="success.main" fontWeight="700">
                {stats.episodes_completed || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Episodes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)",
            border: "1px solid rgba(0, 212, 255, 0.3)"
          }}>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" color="primary.main" fontWeight="700">
                {stats.best || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Best Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.3)"
          }}>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" color="secondary.main" fontWeight="700">
                {stats.epsilon?.toFixed(3) || '1.000'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Epsilon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)",
            border: "1px solid rgba(255, 107, 53, 0.3)"
          }}>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" color="warning.main" fontWeight="700">
                {Math.round(stats.avg) || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}