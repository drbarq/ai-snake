import { Box, Typography, Paper } from "@mui/material";
import { useGame } from "../contexts/GameContext";
import { useEffect } from "react";

export default function GameBoard() {
  const { gameState, sendDirection } = useGame();

  const cellSize = 20;
  const gridWidth = gameState.grid_width;
  const gridHeight = gameState.grid_height;

  // Keyboard controls for manual mode
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (gameState.mode !== "manual") return;

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault();
          sendDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          sendDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          sendDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          sendDirection("RIGHT");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.mode, sendDirection]);

  const renderSnake = () => {
    return gameState.snake.map((segment, index) => (
      <Box
        key={index}
        sx={{
          position: "absolute",
          width: cellSize - 2,
          height: cellSize - 2,
          left: segment[0] * cellSize + 1,
          top: segment[1] * cellSize + 1,
          background:
            index === 0
              ? "linear-gradient(45deg, #32D74B, #00FF88)"
              : "linear-gradient(45deg, #00FF88, #32D74B)",
          borderRadius: 1,
          animation: `pulse ${2 + index * 0.1}s ease-in-out infinite`,
          boxShadow: "0 0 10px rgba(50, 215, 75, 0.5)",
          zIndex: 2,
        }}
      />
    ));
  };

  const renderFood = () => {
    if (!gameState.food) return null;

    return (
      <Box
        sx={{
          position: "absolute",
          width: cellSize - 4,
          height: cellSize - 4,
          left: gameState.food[0] * cellSize + 2,
          top: gameState.food[1] * cellSize + 2,
          background: "linear-gradient(45deg, #FF6B35, #FF8C42)",
          borderRadius: "50%",
          animation: "pulse 1.5s ease-in-out infinite",
          boxShadow: "0 0 15px rgba(255, 107, 53, 0.6)",
          zIndex: 1,
        }}
      />
    );
  };

  // Game Over overlay
  const showGameOver = gameState.game_over && !gameState.training;

  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: "100%", md: "600px" },
        height: { xs: "400px", md: "600px" },
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        border: "2px solid",
        borderColor: "rgba(0, 212, 255, 0.3)",
        bgcolor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-2px",
          left: "-2px",
          right: "-2px",
          bottom: "-2px",
          background:
            "linear-gradient(45deg, #00D4FF, #00FF88, #8B5CF6, #00D4FF)",
          borderRadius: 4,
          zIndex: -1,
          animation: "neonGlow 3s ease-in-out infinite alternate",
        },
      }}
    >
      {/* Game grid container */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: gridWidth * cellSize,
          height: gridHeight * cellSize,
          border: "1px solid rgba(0, 212, 255, 0.2)",
          borderRadius: 1,
          background: "rgba(10, 20, 30, 0.7)",
          zIndex: 1,
        }}
      >
        {/* Grid lines inside the play area */}
        {[...Array(gridWidth + 1)].map((_, x) => (
          <Box
            key={"v-" + x}
            sx={{
              position: "absolute",
              left: x * cellSize,
              top: 0,
              width: x === gridWidth ? 1 : 2,
              height: gridHeight * cellSize,
              bgcolor: "rgba(0, 212, 255, 0.5)",
              opacity: 0.7,
              pointerEvents: "none",
            }}
          />
        ))}
        {[...Array(gridHeight + 1)].map((_, y) => (
          <Box
            key={"h-" + y}
            sx={{
              position: "absolute",
              top: y * cellSize,
              left: 0,
              width: gridWidth * cellSize,
              height: y === gridHeight ? 1 : 2,
              bgcolor: "rgba(0, 212, 255, 0.5)",
              opacity: 0.7,
              pointerEvents: "none",
            }}
          />
        ))}
        {renderSnake()}
        {renderFood()}
        {/* Game Over Overlay */}
        {showGameOver && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0,0,0,0.7)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3" color="#FF6B35" fontWeight="bold" mb={2}>
              GAME OVER
            </Typography>
            <Typography variant="h5" color="white" mb={2}>
              Score: {gameState.score}
            </Typography>
            <Typography variant="body1" color="gray.300">
              Click "START ROUND" to play again
            </Typography>
          </Box>
        )}
      </Box>

      {/* Game info overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 3,
        }}
      >
        <Typography variant="body2" color="white" fontWeight="600">
          Mode: {gameState.mode.toUpperCase()}
        </Typography>
        {gameState.training && (
          <Typography variant="body2" color="#00FF88" fontWeight="600">
            Training: {gameState.current_episode}/{gameState.target_episodes}
          </Typography>
        )}
        {gameState.mode === "manual" && (
          <Typography
            variant="caption"
            color="gray.400"
            display="block"
            mt={0.5}
          >
            Use WASD or Arrow Keys
          </Typography>
        )}
      </Box>

      {/* Corner accents */}
      <Box
        sx={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          borderTop: "2px solid",
          borderLeft: "2px solid",
          borderColor: "#00D4FF",
          borderRadius: "4px 0 0 0",
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "20px",
          height: "20px",
          borderTop: "2px solid",
          borderRight: "2px solid",
          borderColor: "#00FF88",
          borderRadius: "0 4px 0 0",
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          borderBottom: "2px solid",
          borderLeft: "2px solid",
          borderColor: "#8B5CF6",
          borderRadius: "0 0 0 4px",
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "20px",
          height: "20px",
          borderBottom: "2px solid",
          borderRight: "2px solid",
          borderColor: "#FF6B35",
          borderRadius: "0 0 4px 0",
          opacity: 0.7,
        }}
      />
    </Paper>
  );
}
