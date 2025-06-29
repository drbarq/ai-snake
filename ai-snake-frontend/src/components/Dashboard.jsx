import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Paper,
  Alert,
} from "@mui/material";
import { useGame } from "../contexts/GameContext";

export default function Dashboard() {
  const {
    gameState,
    gridSize,
    trainingRounds,
    isConnected,
    updateGridSize,
    updateTrainingRounds,
    startTraining,
    pauseTraining,
    startRound,
    toggleMode,
    resetGame,
  } = useGame();

  const [gridWidth, setGridWidth] = useState(gridSize.width.toString());
  const [gridHeight, setGridHeight] = useState(gridSize.height.toString());
  const [rounds, setRounds] = useState(trainingRounds.toString());

  const handleGridApply = () => {
    const width = parseInt(gridWidth);
    const height = parseInt(gridHeight);
    if (width > 3 && height > 3) {
      updateGridSize(width, height);
    }
  };

  const handleRoundsSet = () => {
    const roundsNum = parseInt(rounds);
    if (roundsNum > 0) {
      updateTrainingRounds(roundsNum);
    }
  };

  const handleModeToggle = (mode) => {
    if (mode === "manual") {
      if (gameState.mode !== "manual") {
        toggleMode();
      }
    } else if (mode === "ai") {
      if (gameState.mode !== "ai") {
        toggleMode();
      }
    } else if (mode === "train") {
      if (!gameState.training) {
        startTraining();
      } else {
        pauseTraining();
      }
    }
  };

  const getModeButtonVariant = (mode) => {
    if (mode === "manual" && gameState.mode === "manual") return "contained";
    if (mode === "ai" && gameState.mode === "ai") return "contained";
    if (mode === "train" && gameState.training) return "contained";
    return "outlined";
  };

  const trainingProgress =
    gameState.target_episodes > 0
      ? (gameState.current_episode / gameState.target_episodes) * 100
      : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        p: 4,
        borderRadius: 4,
        width: "100%",
        maxWidth: "400px",
        mx: "auto",
        bgcolor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      {!isConnected && (
        <Alert severity="warning" sx={{ width: "100%", mb: 2 }}>
          Not connected to backend server
        </Alert>
      )}

      <Typography variant="h4" color="white" fontWeight="bold">
        AI SNAKE
      </Typography>

      <Stack width="100%" spacing={3}>
        {/* Grid Size Control */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 212, 255, 0.05)",
            border: "1px solid rgba(0, 212, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight="600" color="white">
              GRID SIZE
            </Typography>
            <Chip
              label="CONFIG"
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="W"
              value={gridWidth}
              onChange={(e) => setGridWidth(e.target.value)}
              sx={{
                width: "60px",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(0, 212, 255, 0.3)",
                  },
                  "& input": {
                    color: "white",
                  },
                },
              }}
            />
            <Typography color="gray.400">×</Typography>
            <TextField
              size="small"
              placeholder="H"
              value={gridHeight}
              onChange={(e) => setGridHeight(e.target.value)}
              sx={{
                width: "60px",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(0, 212, 255, 0.3)",
                  },
                  "& input": {
                    color: "white",
                  },
                },
              }}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleGridApply}
            >
              APPLY
            </Button>
          </Box>
        </Paper>

        {/* Training Rounds Control */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 255, 136, 0.05)",
            border: "1px solid rgba(0, 255, 136, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight="600" color="white">
              TRAINING ROUNDS
            </Typography>
            <Chip label="AI" size="small" color="success" variant="outlined" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="Rounds"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
              sx={{
                width: "80px",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(0, 255, 136, 0.3)",
                  },
                  "& input": {
                    color: "white",
                  },
                },
              }}
            />
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={handleRoundsSet}
            >
              SET
            </Button>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={trainingProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(0, 0, 0, 0.3)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#00FF88",
                },
              }}
            />
            <Typography
              variant="caption"
              color="gray.400"
              textAlign="center"
              display="block"
              mt={0.5}
            >
              {Math.round(trainingProgress)}% Complete (
              {gameState.current_episode}/{gameState.target_episodes})
            </Typography>
          </Box>
        </Paper>

        {/* Game Mode Selection */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(139, 92, 246, 0.05)",
            border: "1px solid rgba(139, 92, 246, 0.1)",
          }}
        >
          <Typography
            variant="body2"
            fontWeight="600"
            color="white"
            textAlign="center"
            mb={1.5}
          >
            GAME MODE
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Button
              size="small"
              variant={getModeButtonVariant("manual")}
              color="success"
              onClick={() => handleModeToggle("manual")}
            >
              MANUAL
            </Button>
            <Button
              size="small"
              variant={getModeButtonVariant("ai")}
              color="primary"
              onClick={() => handleModeToggle("ai")}
            >
              AI
            </Button>
            <Button
              size="small"
              variant={getModeButtonVariant("train")}
              color="secondary"
              onClick={() => handleModeToggle("train")}
            >
              TRAIN
            </Button>
          </Box>
        </Paper>

        {/* Start Round Button */}
        {gameState.mode === "manual" && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "rgba(255, 193, 7, 0.05)",
              border: "1px solid rgba(255, 193, 7, 0.1)",
            }}
          >
            <Typography
              variant="body2"
              fontWeight="600"
              color="#FFC107"
              textAlign="center"
              mb={1.5}
            >
              MANUAL PLAY
            </Typography>
            <Button
              fullWidth
              size="medium"
              variant="contained"
              color="warning"
              onClick={startRound}
            >
              START ROUND
            </Button>
          </Paper>
        )}
      </Stack>

      {/* Stats Section */}
      <Stack width="100%" spacing={2}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(255, 107, 53, 0.05)",
            border: "1px solid rgba(255, 107, 53, 0.1)",
          }}
        >
          <Typography variant="body2" fontWeight="600" color="#FF6B35">
            CURRENT SCORE
          </Typography>
          <Typography variant="h3" fontWeight="800" color="white">
            {gameState.score}
          </Typography>
          <Typography variant="caption" color="gray.400">
            Steps: {gameState.steps} | Time: 00:00
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 212, 255, 0.05)",
            border: "1px solid rgba(0, 212, 255, 0.1)",
          }}
        >
          <Typography variant="body2" fontWeight="600" color="#00D4FF">
            BEST PERFORMANCE
          </Typography>
          <Typography variant="h3" fontWeight="800" color="white">
            {gameState.stats.best}
          </Typography>
          <Typography variant="caption" color="gray.400">
            Avg: {Math.round(gameState.stats.avg)} | Last:{" "}
            {gameState.stats.last} | Epoch: {gameState.current_episode}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 255, 136, 0.05)",
            border: "1px solid rgba(0, 255, 136, 0.1)",
          }}
        >
          <Typography variant="body2" fontWeight="600" color="#00FF88">
            EXPLORATION RATE
          </Typography>
          <Typography variant="h3" fontWeight="800" color="white">
            {gameState.stats.epsilon.toFixed(2)}
          </Typography>
          <Typography variant="caption" color="gray.400">
            Epsilon: {gameState.stats.epsilon.toFixed(2)} | Decay: 0.995
          </Typography>
        </Paper>
      </Stack>

      {/* Recent Scores */}
      <Box width="100%">
        <Typography
          variant="body2"
          fontWeight="600"
          color="white"
          textAlign="center"
          mb={1.5}
        >
          RECENT SCORES
        </Typography>
        <Paper
          elevation={0}
          sx={{
            maxHeight: "120px",
            overflowY: "auto",
            bgcolor: "rgba(0, 0, 0, 0.3)",
            p: 1.5,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Stack spacing={1}>
            {gameState.stats.all_scores
              .slice(-6)
              .reverse()
              .map((score, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography color="white" fontWeight="600" variant="body2">
                    {score}
                  </Typography>
                  <Chip
                    label={score > 10 ? "GOOD" : score > 5 ? "OK" : "POOR"}
                    size="small"
                    color={
                      score > 10 ? "success" : score > 5 ? "warning" : "error"
                    }
                    variant="outlined"
                  />
                </Box>
              ))}
            {gameState.stats.all_scores.length === 0 && (
              <Typography color="gray.400" textAlign="center" variant="body2">
                No scores yet
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* Reset Button */}
      <Button
        fullWidth
        size="large"
        variant="contained"
        color="error"
        sx={{ mt: 2 }}
        onClick={resetGame}
      >
        RESET GAME
      </Button>
    </Paper>
  );
}
