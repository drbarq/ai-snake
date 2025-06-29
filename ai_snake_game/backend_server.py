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
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from src.game.game_engine import GameEngine
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

clients = set()

# --- Game Setup ---
GRID_W, GRID_H, CELL_SIZE = 15, 17, 20
DEFAULT_TRAINING_ROUNDS = 100

game_engine = GameEngine(GRID_W, GRID_H, CELL_SIZE)
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

# --- Game State Serialization ---

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
        'current_episode': current_episode,
        'target_episodes': target_episodes,
        'game_over': game_engine.is_game_over(),
        'stats': {
            'all_scores': all_scores,
            'best': max(all_scores) if all_scores else 0,
            'avg': sum(all_scores) / len(all_scores) if all_scores else 0,
            'last': all_scores[-1] if all_scores else 0,
            'epsilon': agent.epsilon
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
        training_mode = False
        ai_mode = False
        print("Paused training mode")
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
                        agent.replay()
                    all_scores.append(game_engine.score)
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
                    reward = 1 if game_engine.check_food_collision() else 0
                    next_state = game_engine.get_state_for_ai()
                    agent.remember(state, action, reward, next_state, False)
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
        await asyncio.sleep(0.1)

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