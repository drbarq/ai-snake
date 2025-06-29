# Setup Guide & Testing Framework

## Quick Start Setup

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv ai_snake_env
source ai_snake_env/bin/activate  # Linux/Mac
# or
ai_snake_env\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import pygame, torch, numpy; print('All dependencies installed successfully!')"
```

### 2. Project Initialization

```bash
# Create project structure
mkdir ai_snake_game
cd ai_snake_game

# Create all directories
mkdir -p src/{game,ai,ui,utils} models logs assets tests

# Copy configuration files
cp config.yaml src/
cp requirements.txt .

# Initialize git repository (optional)
git init
git add .
git commit -m "Initial project setup"
```

### 3. Verification Steps

```python
# Run basic verification script
python -c "
from src.game.snake import Snake
from src.game.food import Food
from src.game.game_engine import GameEngine
print('✓ Game engine components imported successfully')

from src.ai.agent import DQNAgent
from src.ai.network import DQNetwork
from src.ai.input_processor import InputProcessor
print('✓ AI components imported successfully')

from src.ui.dashboard import TrainingDashboard
from src.ui.visualizer import AIVisualizer
print('✓ UI components imported successfully')

print('🎉 Project setup complete!')
"
```

## Development Workflow

### Phase 1: Core Game (Week 1)

```python
# Day 1-2: Basic Snake Game
# Test with: python tests/test_snake_basic.py
class TestSnakeBasics:
    def test_snake_movement(self):
        snake = Snake((10, 10), Direction.RIGHT)
        snake.move()
        assert snake.head == (11, 10)

    def test_food_generation(self):
        food = Food(20, 20)
        snake_positions = [(5, 5), (5, 6)]
        food.generate_new_food(snake_positions)
        assert food.position not in snake_positions

# Day 3-4: Game Engine Integration
# Test with: python tests/test_game_engine.py
class TestGameEngine:
    def test_complete_game_cycle(self):
        engine = GameEngine(20, 20, 30)
        initial_score = engine.get_score()

        # Simulate eating food
        engine.update(Direction.UP)
        # Verify score increase and game state consistency
```

### Phase 2: AI Foundation (Week 2)

```python
# Day 1-2: Neural Network
# Test with: python tests/test_neural_network.py
class TestNeuralNetwork:
    def test_forward_pass(self):
        network = DQNetwork(input_size=12, hidden_sizes=[64, 32], output_size=4)
        dummy_input = torch.randn(1, 12)
        output = network(dummy_input)
        assert output.shape == (1, 4)

# Day 3-4: Input Processing
# Test with: python tests/test_input_processing.py
class TestInputProcessor:
    def test_feature_extraction(self):
        processor = InputProcessor('features', {
            'danger_detection': True,
            'food_vector': True,
            'wall_distances': True
        })

        # Create mock game state
        game_state = MockGameState()
        features = processor.process_state(game_state)

        # Verify feature vector size and content
        assert len(features) == processor.get_input_size()
        assert all(isinstance(f, (int, float)) for f in features)
```

### Phase 3: Training System (Week 3)

```python
# Training validation script
def validate_training_setup():
    """Comprehensive training system validation."""

    # 1. Test individual components
    agent = DQNAgent(state_size=12, action_size=4, config=test_config)
    game_engine = GameEngine(10, 10, 30)
    trainer = AITrainer(agent, game_engine, training_config)

    # 2. Test single episode
    episode_data = trainer.train_episode()
    assert 'score' in episode_data
    assert 'steps' in episode_data
    assert 'loss' in episode_data

    # 3. Test short training session
    trainer.train(num_episodes=10)

    # 4. Verify model saving/loading
    trainer.save_checkpoint('test_model.pth')
    trainer.load_checkpoint('test_model.pth')

    print("✓ Training system validation complete")
```

### Phase 4: UI & Polish (Week 4)

```python
# UI component testing
class TestUIComponents:
    def test_dashboard_rendering(self):
        screen = pygame.display.set_mode((800, 600))
        dashboard = TrainingDashboard(screen, theme_config)

        # Test with sample data
        training_data = {
            'score': 25,
            'loss': 0.1234,
            'epsilon': 0.5
        }
        dashboard.update(training_data)
        dashboard.render()  # Should not crash

    def test_renderer_themes(self):
        screen = pygame.display.set_mode((800, 600))
        renderer = ModernRenderer(screen)

        for theme_name in ['neon_cyber', 'retro_arcade', 'minimal_clean']:
            renderer.set_theme(theme_name)
            # Render test frame - should not crash
```

## Testing Framework

### Unit Tests Structure

```
tests/
├── __init__.py
├── test_snake_game.py          # Core game logic tests
├── test_ai_components.py       # Neural network and agent tests
├── test_input_processing.py    # Input transformation tests
├── test_training.py            # Training system tests
├── test_ui_components.py       # User interface tests
├── test_integration.py         # Full system integration tests
└── fixtures/
    ├── test_config.yaml        # Test configuration
    ├── sample_models/          # Pre-trained test models
    └── mock_data.py           # Mock game states and data
```

### Performance Testing

```python
# Performance benchmarks
import time
import psutil
import pytest

class TestPerformance:
    def test_game_fps_performance(self):
        """Ensure game runs at target FPS."""
        game = AISnakeGame('test_config.yaml')

        start_time = time.time()
        frame_count = 0
        target_frames = 300  # 5 seconds at 60 FPS

        while frame_count < target_frames:
            game.update_frame()
            frame_count += 1

        elapsed_time = time.time() - start_time
```
