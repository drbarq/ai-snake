# AI Snake Game

An AI-powered Snake game where a Deep Q-Learning (DQN) agent learns to play Snake optimally through reinforcement learning. The project features a modern React frontend with real-time visualization and a Python backend with advanced AI training capabilities.

## 🎮 Features

### Core Game
- **Classic Snake gameplay** with smooth, responsive controls
- **AI-powered player** using Deep Q-Network (DQN) reinforcement learning
- **Real-time training** with live visualization of AI learning progress
- **Multiple game modes**: Manual, AI, and Training modes

### AI System
- **Deep Q-Network (DQN)** with experience replay and target networks
- **Modular input processing** supporting multiple state representations:
  - Feature-based: Engineered features (danger detection, food vector, distances)
  - Grid-based: Full game board matrix representation
  - Vision-based: Ray-casting sensors
  - Hybrid: Combined approaches
- **Configurable neural network architectures**
- **Real-time hyperparameter adjustment**
- **Model saving/loading** with checkpoint management

### Modern UI
- **React-based frontend** with Material-UI components
- **Cyberpunk-themed design** with neon effects and animations
- **Real-time training dashboard** with performance metrics
- **WebSocket communication** for live game state updates
- **Responsive design** for desktop and mobile

## 🏗️ Architecture

### Backend (Python)
- **FastAPI WebSocket server** for real-time communication
- **Game Engine** with modular physics and collision detection
- **AI Training System** with configurable DQN agent
- **Advanced rendering** with multiple visual themes
- **RESTful API** for configuration management

### Frontend (React)
- **Modern React** with hooks and context
- **Material-UI** components with custom theming
- **Real-time WebSocket** integration
- **Interactive dashboards** for training visualization
- **Responsive game board** with animated graphics

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd ai_snake_game

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn backend_server:app --reload
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ai-snake-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Web Interface**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎯 Usage

### Game Modes

1. **Manual Mode**
   - Use WASD or arrow keys to control the snake
   - Press spacebar to restart after game over

2. **AI Mode**
   - Watch the trained AI agent play
   - Click "START AI ROUND" to begin

3. **Training Mode**
   - AI learns through trial and error
   - Configure training parameters in real-time
   - Monitor progress through live charts

### Training Configuration

The AI system supports extensive configuration:

```yaml
# AI Training Parameters
ai:
  network_type: "FeatureDQN"
  learning_rate: 0.001
  batch_size: 32
  epsilon_decay: 0.995
  
# Feature Processing
features:
  danger_detection: true
  food_vector: true
  wall_distances: true
  body_awareness: true
```

### API Endpoints

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration
- `GET /api/config/presets` - Get configuration presets
- `GET /health` - Health check

## 📊 AI Training Details

### Deep Q-Network Architecture
- **State representation**: 11-dimensional feature vector
- **Action space**: 4 actions (UP, DOWN, LEFT, RIGHT)
- **Network**: Fully connected layers with ReLU activation
- **Experience replay**: 10,000 experience buffer
- **Target network**: Updated every 100 steps

### Feature Engineering
The AI processes game state through engineered features:
- **Danger detection**: Immediate collision risk in each direction
- **Food vector**: Relative position and distance to food
- **Wall distances**: Distance to boundaries
- **Body awareness**: Proximity to snake body segments
- **Movement state**: Current direction and momentum

### Training Process
1. **Exploration**: Agent explores random actions (high epsilon)
2. **Exploitation**: Agent uses learned Q-values (low epsilon)
3. **Experience replay**: Training on batches of past experiences
4. **Target network updates**: Stabilizing training with delayed updates

## 🛠️ Development

### Project Structure
```
ai_snake_game/
├── src/
│   ├── game/          # Core game logic
│   ├── ai/            # AI agent and training
│   ├── ui/            # Dashboard and visualization
│   └── utils/         # Utilities and configuration
├── backend_server.py  # FastAPI WebSocket server
├── config.yaml        # Configuration file
└── requirements.txt   # Python dependencies

ai-snake-frontend/
├── src/
│   ├── components/    # React components
│   ├── contexts/      # React context providers
│   ├── services/      # WebSocket service
│   └── styles/        # CSS and styling
├── package.json       # Node.js dependencies
└── vite.config.js     # Vite configuration
```

### Running Tests
```bash
# Python backend tests
cd ai_snake_game
pytest tests/

# Frontend tests
cd ai-snake-frontend
npm test
```

### Building for Production
```bash
# Backend - already production ready with uvicorn
uvicorn backend_server:app --host 0.0.0.0 --port 8000

# Frontend build
cd ai-snake-frontend
npm run build
```

## 🎨 Visual Themes

The game supports multiple visual themes:
- **Neon Cyber**: Futuristic cyberpunk aesthetic with glowing effects
- **Retro Arcade**: Classic 80s arcade game styling
- **Minimal Clean**: Modern minimalist design

## 🔧 Configuration

### Environment Variables
```bash
# Frontend
VITE_WS_URL=ws://localhost:8000/ws

# Backend
PORT=8000
HOST=0.0.0.0
```

### Model Configuration
The AI system can be extensively configured through the web interface or API:
- **Reward structure**: Death penalty, food reward, step penalty
- **Network architecture**: Layer sizes, activation functions
- **Training parameters**: Learning rate, batch size, epsilon decay
- **Feature selection**: Enable/disable specific input features

## 🚀 Deployment

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. **Backend**: Deploy FastAPI server with uvicorn
2. **Frontend**: Build React app and serve with nginx
3. **Database**: Optional PostgreSQL for persistent storage

### Cloud Platforms
- **Railway**: Configured with `railway.toml`
- **Render**: Configured with `render.yaml`
- **Vercel**: Frontend deployment with `vercel.json`

## 📈 Performance Metrics

The system tracks comprehensive training metrics:
- **Episode scores**: Individual game performance
- **Average performance**: Rolling average over recent episodes
- **Training loss**: Neural network learning progress
- **Epsilon decay**: Exploration vs exploitation balance
- **Win rate**: Percentage of games achieving target score

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For Deep Q-Network research and algorithms
- **PyTorch**: For deep learning framework
- **React**: For frontend framework
- **Material-UI**: For UI components
- **FastAPI**: For high-performance API backend


---

**Built with ❤️ using Python, React, and AI**