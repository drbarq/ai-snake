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
    startTraining,
  } = useGame();

  // UI state
  const [mode, setModeState] = useState(gameState.mode);
  const [gridWidth, setGridWidth] = useState(gridSize.width.toString());
  const [gridHeight, setGridHeight] = useState(gridSize.height.toString());
  const [speed, setSpeed] = useState("100"); // Placeholder for speed
  const [openSave, setOpenSave] = useState(false);
  const [openEval, setOpenEval] = useState(false);
  const [trainingRoundsInput, setTrainingRoundsInput] = useState("");
  const [trainingRoundsValid, setTrainingRoundsValid] = useState(false);

  React.useEffect(() => {
    if (modelSaveInfo) setOpenSave(true);
  }, [modelSaveInfo]);
  React.useEffect(() => {
    if (evaluationResult) setOpenEval(true);
  }, [evaluationResult]);
  React.useEffect(() => {
    setModeState(gameState.mode);
  }, [gameState.mode]);

  // Handlers
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    if (newMode !== gameState.mode) {
      if (newMode === "training") {
        // For training mode, we need to start training
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
        setMode(newMode);
      }
    }
    setModeState(newMode);
  };
  const handleTrainingRoundsChange = (e) => {
    const val = e.target.value;
    setTrainingRoundsInput(val);
    const num = parseInt(val);
    setTrainingRoundsValid(!isNaN(num) && num > 0);
  };
  const handleStartTraining = () => {
    if (trainingRoundsValid) {
      updateTrainingRounds(parseInt(trainingRoundsInput));
      startTraining();
    }
  };
  const handleGridApply = () => {
    const width = parseInt(gridWidth);
    const height = parseInt(gridHeight);
    if (width > 3 && height > 3) {
      updateGridSize(width, height);
    }
  };

  // Controls state
  const isManual = mode === "manual";
  const isAI = mode === "ai";
  const isTraining = mode === "training";
  const isGameOver = gameState.game_over;
  const canStart = isManual || isAI; // Both manual and AI modes need manual start
  const canPause = isTraining;
  const canReset = true;

  const panelWidth = 600;
  return (
    <Stack
      direction="column"
      spacing={3}
      sx={{ width: "100%", alignItems: "center", mt: 4 }}
    >
      {/* Top Panel: Mode Dropdown, Controls, Settings */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 3,
          mx: "auto",
          overflow: "visible",
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
                value={mode}
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
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight="600"
                >
                  Training Active
                </Typography>
                <Button
                  onClick={pauseTraining}
                  color="warning"
                  variant="contained"
                  size="small"
                  sx={{ height: 40 }}
                >
                  Pause
                </Button>
                <Button
                  onClick={resetGame}
                  color="error"
                  variant="contained"
                  size="small"
                  sx={{ height: 40 }}
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
                  disabled={isTraining || !canStart || !isGameOver}
                  color="success"
                  size="small"
                  sx={{ height: 40 }}
                >
                  {isAI ? "Start AI Round" : "Start Round"}
                </Button>
                <Button
                  onClick={pauseTraining}
                  disabled={!canPause}
                  color="warning"
                  size="small"
                  sx={{ height: 40 }}
                >
                  Pause
                </Button>
                <Button
                  onClick={resetGame}
                  disabled={!canReset}
                  color="error"
                  size="small"
                  sx={{ height: 40 }}
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
            <TextField
              size="small"
              label="Speed"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              sx={{ width: 70, height: 40, opacity: 0.5 }}
              disabled
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
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 3,
          maxWidth: panelWidth,
          width: "100%",
          mx: "auto",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              Score: {gameState.score}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Steps: {gameState.steps}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="secondary.main" fontWeight="bold">
              Best: {gameState.stats.best}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg: {Math.round(gameState.stats.avg)} | Last:{" "}
              {gameState.stats.last}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              Epsilon: {gameState.stats.epsilon.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Decay: 0.995
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="info.main" fontWeight="bold">
              Recent Scores
            </Typography>
            <Stack direction="row" spacing={1}>
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
                    variant="outlined"
                  />
                ))}
              {gameState.stats.all_scores.length === 0 && (
                <Typography color="gray.400" variant="body2">
                  No scores yet
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Save/Evaluate Buttons */}
      <Stack
        direction="row"
        spacing={2}
        width={panelWidth}
        justifyContent="center"
        mx="auto"
      >
        <Button variant="outlined" color="info" onClick={saveModel}>
          Save Model
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => evaluateModel(20)}
        >
          Evaluate AI
        </Button>
      </Stack>
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
    </Stack>
  );
}
