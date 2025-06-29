import random
from collections import deque
from typing import List, Tuple, Optional
import numpy as np


class ReplayMemory:
    """
    Experience replay buffer for storing and sampling training experiences.
    
    Stores tuples of (state, action, reward, next_state, done)
    and provides methods for sampling batches for training.
    """

    def __init__(self, capacity: int):
        """Initialize replay memory with specified capacity."""
        self.memory = deque(maxlen=capacity)
        self.capacity = capacity

    def push(self, state: np.ndarray, action: int, reward: float,
             next_state: np.ndarray, done: bool) -> None:
        """Add experience to memory."""
        self.memory.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> List[Tuple]:
        """Sample a batch of experiences from memory."""
        if len(self.memory) < batch_size:
            return list(self.memory)
        return random.sample(self.memory, batch_size)

    def __len__(self) -> int:
        """Return current number of stored experiences."""
        return len(self.memory)

    def is_full(self) -> bool:
        """Check if memory is at capacity."""
        return len(self.memory) >= self.capacity

    def clear(self) -> None:
        """Clear all stored experiences."""
        self.memory.clear()


class PrioritizedReplayMemory:
    """
    Prioritized experience replay buffer.
    
    Stores experiences with priorities and samples based on priority values.
    """

    def __init__(self, capacity: int, alpha: float = 0.6, beta: float = 0.4):
        """
        Initialize prioritized replay memory.
        
        Args:
            capacity: Maximum number of experiences to store
            alpha: Priority exponent (0 = uniform, 1 = greedy)
            beta: Importance sampling exponent
        """
        self.capacity = capacity
        self.alpha = alpha
        self.beta = beta
        self.memory = []
        self.priorities = []
        self.position = 0

    def push(self, state: np.ndarray, action: int, reward: float,
             next_state: np.ndarray, done: bool, priority: Optional[float] = None) -> None:
        """Add experience with priority to memory."""
        if priority is None:
            priority = max(self.priorities) if self.priorities else 1.0

        if len(self.memory) < self.capacity:
            self.memory.append((state, action, reward, next_state, done))
            self.priorities.append(priority)
        else:
            self.memory[self.position] = (state, action, reward, next_state, done)
            self.priorities[self.position] = priority

        self.position = (self.position + 1) % self.capacity

    def sample(self, batch_size: int) -> Tuple[List[Tuple], List[int], np.ndarray]:
        """
        Sample experiences based on priorities.
        
        Returns:
            experiences: List of (state, action, reward, next_state, done)
            indices: Indices of sampled experiences
            weights: Importance sampling weights
        """
        if len(self.memory) < batch_size:
            return list(self.memory), list(range(len(self.memory))), np.ones(len(self.memory))

        # Calculate sampling probabilities
        priorities = np.array(self.priorities[:len(self.memory)])
        probabilities = priorities ** self.alpha
        probabilities /= probabilities.sum()

        # Sample indices
        indices = np.random.choice(len(self.memory), batch_size, p=probabilities)
        
        # Calculate importance sampling weights
        weights = (len(self.memory) * probabilities[indices]) ** (-self.beta)
        weights /= weights.max()

        experiences = [self.memory[idx] for idx in indices]
        
        return experiences, indices.tolist(), weights

    def update_priorities(self, indices: List[int], priorities: List[float]) -> None:
        """Update priorities for specific experiences."""
        for idx, priority in zip(indices, priorities):
            if idx < len(self.priorities):
                self.priorities[idx] = priority

    def __len__(self) -> int:
        """Return current number of stored experiences."""
        return len(self.memory) 