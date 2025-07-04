"""
Backend WebSocket server for AI Snake Game (for React frontend)
Run with: uvicorn backend_server:app --reload

Requirements:
- fastapi
- uvicorn
- websockets

pip install fastapi uvicorn websockets
"""
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from src.game.game_engine import GameEngine, RewardConfig as GameRewardConfig
from src.ai.agent import DQNAgent

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint for Railway
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI Snake Game Backend is running"}

# Root endpoint for Render health checks
@app.get("/")
async def root():
    return {"message": "AI Snake Game Backend API", "status": "running", "docs": "/docs"}

clients = set()

# --- Game Setup ---
GRID_W, GRID_H, CELL_SIZE = 15, 17, 20
DEFAULT_TRAINING_ROUNDS = 100

game_engine = None  # Will be initialized after configuration is defined
agent_config = {
    'state_size': 11,
    'action_size': 4,
    'learning_rate': 0.001,
    'epsilon_start': 1.0,
    'epsilon_end': 0.01,
    'epsilon_decay': 0.995,
    'batch_size': 32,
    'memory_size': 10000,
    'hidden_layers': [64, 32],
    'target_update_frequency': 100
}
agent = DQNAgent(11, 4, agent_config)

# Game state
ai_mode = False
training_mode = False
training_paused = False  # Track if training is paused
target_episodes = DEFAULT_TRAINING_ROUNDS
current_episode = 0
episode_scores = []
training_stats = {
    'scores': [],
    'avg_score': 0,
    'best_score': 0,
    'epsilon': agent.epsilon
}
all_scores = []
manual_direction = 'RIGHT'  # Default direction
game_speed = 100  # Default speed (milliseconds between moves)
training_losses = []  # Track training losses
episode_steps = []  # Track steps per episode
win_rate_history = []  # Track win rate over time

# --- Pydantic Models for Configuration ---

class RewardConfig(BaseModel):
    death_penalty: float = -10.0
    food_reward: float = 10.0
    step_penalty: float = -0.1
    win_reward: float = 100.0

class NetworkConfig(BaseModel):
    type: str = "FeatureDQN"  # GridDQN, FeatureDQN, VisionDQN, HybridDQN
    hidden_layers: List[int] = [256, 128]
    activation: str = "relu"

class TrainingConfig(BaseModel):
    learning_rate: float = 0.001
    batch_size: int = 32
    memory_size: int = 50000
    epsilon_start: float = 1.0
    epsilon_end: float = 0.01
    epsilon_decay: float = 0.995
    target_update_frequency: int = 1000

class FeatureConfig(BaseModel):
    danger_detection: bool = True
    food_vector: bool = True
    wall_distances: bool = True
    body_awareness: bool = True
    movement_state: bool = True

class VisionConfig(BaseModel):
    ray_count: int = 8
    ray_length: int = 10
    detect_walls: bool = True
    detect_body: bool = True
    detect_food: bool = True

class ModelConfiguration(BaseModel):
    rewards: RewardConfig = RewardConfig()
    network: NetworkConfig = NetworkConfig()
    training: TrainingConfig = TrainingConfig()
    features: FeatureConfig = FeatureConfig()
    vision: VisionConfig = VisionConfig()

# Global configuration state
current_config = ModelConfiguration()

def create_reward_config_from_current():
    """Create GameRewardConfig from current API config"""
    return GameRewardConfig(
        death_penalty=current_config.rewards.death_penalty,
        food_reward=current_config.rewards.food_reward,
        step_penalty=current_config.rewards.step_penalty,
        win_reward=current_config.rewards.win_reward
    )

def initialize_game_engine():
    """Initialize game engine with current configuration"""
    global game_engine
    game_engine = GameEngine(GRID_W, GRID_H, CELL_SIZE, create_reward_config_from_current())

# Initialize game engine with default configuration
initialize_game_engine()

# --- Configuration API Endpoints ---

@app.get("/api/config")
async def get_configuration() -> ModelConfiguration:
    """Get current model configuration"""
    return current_config

@app.post("/api/config")
async def update_configuration(config: ModelConfiguration) -> Dict[str, str]:
    """Update model configuration"""
    global current_config, agent, game_engine, agent_config
    
    # Validate that training is not active
    if training_mode and not training_paused:
        raise HTTPException(
            status_code=400, 
            detail="Cannot update configuration while training is active. Please pause or stop training first."
        )
    
    try:
        # Update the global configuration
        current_config = config
        
        # Update agent configuration
        agent_config.update({
            'learning_rate': config.training.learning_rate,
            'batch_size': config.training.batch_size,
            'memory_size': config.training.memory_size,
            'epsilon_start': config.training.epsilon_start,
            'epsilon_end': config.training.epsilon_end,
            'epsilon_decay': config.training.epsilon_decay,
            'target_update_frequency': config.training.target_update_frequency,
            'hidden_layers': config.network.hidden_layers,
        })
        
        # Recreate agent with new configuration
        state_size = 11  # This should be calculated based on enabled features
        action_size = 4
        agent = DQNAgent(state_size, action_size, agent_config)
        
        # Recreate game engine with new reward configuration
        initialize_game_engine()
        
        print(f"Configuration updated successfully")
        print(f"Network type: {config.network.type}")
        print(f"Hidden layers: {config.network.hidden_layers}")
        print(f"Learning rate: {config.training.learning_rate}")
        print(f"Rewards: Death={config.rewards.death_penalty}, Food={config.rewards.food_reward}")
        
        return {"status": "success", "message": "Configuration updated successfully"}
        
    except Exception as e:
        print(f"Error updating configuration: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update configuration: {str(e)}")

@app.get("/api/config/rewards")
async def get_reward_config() -> RewardConfig:
    """Get current reward configuration"""
    return current_config.rewards

@app.post("/api/config/rewards")
async def update_reward_config(rewards: RewardConfig) -> Dict[str, str]:
    """Update reward configuration"""
    global current_config
    
    if training_mode and not training_paused:
        raise HTTPException(
            status_code=400, 
            detail="Cannot update rewards while training is active"
        )
    
    current_config.rewards = rewards
    # Recreate game engine with new reward configuration
    initialize_game_engine()
    print(f"Rewards updated: {rewards}")
    return {"status": "success", "message": "Reward configuration updated"}

@app.get("/api/config/presets")
async def get_configuration_presets() -> Dict[str, ModelConfiguration]:
    """Get predefined configuration presets"""
    return {
        "default": ModelConfiguration(),
        "aggressive": ModelConfiguration(
            rewards=RewardConfig(death_penalty=-20.0, food_reward=15.0, step_penalty=-0.2),
            training=TrainingConfig(learning_rate=0.002, epsilon_decay=0.99)
        ),
        "conservative": ModelConfiguration(
            rewards=RewardConfig(death_penalty=-5.0, food_reward=5.0, step_penalty=-0.05),
            training=TrainingConfig(learning_rate=0.0005, epsilon_decay=0.998)
        ),
        "exploration": ModelConfiguration(
            training=TrainingConfig(epsilon_start=1.0, epsilon_end=0.1, epsilon_decay=0.999)
        )
    }

# --- Game State Serialization ---

def calculate_win_rate():
    """Calculate win rate based on recent scores (score > 5 considered a win)"""
    if len(all_scores) < 10:
        return 0.0
    recent_scores = all_scores[-20:]  # Last 20 games
    wins = sum(1 for score in recent_scores if score > 5)
    return wins / len(recent_scores) * 100

def get_game_state():
    mode = 'training' if training_mode else ('ai' if ai_mode else 'manual')
    return {
        'snake': game_engine.snake.get_body_positions(),
        'food': game_engine.food.get_position(),
        'score': game_engine.score,
        'steps': game_engine.steps,
        'grid_width': game_engine.grid_width,
        'grid_height': game_engine.grid_height,
        'mode': mode,
        'training': training_mode,
        'training_paused': training_paused,
        'current_episode': current_episode,
        'target_episodes': target_episodes,
        'game_over': game_engine.is_game_over(),
        'stats': {
            'all_scores': all_scores,
            'best': max(all_scores) if all_scores else 0,
            'avg': sum(all_scores) / len(all_scores) if all_scores else 0,
            'last': all_scores[-1] if all_scores else 0,
            'epsilon': agent.epsilon,
            'training_losses': training_losses[-50:],  # Last 50 loss values
            'episode_steps': episode_steps[-50:],  # Last 50 episode step counts
            'win_rate': calculate_win_rate(),
            'episodes_completed': current_episode
        }
    }

# --- Command Handling ---

async def handle_command(cmd, ws=None):
    global ai_mode, training_mode, target_episodes, current_episode
    global episode_scores, manual_direction, game_engine, all_scores
    action = cmd.get('action')
    print(f"Received command: {action}")
    if action == 'toggle_mode':
        # Toggle between manual and AI modes (training is separate)
        if training_mode:
            # If in training, stop training and go to manual
            training_mode = False
            ai_mode = False
        elif ai_mode:
            # If in AI mode, go to manual
            ai_mode = False
        else:
            # If in manual, go to AI mode
            ai_mode = True
        print(f"Mode changed - AI: {ai_mode}, Training: {training_mode}")
    elif action == 'set_mode':
        # Set mode directly
        mode = cmd.get('mode', 'manual')
        print(f"Setting mode to: {mode}")
        if mode == 'training':
            training_mode = True
            ai_mode = True
            current_episode = 0
            episode_scores = []
            game_engine.reset()  # Start training immediately
            print("Started training mode")
        elif mode == 'ai':
            training_mode = False
            ai_mode = True
            print("Set to AI mode")
        elif mode == 'manual':
            training_mode = False
            ai_mode = False
            print("Set to manual mode")
        print(f"Mode set to: {mode} - AI: {ai_mode}, Training: {training_mode}")
    elif action == 'start_training':
        training_mode = True
        ai_mode = True
        current_episode = 0
        episode_scores = []
        game_engine.reset()  # Start training immediately
        print("Started training mode")
    elif action == 'pause_training':
        if training_mode:
            training_paused = True
            training_mode = False
            ai_mode = False
            print("Paused training mode")
        else:
            print("No active training to pause")
    elif action == 'resume_training':
        if training_paused:
            training_paused = False
            training_mode = True
            ai_mode = True
            game_engine.reset()  # Start fresh game
            print(f"Resumed training at episode {current_episode}")
        else:
            print("No paused training to resume")
    elif action == 'start_round':
        # Start a new round in current mode
        game_engine.reset()
        manual_direction = 'RIGHT'  # Reset to default
        mode_str = ('training' if training_mode else
                   ('ai' if ai_mode else 'manual'))
        print(f"Started round in mode: {mode_str}")
    elif action == 'set_grid':
        w = int(cmd.get('width', 15))
        h = int(cmd.get('height', 17))
        if w > 3 and h > 3:
            game_engine = GameEngine(w, h, CELL_SIZE)
            # Ensure game is stopped after grid change
            game_engine.game_over = True
            current_episode = 0
            episode_scores = []
            all_scores = []
            print(f"Set grid to {w}x{h}")
    elif action == 'set_training_rounds':
        target_episodes = int(cmd.get('rounds', DEFAULT_TRAINING_ROUNDS))
        print(f"Set training rounds to {target_episodes}")
    elif action == 'manual_direction':
        d = cmd.get('direction')
        if d in ['UP', 'DOWN', 'LEFT', 'RIGHT']:
            manual_direction = d
            print(f"Set manual direction to {d}")
    elif action == 'set_speed':
        speed = int(cmd.get('speed', 100))
        if 10 <= speed <= 1000:  # Valid range: 10ms to 1000ms
            global game_speed
            game_speed = speed
            print(f"Set game speed to {speed}ms")
    elif action == 'reset':
        all_scores.append(game_engine.score)
        game_engine.reset()
        current_episode = 0
        print("Reset game")
    elif action == 'save_model':
        # Save model with episode info
        filename = f'dqn_snake_ep{current_episode}.pth'
        agent.save_model(filename)
        print(f"Model saved as {filename}")
        if ws:
            await ws.send_text(json.dumps({
                "type": "save_model",
                "filename": filename
            }))
    elif action == 'load_model':
        # Load model from file
        filename = cmd.get('filename', 'dqn_snake_ep41.pth')
        try:
            agent.load_model(filename)
            print(f"Model loaded from {filename}")
            if ws:
                await ws.send_text(json.dumps({
                    "type": "load_model",
                    "filename": filename,
                    "success": True
                }))
        except Exception as e:
            print(f"Failed to load model {filename}: {e}")
            if ws:
                await ws.send_text(json.dumps({
                    "type": "load_model",
                    "filename": filename,
                    "success": False,
                    "error": str(e)
                }))
    elif action == 'evaluate_model':
        # Evaluate model for 20 episodes with epsilon=0
        eval_episodes = int(cmd.get('episodes', 20))
        scores = []
        orig_epsilon = agent.epsilon
        for _ in range(eval_episodes):
            game_engine.reset()
            while not game_engine.is_game_over():
                state = game_engine.get_state_for_ai()
                action = agent.act(state, epsilon=0.0)
                directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
                direction = directions[action]
                game_engine.change_direction(direction)
                game_engine.move_snake()
                if game_engine.check_food_collision():
                    game_engine.eat_food()
                    game_engine.spawn_food()
            scores.append(game_engine.score)
        agent.epsilon = orig_epsilon
        avg_score = sum(scores) / len(scores) if scores else 0
        print(f"Evaluation complete. Avg score: {avg_score}")
        if ws:
            await ws.send_text(json.dumps({
                "type": "evaluation_result",
                "avg_score": avg_score,
                "scores": scores
            }))
    elif action == 'list_models':
        # List available model files
        import os
        model_files = []
        try:
            for file in os.listdir('.'):
                if file.endswith('.pth'):
                    model_files.append(file)
            print(f"Found model files: {model_files}")
            if ws:
                await ws.send_text(json.dumps({
                    "type": "list_models",
                    "files": model_files
                }))
        except Exception as e:
            print(f"Failed to list models: {e}")
            if ws:
                await ws.send_text(json.dumps({
                    "type": "list_models",
                    "files": [],
                    "error": str(e)
                }))
    # Add more commands as needed

# --- Game Loop ---

async def game_loop():
    global ai_mode, training_mode, current_episode, episode_scores
    global manual_direction, all_scores
    while True:
        # Determine if we should move the snake
        should_move = False
        
        if training_mode:
            # Training mode: always move, auto-restart on game over
            should_move = True
        elif ai_mode and not game_engine.is_game_over():
            # AI mode: move only if game is not over
            should_move = True
        elif (not ai_mode and not training_mode and
              not game_engine.is_game_over()):
            # Manual mode: move only if game is not over
            should_move = True
            
        if should_move:
            if ai_mode or training_mode:
                # AI/Training mode logic
                state = game_engine.get_state_for_ai()
                action = agent.act(state)
                directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
                direction = directions[action]
                game_engine.change_direction(direction)
                game_engine.move_snake()
                if game_engine.check_food_collision():
                    game_engine.eat_food()
                    game_engine.spawn_food()
                if game_engine.is_game_over():
                    reward = -10
                    next_state = game_engine.get_state_for_ai()
                    agent.remember(state, action, reward, next_state, True)
                    if len(agent.memory) > 32:
                        loss = agent.replay()
                        if loss is not None:
                            training_losses.append(loss)
                    all_scores.append(game_engine.score)
                    episode_steps.append(game_engine.steps)
                    if training_mode:
                        episode_scores.append(game_engine.score)
                        current_episode += 1
                        if current_episode >= target_episodes:
                            training_mode = False
                            ai_mode = False
                            print("Training completed!")
                        else:
                            # Auto-restart in training mode
                            game_engine.reset()
                    # In AI mode, do NOT reset - let game stay over until
                    # user clicks start
                else:
                    reward = 10 if game_engine.check_food_collision() else -0.1
                    next_state = game_engine.get_state_for_ai()
                    agent.remember(state, action, reward, next_state, False)
                    # Train periodically during gameplay for better learning
                    if len(agent.memory) > 32 and game_engine.steps % 10 == 0:
                        loss = agent.replay()
                        if loss is not None:
                            training_losses.append(loss)
            else:
                # Manual mode logic
                game_engine.change_direction(manual_direction)
                game_engine.move_snake()
                if game_engine.check_food_collision():
                    game_engine.eat_food()
                    game_engine.spawn_food()
                if game_engine.is_game_over():
                    all_scores.append(game_engine.score)
                    # Do NOT reset in manual mode - let game stay over until
                    # user clicks start
                    
        # Broadcast state to all clients
        state_json = json.dumps(get_game_state())
        for ws in set(clients):
            try:
                await ws.send_text(state_json)
            except Exception:
                clients.remove(ws)
        # Use dynamic speed based on game_speed setting
        await asyncio.sleep(game_speed / 1000.0)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(game_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                await handle_command(cmd, ws=websocket)
            except Exception as e:
                print(f"Error handling command: {e}")
    except WebSocketDisconnect:
        clients.remove(websocket) 