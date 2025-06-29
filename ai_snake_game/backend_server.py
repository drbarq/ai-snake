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
from src.game.snake import Direction
from src.ai.agent import DQNAgent
from src.ui.dashboard import Dashboard

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
manual_direction = None

# --- Game State Serialization ---
def get_game_state():
    return {
        'snake': game_engine.snake.get_body_positions(),
        'food': game_engine.food.get_position(),
        'score': game_engine.score,
        'steps': game_engine.steps,
        'grid_width': game_engine.grid_width,
        'grid_height': game_engine.grid_height,
        'mode': (
            'training' if training_mode else ('ai' if ai_mode else 'manual')
        ),
        'training': training_mode,
        'current_episode': current_episode,
        'target_episodes': target_episodes,
        'stats': {
            'all_scores': all_scores,
            'best': max(all_scores) if all_scores else 0,
            'avg': sum(all_scores) / len(all_scores) if all_scores else 0,
            'last': all_scores[-1] if all_scores else 0,
            'epsilon': agent.epsilon
        }
    }

# --- Command Handling ---
async def handle_command(cmd):
    global ai_mode, training_mode, target_episodes, current_episode, episode_scores, manual_direction, game_engine, all_scores
    action = cmd.get('action')
    if action == 'toggle_mode':
        ai_mode = not ai_mode
    elif action == 'start_training':
        training_mode = True
        ai_mode = True
        current_episode = 0
        episode_scores = []
    elif action == 'pause_training':
        training_mode = False
        ai_mode = False
    elif action == 'set_grid':
        w = int(cmd.get('width', 15))
        h = int(cmd.get('height', 17))
        if w > 3 and h > 3:
            game_engine = GameEngine(w, h, CELL_SIZE)
            current_episode = 0
            episode_scores = []
            all_scores = []
    elif action == 'set_training_rounds':
        target_episodes = int(cmd.get('rounds', DEFAULT_TRAINING_ROUNDS))
    elif action == 'manual_direction':
        d = cmd.get('direction')
        if d in ['UP', 'DOWN', 'LEFT', 'RIGHT']:
            manual_direction = d
    elif action == 'reset':
        all_scores.append(game_engine.score)
        game_engine.reset()
        current_episode = 0
    # Add more commands as needed

# --- Game Loop ---
async def game_loop():
    global ai_mode, training_mode, current_episode, episode_scores, manual_direction, all_scores
    while True:
        # Only move if in AI, training, or manual mode
        move_snake = False
        if training_mode or ai_mode:
            move_snake = True
        elif manual_direction:
            move_snake = True
        if move_snake:
            if ai_mode or training_mode:
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
                    game_engine.reset()
                else:
                    reward = 1 if game_engine.check_food_collision() else 0
                    next_state = game_engine.get_state_for_ai()
                    agent.remember(state, action, reward, next_state, False)
            elif manual_direction:
                game_engine.change_direction(manual_direction)
                game_engine.move_snake()
                if game_engine.check_food_collision():
                    game_engine.eat_food()
                    game_engine.spawn_food()
                if game_engine.is_game_over():
                    all_scores.append(game_engine.score)
                    game_engine.reset()
                manual_direction = None
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
                await handle_command(cmd)
            except Exception:
                pass
    except WebSocketDisconnect:
        clients.remove(websocket) 