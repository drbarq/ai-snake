import numpy as np
from typing import Dict, Any, Optional

class AITrainer:
    """
    Training orchestration and management system for DQN agent.
    
    Required Methods:
    - __init__(self, agent, game_engine, input_processor, config)
    - train_episode(self)  # Run single training episode
    - train(self, num_episodes)  # Run full training session
    - evaluate(self, num_episodes)  # Evaluate current performance
    - save_checkpoint(self, filepath)  # Save training checkpoint
    - load_checkpoint(self, filepath)  # Load training checkpoint
    - get_training_stats(self)  # Return current training metrics
    
    Required Features:
    - Episode management
    - Performance tracking
    - Hyperparameter scheduling
    - Model checkpointing
    - Training visualization data generation
    """

    def __init__(self, agent, game_engine, input_processor, config: Dict[str, Any]):
        self.agent = agent
        self.game_engine = game_engine
        self.input_processor = input_processor
        self.config = config
        self.episode = 0
        self.stats = {
            'scores': [],
            'losses': [],
            'epsilons': [],
            'steps': [],
        }

    def train_episode(self) -> Dict[str, Any]:
        """Run a single training episode."""
        self.game_engine.reset()
        state = self.input_processor.process_state(self.game_engine.get_state())
        total_reward = 0
        done = False
        steps = 0
        losses = []

        while not self.game_engine.is_game_over():
            action = self.agent.act(state)
            reward = self.game_engine.update(action)
            next_state = self.input_processor.process_state(self.game_engine.get_state())
            done = self.game_engine.is_game_over()
            self.agent.remember(state, action, reward, next_state, done)
            loss = self.agent.replay()
            if loss is not None:
                losses.append(loss)
            state = next_state
            total_reward += reward
            steps += 1

        score = self.game_engine.get_score()
        avg_loss = float(np.mean(losses)) if losses else 0.0
        self.stats['scores'].append(score)
        self.stats['losses'].append(avg_loss)
        self.stats['epsilons'].append(self.agent.epsilon)
        self.stats['steps'].append(steps)
        self.episode += 1

        return {
            'score': score,
            'loss': avg_loss,
            'epsilon': self.agent.epsilon,
            'steps': steps,
            'episode': self.episode
        }

    def train(self, num_episodes: int) -> None:
        """Run full training session."""
        for _ in range(num_episodes):
            self.train_episode()

    def evaluate(self, num_episodes: int) -> Dict[str, Any]:
        """Evaluate current agent performance."""
        scores = []
        for _ in range(num_episodes):
            self.game_engine.reset()
            state = self.input_processor.process_state(self.game_engine.get_state())
            done = False
            steps = 0
            while not self.game_engine.is_game_over():
                action = self.agent.act(state, epsilon=0.0)  # Greedy
                self.game_engine.update(action)
                state = self.input_processor.process_state(self.game_engine.get_state())
                steps += 1
            scores.append(self.game_engine.get_score())
        return {
            'mean_score': float(np.mean(scores)),
            'max_score': int(np.max(scores)),
            'min_score': int(np.min(scores)),
            'scores': scores
        }

    def save_checkpoint(self, filepath: str) -> None:
        """Save training checkpoint."""
        self.agent.save_model(filepath)

    def load_checkpoint(self, filepath: str) -> None:
        """Load training checkpoint."""
        self.agent.load_model(filepath)

    def get_training_stats(self) -> Dict[str, Any]:
        """Return current training metrics."""
        return self.stats 