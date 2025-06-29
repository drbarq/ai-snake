import pygame
import sys
from game.game_engine import GameEngine
from game.renderer import ModernRenderer
from ai.agent import DQNAgent
from ui.dashboard import Dashboard


class SimpleTrainer:
    """Simple trainer wrapper for the DQN agent."""
    
    def __init__(self, agent):
        self.agent = agent
        self.memory = agent.memory
    
    def store_experience(self, state, action, reward, next_state, done):
        """Store experience in the agent's memory."""
        self.agent.remember(state, action, reward, next_state, done)
    
    def train_step(self):
        """Train the agent on a batch of experiences."""
        return self.agent.replay()


def main():
    # Initialize Pygame
    pygame.init()
    
    # Game settings
    WINDOW_WIDTH = 1200  # Increased to accommodate dashboard
    WINDOW_HEIGHT = 600
    CELL_SIZE = 20
    
    # Calculate grid dimensions
    GRID_WIDTH = (WINDOW_WIDTH - 300) // CELL_SIZE  # Leave space for dashboard
    GRID_HEIGHT = WINDOW_HEIGHT // CELL_SIZE
    
    # Create window
    screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
    pygame.display.set_caption("AI Snake Game")
    clock = pygame.time.Clock()
    
    # Initialize game components
    game_engine = GameEngine(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE)
    renderer = ModernRenderer(screen, CELL_SIZE)
    dashboard = Dashboard(screen, width=300)
    
    # Initialize AI components
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
    trainer = SimpleTrainer(agent)
    
    # Game state
    ai_mode = False
    training_mode = False
    target_episodes = 100
    current_episode = 0
    episode_scores = []
    last_action_time = 0
    action_delay = 100  # milliseconds
    
    # Training stats
    training_stats = {
        'scores': [],
        'avg_score': 0,
        'best_score': 0,
        'epsilon': agent.epsilon
    }
    
    print("AI Snake Game Started!")
    print("Controls:")
    print("  T - Toggle AI/Manual mode")
    print("  R - Reset game")
    print("  S - Start training")
    print("  P - Pause training")
    print("  E - Set training episodes")
    print("  Arrow keys - Manual control")
    
    running = True
    while running:
        current_time = pygame.time.get_ticks()
        
        # Handle events
        for event in pygame.event.get():
            # Dashboard event handling
            dash_action, dash_value = dashboard.handle_event(event)
            if dash_action == 'toggle_mode':
                ai_mode = not ai_mode
                print(f"AI Mode: {'ON' if ai_mode else 'OFF'} (dashboard)")
            elif dash_action == 'apply_grid':
                try:
                    new_w = int(dash_value[0])
                    new_h = int(dash_value[1])
                    if new_w > 3 and new_h > 3:
                        dashboard.set_grid_size(new_w, new_h)
                        game_engine = GameEngine(new_w, new_h, CELL_SIZE)
                        renderer = ModernRenderer(screen, CELL_SIZE)
                        current_episode = 0
                        episode_scores = []
                        print(f"Grid size set to: {new_w}x{new_h}")
                except Exception as e:
                    print(f"Invalid grid size input: {e}")
            elif dash_action == 'set_train':
                try:
                    target_episodes = int(dash_value)
                    dashboard.training_input = str(target_episodes)
                    training_mode = True
                    ai_mode = True
                    current_episode = 0
                    episode_scores = []
                    print(
                        f"Training started for {target_episodes} episodes (dashboard)"
                    )
                except Exception as e:
                    print("Invalid training input:")
                    print(e)
            # Normal event handling
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_t:
                    ai_mode = not ai_mode
                    print(f"AI Mode: {'ON' if ai_mode else 'OFF'}")
                elif event.key == pygame.K_r:
                    dashboard.add_score(game_engine.score)
                    game_engine.reset()
                    current_episode = 0
                    print("Game reset")
                elif event.key == pygame.K_s:
                    training_mode = True
                    ai_mode = True
                    current_episode = 0
                    episode_scores = []
                    print(
                        f"Starting training for {target_episodes} episodes"
                    )
                elif event.key == pygame.K_p:
                    training_mode = False
                    ai_mode = False
                    print("Training paused")
                elif event.key == pygame.K_e:
                    try:
                        episodes = input("Enter number of training episodes: ")
                        target_episodes = int(episodes)
                        dashboard.training_input = str(target_episodes)
                        print(
                            f"Training episodes set to: {target_episodes}"
                        )
                    except ValueError:
                        print("Invalid input. Using default 100 episodes")
                # Manual controls (only when not in AI mode)
                elif not ai_mode:
                    if event.key == pygame.K_UP:
                        game_engine.change_direction('UP')
                    elif event.key == pygame.K_DOWN:
                        game_engine.change_direction('DOWN')
                    elif event.key == pygame.K_LEFT:
                        game_engine.change_direction('LEFT')
                    elif event.key == pygame.K_RIGHT:
                        game_engine.change_direction('RIGHT')

        # Only move snake if in manual, AI, or training mode
        move_snake = False
        if training_mode or ai_mode:
            move_snake = True
        # Manual mode - move snake on timer
        elif not ai_mode and not training_mode and current_time - last_action_time > action_delay:
            move_snake = True

        if move_snake and current_time - last_action_time > action_delay:
            if ai_mode or training_mode:
                # AI logic
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
                    trainer.store_experience(state, action, reward, next_state, True)
                    if len(trainer.memory) > 32:
                        trainer.train_step()
                    dashboard.add_score(game_engine.score)
                    if training_mode:
                        episode_scores.append(game_engine.score)
                        current_episode += 1
                        training_stats['scores'] = episode_scores
                        training_stats['epsilon'] = agent.epsilon
                        dashboard.update_training_stats(training_stats)
                        dashboard.update_episode(current_episode)
                        if current_episode >= target_episodes:
                            training_mode = False
                            ai_mode = False
                            avg_score = sum(episode_scores) / len(episode_scores)
                            print(
                                f"Training completed! "
                                f"Average score: {avg_score:.1f}"
                            )
                    game_engine.reset()
                else:
                    reward = 1 if game_engine.check_food_collision() else 0
                    next_state = game_engine.get_state_for_ai()
                    trainer.store_experience(state, action, reward, next_state, False)
                last_action_time = current_time
            else:
                # Manual mode
                game_engine.move_snake()
                if game_engine.check_food_collision():
                    game_engine.eat_food()
                    game_engine.spawn_food()
                if game_engine.is_game_over():
                    dashboard.add_score(game_engine.score)
                    game_engine.reset()
                last_action_time = current_time

        # Clear screen
        screen.fill((0, 0, 0))
        renderer.render(game_engine)
        mode = ("AI Training" if training_mode else ("AI" if ai_mode else "Manual"))
        game_state = {
            'score': game_engine.score,
            'steps': game_engine.steps
        }
        dashboard.set_training_mode(training_mode, target_episodes)
        dashboard.update_training_stats(training_stats)
        dashboard.update_episode(current_episode)
        dashboard.render(game_state, mode)
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()