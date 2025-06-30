# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered Snake game project with two main components:
1. **Python AI Backend** (`ai_snake_game/`) - Deep Q-Learning agent that learns to play Snake
2. **React Frontend** (`ai-snake-frontend/`) - Modern web interface for visualizing AI training

## Architecture

### Python Backend (`ai_snake_game/`)
- **Game Engine**: Core Snake game logic in `src/game/` (snake.py, food.py, game_engine.py, renderer.py)
- **AI System**: DQN agent implementation in `src/ai/` (agent.py, network.py, input_processor.py, trainer.py)
- **UI Components**: Training dashboard and visualizations in `src/ui/`
- **Backend Server**: FastAPI WebSocket server (`backend_server.py`) for React frontend communication

### React Frontend (`ai-snake-frontend/`)
- **Components**: Game visualization (`GameBoard.jsx`), training dashboard (`Dashboard.jsx`)
- **Services**: WebSocket communication (`websocket.js`)
- **Context**: Game state management (`GameContext.jsx`)

## Development Commands

### Python Backend
```bash
# Navigate to Python backend
cd ai_snake_game

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run standalone AI training (pygame interface)
python src/main.py

# Run FastAPI backend server for React frontend
uvicorn backend_server:app --reload

# Run tests
pytest tests/
```

### React Frontend  
```bash
# Navigate to React frontend
cd ai-snake-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Configuration

### Python Configuration (`ai_snake_game/config.yaml`)
- Game settings: grid size, FPS, snake length
- AI training parameters: learning rate, epsilon decay, batch size
- Visual themes: neon_cyber, retro_arcade, minimal_clean
- Input processing modes: grid, features, vision, hybrid

### Key AI Components
- **Agent**: `DQNAgent` class with experience replay and target networks
- **Networks**: Multiple architectures (GridDQN, FeatureDQN, VisionDQN, HybridDQN)
- **Input Processing**: Modular system for different state representations
- **Training**: Configurable hyperparameters and model checkpointing

## Running the Full System

1. **Backend**: Start the FastAPI server (`uvicorn backend_server:app --reload`)
2. **Frontend**: Start the React dev server (`npm run dev`)
3. **Access**: Open http://localhost:5173 to view the web interface

## Key Files

- `ai_snake_game/src/main.py` - Standalone Python game with pygame
- `ai_snake_game/backend_server.py` - WebSocket server for React frontend
- `ai_snake_game/config.yaml` - Main configuration file
- `ai-snake-frontend/src/services/websocket.js` - Frontend WebSocket client
- `PROJECT_PLAN.md` - Detailed implementation specifications
- `TEST_FRAMEWORK.md` - Development workflow and testing guide

## AI Training Modes

The system supports multiple AI input representations:
- **Grid-based**: Full game board as matrix input
- **Feature-based**: Engineered features (danger detection, food vector, distances)
- **Vision-based**: Ray-casting sensors in multiple directions  
- **Hybrid**: Combination of multiple approaches

## Technology Stack

**Backend**: Python, PyTorch, pygame, FastAPI, WebSockets
**Frontend**: React, Vite, Material-UI, WebSockets
**AI**: Deep Q-Networks (DQN) with experience replay