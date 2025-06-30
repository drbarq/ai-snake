import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Stack,
  Paper,
  Alert,
  Chip,
  LinearProgress,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useGame } from "../contexts/GameContext";
import TrainingCharts from "./TrainingCharts";

export default function Dashboard({ children }) {
  const {
    gameState,
    gridSize,
    updateGridSize,
    pauseTraining,
    startRound,
    setMode,
    resetGame,
    saveModel,
    evaluateModel,
    evaluationResult,
    modelSaveInfo,
    updateTrainingRounds,
    isConnected,
    setSpeed,
    loadModel,
    listModels,
    availableModels,
    modelLoadInfo,
  } = useGame();

  // UI state
  const [gridWidth, setGridWidth] = useState(gridSize.width.toString());
  const [gridHeight, setGridHeight] = useState(gridSize.height.toString());
  const [speed, setSpeedState] = useState("100"); // Game speed in milliseconds
  const [openSave, setOpenSave] = useState(false);
  const [openEval, setOpenEval] = useState(false);
  const [trainingRoundsInput, setTrainingRoundsInput] = useState("");
  const [trainingRoundsValid, setTrainingRoundsValid] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [openLoadSnackbar, setOpenLoadSnackbar] = useState(false);

  React.useEffect(() => {
    if (modelSaveInfo) setOpenSave(true);
  }, [modelSaveInfo]);
  React.useEffect(() => {
    if (evaluationResult) setOpenEval(true);
  }, [evaluationResult]);
  React.useEffect(() => {
    if (modelLoadInfo) setOpenLoadSnackbar(true);
  }, [modelLoadInfo]);
  
  // Load available models after connection is established
  React.useEffect(() => {
    if (isConnected) {
      // Delay the initial commands to ensure connection is stable
      const timer = setTimeout(() => {
        listModels();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, listModels]);

  // Handlers
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    console.log(
      `Mode change requested: ${newMode}, current game state mode: ${gameState.mode}`
    );
    if (newMode !== gameState.mode) {
      if (newMode === "training") {
        // For training mode, we need to start training
        console.log("Setting training mode...");
        if (trainingRoundsValid) {
          updateTrainingRounds(parseInt(trainingRoundsInput));
          setMode("training");
        } else {
          // If training rounds not set, set a default and start
          updateTrainingRounds(100);
          setMode("training");
        }
      } else {
        // For manual and AI modes, set mode directly
        console.log(`Setting mode to: ${newMode}`);
        setMode(newMode);
      }
    }
  };
  const handleTrainingRoundsChange = (e) => {
    const val = e.target.value;
    setTrainingRoundsInput(val);
    const num = parseInt(val);
    setTrainingRoundsValid(!isNaN(num) && num > 0);
  };
  const handleGridApply = () => {
    const width = parseInt(gridWidth);
    const height = parseInt(gridHeight);
    if (width > 3 && height > 3) {
      updateGridSize(width, height);
    }
  };

  // Controls state
  const isManual = gameState.mode === "manual";
  const isAI = gameState.mode === "ai";
  const isTraining = gameState.mode === "training";
  const isGameOver = gameState.game_over;
  const canStart = (isManual || isAI) && isGameOver; // Can only start new round when game is over
  const canPause = isTraining;
  const canReset = true;
  const isGameActive = !isGameOver && !isTraining;

  const panelWidth = 600;
  return (
    <Stack
      direction="column"
      spacing={3}
      sx={{ width: "100%", alignItems: "center", mt: 4 }}
    >
      {/* Connection Status Indicator */}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 3,
          backgroundColor: isConnected 
            ? "rgba(76, 175, 80, 0.9)" 
            : "rgba(244, 67, 54, 0.9)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${isConnected ? '#4CAF50' : '#F44336'}`
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "white",
            animation: isConnected ? "pulse 2s ease-in-out infinite" : "none"
          }}
        />
        <Typography
          variant="caption"
          color="white"
          fontWeight="600"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {isConnected ? "Connected" : "Connecting..."}
        </Typography>
      </Box>
      {/* Top Panel: Mode Dropdown, Controls, Settings */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 4,
          mx: "auto",
          overflow: "visible",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}
      >
        <Stack
          direction="row"
          spacing={4}
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%", flexWrap: "wrap" }}
        >
          {/* Left group: Mode dropdown + controls */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Game Mode Dropdown */}
            <FormControl size="small" sx={{ minWidth: 120, height: 40 }}>
              <InputLabel id="mode-select-label">Mode</InputLabel>
              <Select
                labelId="mode-select-label"
                value={gameState.mode}
                label="Mode"
                onChange={handleModeChange}
                size="small"
                sx={{ height: 40 }}
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="ai">AI</MenuItem>
                <MenuItem value="training">Training</MenuItem>
              </Select>
            </FormControl>

            {/* Controls */}
            {isTraining ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    backgroundColor: 'success.main',
                    borderRadius: 2,
                    color: 'white'
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      animation: 'pulse 1s ease-in-out infinite'
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{ textTransform: 'none' }}
                  >
                    Training Active
                  </Typography>
                </Box>
                <Button
                  onClick={pauseTraining}
                  color="warning"
                  variant="contained"
                  size="small"
                  sx={{ 
                    height: 40,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Pause
                </Button>
                <Button
                  onClick={resetGame}
                  color="error"
                  variant="contained"
                  size="small"
                  sx={{ 
                    height: 40,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Reset
                </Button>
              </Stack>
            ) : (
              <ButtonGroup
                variant="contained"
                color="primary"
                sx={{ minWidth: 220, height: 40 }}
              >
                <Button
                  onClick={startRound}
                  disabled={isTraining || !canStart}
                  color="success"
                  size="small"
                  sx={{ 
                    height: 40,
                    minWidth: 120,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  {isAI ? "Start AI Round" : "Start Round"}
                </Button>
                <Button
                  onClick={pauseTraining}
                  disabled={!canPause}
                  color="warning"
                  size="small"
                  sx={{ 
                    height: 40,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Pause
                </Button>
                <Button
                  onClick={resetGame}
                  disabled={!canReset}
                  color="error"
                  size="small"
                  sx={{ 
                    height: 40,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Reset
                </Button>
              </ButtonGroup>
            )}
          </Stack>

          {/* Right group: Grid/Speed settings */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              label="W"
              value={gridWidth}
              onChange={(e) => setGridWidth(e.target.value)}
              sx={{ width: 50, height: 40 }}
              inputProps={{ min: 4 }}
            />
            <Typography sx={{ px: 0.5 }}>x</Typography>
            <TextField
              size="small"
              label="H"
              value={gridHeight}
              onChange={(e) => setGridHeight(e.target.value)}
              sx={{ width: 50, height: 40 }}
              inputProps={{ min: 4 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={handleGridApply}
              sx={{ height: 40 }}
            >
              Apply
            </Button>
            {!isTraining && (
              <TextField
                size="small"
                label="Training Rounds"
                value={trainingRoundsInput}
                onChange={handleTrainingRoundsChange}
                sx={{ width: 100, height: 40 }}
                type="number"
                inputProps={{ min: 1 }}
              />
            )}
            <TextField
              size="small"
              label="Speed (ms)"
              value={speed}
              onChange={(e) => {
                const newSpeed = e.target.value;
                setSpeedState(newSpeed);
                const speedNum = parseInt(newSpeed);
                if (!isNaN(speedNum) && speedNum >= 10 && speedNum <= 1000) {
                  setSpeed(speedNum);
                }
              }}
              sx={{ 
                width: 90, 
                height: 40,
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
              type="number"
              inputProps={{ min: 10, max: 1000, step: 10 }}
              helperText="10-1000ms"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Game Grid (children) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: panelWidth,
          mx: "auto",
        }}
      >
        {children}
      </Box>

      {/* Statistics Panel */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 4,
          maxWidth: panelWidth,
          width: "100%",
          mx: "auto",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexWrap: "wrap", gap: 2 }}
        >
          <Box sx={{ textAlign: "center", minWidth: 100 }}>
            <Typography 
              variant="h4" 
              color="primary.main" 
              fontWeight="700"
              sx={{ 
                background: "linear-gradient(45deg, #00D4FF, #00FF88)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5
              }}
            >
              {gameState.score}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              CURRENT SCORE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Steps: {gameState.steps}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: "center", minWidth: 100 }}>
            <Typography variant="h5" color="secondary.main" fontWeight="700" sx={{ mb: 0.5 }}>
              {gameState.stats.best}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              BEST SCORE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Avg: {Math.round(gameState.stats.avg)}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: "center", minWidth: 100 }}>
            <Typography variant="h5" color="success.main" fontWeight="700" sx={{ mb: 0.5 }}>
              {gameState.stats.epsilon.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              EPSILON
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Decay: 0.995
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: "center", minWidth: 200 }}>
            <Typography variant="body1" color="info.main" fontWeight="700" sx={{ mb: 1 }}>
              Recent Scores
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: "wrap", gap: 1 }}>
              {gameState.stats.all_scores
                .slice(-6)
                .reverse()
                .map((score, i) => (
                  <Chip
                    key={i}
                    label={score}
                    color={
                      score > 10 ? "success" : score > 5 ? "warning" : "error"
                    }
                    size="small"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      minWidth: 35,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                    }}
                  />
                ))}
              {gameState.stats.all_scores.length === 0 && (
                <Typography color="text.secondary" variant="body2" sx={{ fontStyle: "italic" }}>
                  No scores yet
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Model Management Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 4,
          maxWidth: panelWidth,
          width: "100%",
          mx: "auto",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            background: "linear-gradient(45deg, #00D4FF, #00FF88)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700
          }}
        >
          AI Model Management
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Model</InputLabel>
            <Select
              value={selectedModel}
              label="Select Model"
              onChange={(e) => setSelectedModel(e.target.value)}
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {availableModels.map((model) => (
                <MenuItem key={model} value={model} sx={{ fontFamily: 'monospace' }}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => selectedModel && loadModel(selectedModel)}
            disabled={!selectedModel || !isConnected}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Load Model
          </Button>
          
          <Button 
            variant="outlined" 
            color="info"
            onClick={listModels}
            disabled={!isConnected}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Refresh
          </Button>
        </Stack>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            color="info" 
            onClick={saveModel}
            disabled={!isConnected}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Save Current Model
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={() => evaluateModel(20)}
            disabled={!isConnected}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Evaluate AI (20 games)
          </Button>
        </Stack>
      </Paper>
      {/* Show evaluation result */}
      {evaluationResult && (
        <Alert severity="info" sx={{ mt: 2, width: panelWidth, mx: "auto" }}>
          Evaluation: Avg Score = {evaluationResult.avg_score.toFixed(2)} (over{" "}
          {evaluationResult.scores.length} games)
        </Alert>
      )}
      {/* Snackbar for model save */}
      <Snackbar
        open={openSave}
        autoHideDuration={4000}
        onClose={() => setOpenSave(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          sx={{ width: panelWidth }}
        >
          Model saved as {modelSaveInfo?.filename}
        </MuiAlert>
      </Snackbar>
      {/* Snackbar for evaluation */}
      <Snackbar
        open={openEval}
        autoHideDuration={4000}
        onClose={() => setOpenEval(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="info"
          sx={{ width: panelWidth }}
        >
          Evaluation complete! Avg Score:{" "}
          {evaluationResult?.avg_score?.toFixed(2)}
        </MuiAlert>
      </Snackbar>
      
      {/* Snackbar for model loading */}
      <Snackbar
        open={openLoadSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenLoadSnackbar(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={modelLoadInfo?.success ? "success" : "error"}
          sx={{ width: panelWidth }}
        >
          {modelLoadInfo?.success 
            ? `Model ${modelLoadInfo?.filename} loaded successfully!`
            : `Failed to load model: ${modelLoadInfo?.error || 'Unknown error'}`
          }
        </MuiAlert>
      </Snackbar>
      
      {/* Training Visualization */}
      {(gameState.training || gameState.stats?.all_scores?.length > 0) && (
        <Box sx={{ width: "100%", mt: 3 }}>
          <TrainingCharts gameState={gameState} />
        </Box>
      )}
    </Stack>
  );
}
