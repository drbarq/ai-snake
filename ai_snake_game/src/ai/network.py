import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List


class DQNetwork(nn.Module):
    """
    Deep Q-Network for feature-based input.
    
    Required Networks:
    - GridDQN: For grid-based input (full game board)
    - FeatureDQN: For engineered features input
    - VisionDQN: For ray-casting sensor input
    - HybridDQN: For combined input approaches
    
    Each network should:
    - Accept appropriate input size
    - Output 4 action values (up, down, left, right)
    - Use appropriate architecture for input type
    - Support both training and inference modes
    """

    def __init__(self, input_size: int, hidden_sizes: List[int], output_size: int = 4):
        super(DQNetwork, self).__init__()

        layers = []
        prev_size = input_size

        for hidden_size in hidden_sizes:
            layers.extend([
                nn.Linear(prev_size, hidden_size),
                nn.ReLU(),
                nn.Dropout(0.1)
            ])
            prev_size = hidden_size

        layers.append(nn.Linear(prev_size, output_size))
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)


class FeatureDQN(DQNetwork):
    """Neural network for engineered feature input."""
    
    def __init__(self, feature_size: int, hidden_sizes: List[int] = [256, 128]):
        super(FeatureDQN, self).__init__(feature_size, hidden_sizes, 4)


class GridDQN(nn.Module):
    """Neural network for grid-based input (full game board)."""
    
    def __init__(self, grid_width: int, grid_height: int, hidden_sizes: List[int] = [256, 128]):
        super(GridDQN, self).__init__()
        
        # Convolutional layers for grid processing
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 64, kernel_size=3, padding=1)
        
        # Calculate flattened size after convolutions
        conv_output_size = 64 * grid_width * grid_height
        
        # Fully connected layers
        self.fc1 = nn.Linear(conv_output_size, hidden_sizes[0])
        self.fc2 = nn.Linear(hidden_sizes[0], hidden_sizes[1])
        self.fc3 = nn.Linear(hidden_sizes[1], 4)
        
        self.dropout = nn.Dropout(0.1)

    def forward(self, x):
        # x shape: (batch_size, 1, grid_height, grid_width)
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected layers
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        
        return x


class VisionDQN(nn.Module):
    """Neural network for ray-casting sensor input."""
    
    def __init__(self, ray_count: int, ray_length: int, hidden_sizes: List[int] = [256, 128]):
        super(VisionDQN, self).__init__()
        
        # Input size: ray_count * ray_length * 3 (for walls, body, food detection)
        input_size = ray_count * ray_length * 3
        
        self.fc1 = nn.Linear(input_size, hidden_sizes[0])
        self.fc2 = nn.Linear(hidden_sizes[0], hidden_sizes[1])
        self.fc3 = nn.Linear(hidden_sizes[1], 4)
        
        self.dropout = nn.Dropout(0.1)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        
        return x 