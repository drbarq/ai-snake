import torch
import torch.nn as nn
import torch.optim as optim
import random
import numpy as np
from typing import Optional, List, Dict, Any

from .network import FeatureDQN
from .memory import ReplayMemory


class DQNAgent:
    """
    Deep Q-Network agent for learning Snake gameplay.
    
    Required Methods:
    - __init__(self, state_size, action_size, config)
    - act(self, state, epsilon=None)  # Choose action using epsilon-greedy
    - remember(self, state, action, reward, next_state, done)  # Store experience
    - replay(self, batch_size)  # Train on batch of experiences
    - load_model(self, filepath)  # Load trained model
    - save_model(self, filepath)  # Save current model
    - update_target_network(self)  # Update target network for stability
    
    Required Properties:
    - epsilon: Current exploration rate
    - memory: Experience replay buffer
    - q_network: Main neural network
    - target_network: Target network for stability
    """

    def __init__(self, state_size: int, action_size: int, config: Dict[str, Any]):
        """Initialize DQN agent with configuration."""
        self.state_size = state_size
        self.action_size = action_size
        self.memory = ReplayMemory(config['memory_size'])
        self.epsilon = config['epsilon_start']
        self.epsilon_min = config['epsilon_end']
        self.epsilon_decay = config['epsilon_decay']
        self.learning_rate = config['learning_rate']
        self.batch_size = config['batch_size']
        self.target_update_freq = config['target_update_frequency']
        self.step_count = 0

        # Neural networks
        hidden_sizes = config['hidden_layers']
        self.q_network = FeatureDQN(state_size, hidden_sizes)
        self.target_network = FeatureDQN(state_size, hidden_sizes)
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=self.learning_rate)

        # Copy weights to target network
        self.update_target_network()

        # Store last Q-values for visualization
        self.last_q_values = None
        self.last_action_probs = None

    def act(self, state: np.ndarray, epsilon: Optional[float] = None) -> int:
        """Choose action using epsilon-greedy policy."""
        if epsilon is None:
            epsilon = self.epsilon

        if random.random() <= epsilon:
            return random.choice(range(self.action_size))

        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        q_values = self.q_network(state_tensor)
        
        # Store for visualization
        self.last_q_values = q_values.detach().numpy().flatten()
        
        # Calculate action probabilities for visualization
        probs = torch.softmax(q_values, dim=1)
        self.last_action_probs = probs.detach().numpy().flatten()
        
        return q_values.argmax().item()

    def remember(self, state: np.ndarray, action: int, reward: float,
                next_state: np.ndarray, done: bool) -> None:
        """Store experience in replay buffer."""
        self.memory.push(state, action, reward, next_state, done)

    def replay(self) -> Optional[float]:
        """Train the network on a batch of experiences."""
        if len(self.memory) < self.batch_size:
            return None

        batch = self.memory.sample(self.batch_size)
        states = torch.FloatTensor([e[0] for e in batch])
        actions = torch.LongTensor([e[1] for e in batch])
        rewards = torch.FloatTensor([e[2] for e in batch])
        next_states = torch.FloatTensor([e[3] for e in batch])
        dones = torch.BoolTensor([e[4] for e in batch])

        current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
        next_q_values = self.target_network(next_states).max(1)[0].detach()
        target_q_values = rewards + (0.99 * next_q_values * ~dones)

        loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # Update epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

        # Update target network
        self.step_count += 1
        if self.step_count % self.target_update_freq == 0:
            self.update_target_network()

        return loss.item()

    def update_target_network(self) -> None:
        """Copy weights from main network to target network."""
        self.target_network.load_state_dict(self.q_network.state_dict())

    def load_model(self, filepath: str) -> None:
        """Load trained model from file."""
        checkpoint = torch.load(filepath)
        self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
        self.target_network.load_state_dict(checkpoint['target_network_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.epsilon = checkpoint.get('epsilon', self.epsilon)
        self.step_count = checkpoint.get('step_count', 0)

    def save_model(self, filepath: str) -> None:
        """Save current model to file."""
        checkpoint = {
            'q_network_state_dict': self.q_network.state_dict(),
            'target_network_state_dict': self.target_network.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
            'step_count': self.step_count,
            'config': {
                'state_size': self.state_size,
                'action_size': self.action_size,
                'hidden_layers': [256, 128],  # Default config
                'learning_rate': self.learning_rate,
                'batch_size': self.batch_size,
                'memory_size': self.memory.capacity,
                'epsilon_start': 1.0,
                'epsilon_end': self.epsilon_min,
                'epsilon_decay': self.epsilon_decay,
                'target_update_frequency': self.target_update_freq
            }
        }
        torch.save(checkpoint, filepath)

    def get_action_values(self, state: np.ndarray) -> np.ndarray:
        """Get Q-values for all actions in a given state."""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        with torch.no_grad():
            q_values = self.q_network(state_tensor)
        return q_values.numpy().flatten()

    def get_action_probabilities(self, state: np.ndarray) -> np.ndarray:
        """Get action probabilities using softmax over Q-values."""
        q_values = self.get_action_values(state)
        exp_q = np.exp(q_values - np.max(q_values))  # Subtract max for numerical stability
        return exp_q / exp_q.sum() 