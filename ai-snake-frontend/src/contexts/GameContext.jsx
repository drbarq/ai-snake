import React, { createContext, useContext, useState, useEffect } from "react";
import WebSocketService from "../services/websocket";

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    snake: [],
    food: { x: 0, y: 0 },
    score: 0,
    steps: 0,
    grid_width: 15,
    grid_height: 17,
    mode: "manual",
    training: false,
    current_episode: 0,
    target_episodes: 100,
    stats: {
      all_scores: [],
      best: 0,
      avg: 0,
      last: 0,
      epsilon: 1.0,
    },
  });

  const [gridSize, setGridSize] = useState({ width: 15, height: 17 });
  const [trainingRounds, setTrainingRounds] = useState(100);
  const [isConnected, setIsConnected] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [modelSaveInfo, setModelSaveInfo] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    WebSocketService.connect();

    // Set up message handler
    WebSocketService.onMessage((data) => {
      if (data.type === "evaluation_result") {
        setEvaluationResult(data);
      } else if (data.type === "save_model") {
        setModelSaveInfo(data);
      } else {
        setGameState(data);
      }
    });

    // Cleanup on unmount
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  // Update connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(WebSocketService.isConnected);
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateGridSize = (width, height) => {
    setGridSize({ width, height });
    WebSocketService.setGrid(width, height);
  };

  const updateTrainingRounds = (rounds) => {
    setTrainingRounds(rounds);
    WebSocketService.setTrainingRounds(rounds);
  };

  const startTraining = () => {
    WebSocketService.startTraining();
  };

  const pauseTraining = () => {
    WebSocketService.pauseTraining();
  };

  const startRound = () => {
    WebSocketService.startRound();
  };

  const toggleMode = () => {
    WebSocketService.toggleMode();
  };

  const resetGame = () => {
    WebSocketService.resetGame();
  };

  const sendDirection = (direction) => {
    WebSocketService.sendDirection(direction);
  };

  const saveModel = () => {
    WebSocketService.saveModel();
  };

  const evaluateModel = (episodes = 20) => {
    WebSocketService.evaluateModel(episodes);
  };

  const value = {
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
    sendDirection,
    saveModel,
    evaluateModel,
    evaluationResult,
    modelSaveInfo,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
