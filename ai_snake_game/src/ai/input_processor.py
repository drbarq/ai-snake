import numpy as np
from typing import List, Dict, Any, Tuple


class InputProcessor:
    """
    Modular system for different AI input representations.
    
    Required Methods:
    - __init__(self, input_type, config)
    - process_state(self, game_state)  # Convert game state to AI input
    - get_input_size(self)  # Return input vector size
    - set_config(self, config)  # Update processing configuration
    - get_feature_names(self)  # Return list of feature names
    
    Input Types to Implement:
    1. Grid-based: Full game board as matrix
    2. Feature-based: Engineered features (distances, directions, etc.)
    3. Vision-based: Ray-casting sensors in multiple directions
    4. Hybrid: Combination of multiple approaches
    """

    def __init__(self, input_type: str, config: Dict[str, Any]):
        """Initialize input processor with specified type and configuration."""
        self.input_type = input_type
        self.config = config
        self.feature_extractors = self._setup_extractors()

    def _setup_extractors(self) -> Dict[str, callable]:
        """Setup feature extraction functions based on configuration."""
        extractors = {}

        if self.config.get('danger_detection', False):
            extractors['danger'] = self._extract_danger_features

        if self.config.get('food_vector', False):
            extractors['food'] = self._extract_food_features

        if self.config.get('wall_distances', False):
            extractors['walls'] = self._extract_wall_features

        if self.config.get('body_awareness', False):
            extractors['body'] = self._extract_body_features

        if self.config.get('movement_state', False):
            extractors['movement'] = self._extract_movement_features

        return extractors

    def process_state(self, game_state: Dict[str, Any]) -> np.ndarray:
        """Convert game state to AI input vector."""
        if self.input_type == 'grid':
            return self._process_grid_input(game_state)
        elif self.input_type == 'features':
            return self._process_feature_input(game_state)
        elif self.input_type == 'vision':
            return self._process_vision_input(game_state)
        else:
            raise ValueError(f"Unknown input type: {self.input_type}")

    def _process_feature_input(self, game_state: Dict[str, Any]) -> np.ndarray:
        """Extract engineered features from game state."""
        features = []

        for extractor_name, extractor_func in self.feature_extractors.items():
            feature_values = extractor_func(game_state)
            features.extend(feature_values)

        return np.array(features, dtype=np.float32)

    def _extract_danger_features(self, game_state: Dict[str, Any]) -> List[float]:
        """Extract danger detection features (collision risk in each direction)."""
        snake = game_state['snake']
        head_x, head_y = snake.head
        grid_w, grid_h = game_state['grid_width'], game_state['grid_height']

        dangers = []
        directions = [(0, -1), (0, 1), (-1, 0), (1, 0)]  # up, down, left, right

        for dx, dy in directions:
            new_x, new_y = head_x + dx, head_y + dy

            # Check wall collision
            wall_danger = (new_x < 0 or new_x >= grid_w or
                          new_y < 0 or new_y >= grid_h)

            # Check body collision
            body_danger = (new_x, new_y) in snake.positions[1:]

            dangers.append(float(wall_danger or body_danger))

        return dangers

    def _extract_food_features(self, game_state: Dict[str, Any]) -> List[float]:
        """Extract food-related features."""
        snake_head = game_state['snake'].head
        food_pos = game_state['food'].position

        # Relative position
        dx = food_pos[0] - snake_head[0]
        dy = food_pos[1] - snake_head[1]

        # Distance
        distance = abs(dx) + abs(dy)  # Manhattan distance

        # Normalized direction
        max_dist = game_state['grid_width'] + game_state['grid_height']
        norm_dx = dx / max_dist
        norm_dy = dy / max_dist
        norm_distance = distance / max_dist

        return [norm_dx, norm_dy, norm_distance]

    def _extract_wall_features(self, game_state: Dict[str, Any]) -> List[float]:
        """Extract wall distance features."""
        snake_head = game_state['snake'].head
        grid_w, grid_h = game_state['grid_width'], game_state['grid_height']

        # Distance to walls in each direction
        wall_distances = [
            snake_head[1],  # Distance to top wall
            grid_h - 1 - snake_head[1],  # Distance to bottom wall
            snake_head[0],  # Distance to left wall
            grid_w - 1 - snake_head[0]   # Distance to right wall
        ]

        # Normalize distances
        max_dist = max(grid_w, grid_h)
        normalized_distances = [d / max_dist for d in wall_distances]

        return normalized_distances

    def _extract_body_features(self, game_state: Dict[str, Any]) -> List[float]:
        """Extract body awareness features."""
        snake = game_state['snake']
        head_x, head_y = snake.head
        body_positions = snake.positions[1:]

        # Find closest body segment in each direction
        directions = [(0, -1), (0, 1), (-1, 0), (1, 0)]
        body_distances = []

        for dx, dy in directions:
            distance = float('inf')
            for i in range(1, min(10, len(body_positions))):  # Check first 10 segments
                body_x, body_y = body_positions[i-1]
                if (body_x - head_x) * dx > 0 and (body_y - head_y) * dy > 0:
                    # Body segment is in this direction
                    dist = abs(body_x - head_x) + abs(body_y - head_y)
                    distance = min(distance, dist)
            
            if distance == float('inf'):
                distance = 10.0  # No body segment in this direction
            body_distances.append(distance)

        # Normalize distances
        max_dist = max(game_state['grid_width'], game_state['grid_height'])
        normalized_distances = [d / max_dist for d in body_distances]

        return normalized_distances

    def _extract_movement_features(self, game_state: Dict[str, Any]) -> List[float]:
        """Extract movement state features."""
        snake = game_state['snake']
        direction = snake.direction

        # One-hot encode current direction
        direction_encoding = [0.0, 0.0, 0.0, 0.0]  # up, down, left, right
        if direction.value == (0, -1):  # UP
            direction_encoding[0] = 1.0
        elif direction.value == (0, 1):  # DOWN
            direction_encoding[1] = 1.0
        elif direction.value == (-1, 0):  # LEFT
            direction_encoding[2] = 1.0
        elif direction.value == (1, 0):  # RIGHT
            direction_encoding[3] = 1.0

        return direction_encoding

    def _process_grid_input(self, game_state: Dict[str, Any]) -> np.ndarray:
        """Convert game state to grid representation."""
        grid_w, grid_h = game_state['grid_width'], game_state['grid_height']
        snake = game_state['snake']
        food = game_state['food']

        # Create grid: 0=empty, 1=snake, 2=food, 3=wall
        grid = np.zeros((grid_h, grid_w), dtype=np.float32)

        # Add snake body (value 1)
        for x, y in snake.positions[1:]:
            grid[y, x] = 1.0

        # Add snake head (value 2)
        head_x, head_y = snake.head
        grid[head_y, head_x] = 2.0

        # Add food (value 3)
        food_x, food_y = food.position
        grid[food_y, food_x] = 3.0

        return grid

    def _process_vision_input(self, game_state: Dict[str, Any]) -> np.ndarray:
        """Convert game state to vision-based representation."""
        # This is a simplified version - could be expanded with actual ray casting
        ray_count = self.config.get('ray_count', 8)
        ray_length = self.config.get('ray_length', 10)
        
        # For now, return a simplified vision input
        # In a full implementation, this would cast rays and detect objects
        vision_input = np.zeros(ray_count * 3, dtype=np.float32)  # 3 values per ray
        
        return vision_input

    def get_input_size(self) -> int:
        """Return the size of the input vector."""
        if self.input_type == 'features':
            # Calculate total feature size based on enabled extractors
            total_size = 0
            for extractor_name, extractor_func in self.feature_extractors.items():
                # Create a dummy game state to get feature size
                dummy_state = {
                    'snake': type('Snake', (), {
                        'head': (5, 5),
                        'positions': [(5, 5), (5, 6)],
                        'direction': type('Direction', (), {'value': (0, -1)})()
                    })(),
                    'food': type('Food', (), {'position': (3, 3)})(),
                    'grid_width': 10,
                    'grid_height': 10
                }
                features = extractor_func(dummy_state)
                total_size += len(features)
            return total_size
        elif self.input_type == 'grid':
            # Grid size will be determined by game dimensions
            return 0  # Will be set dynamically
        elif self.input_type == 'vision':
            ray_count = self.config.get('ray_count', 8)
            return ray_count * 3
        else:
            return 0

    def set_config(self, config: Dict[str, Any]) -> None:
        """Update processing configuration."""
        self.config = config
        self.feature_extractors = self._setup_extractors()

    def get_feature_names(self) -> List[str]:
        """Return list of feature names for debugging/visualization."""
        feature_names = []
        
        for extractor_name in self.feature_extractors.keys():
            if extractor_name == 'danger':
                feature_names.extend(['danger_up', 'danger_down', 'danger_left', 'danger_right'])
            elif extractor_name == 'food':
                feature_names.extend(['food_dx', 'food_dy', 'food_distance'])
            elif extractor_name == 'walls':
                feature_names.extend(['wall_top', 'wall_bottom', 'wall_left', 'wall_right'])
            elif extractor_name == 'body':
                feature_names.extend(['body_up', 'body_down', 'body_left', 'body_right'])
            elif extractor_name == 'movement':
                feature_names.extend(['dir_up', 'dir_down', 'dir_left', 'dir_right'])
        
        return feature_names 