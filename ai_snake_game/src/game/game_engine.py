from typing import Optional, Dict, Any, Tuple
from .snake import Snake, Direction
from .food import Food


class GameEngine:
    """
    Main game controller managing game state and flow.
    
    Required Methods:
    - __init__(self, width, height, cell_size)
    - update(self, action=None)  # Update game state, return reward
    - reset(self)  # Reset game to initial state
    - get_state(self)  # Return current game state for AI
    - is_game_over(self)  # Check if game ended
    - get_score(self)  # Return current score
    
    Required Properties:
    - snake: Snake instance
    - food: Food instance
    - score: Current game score
    - steps: Number of steps taken
    - game_over: Boolean game state
    """

    def __init__(self, width: int, height: int, cell_size: int):
        """Initialize game engine with grid dimensions."""
        self.grid_width = width
        self.grid_height = height
        self.cell_size = cell_size
        
        # Game state
        self.score = 0
        self.steps = 0
        self.game_over = False
        
        # Initialize game objects
        start_pos = (width // 2, height // 2)
        self.snake = Snake(start_pos, Direction.RIGHT)
        self.food = Food(width, height)
        
        # Ensure food is not on snake initially
        self.food.generate_new_food(self.snake.get_body_positions())

    def update(self, action: Optional[Direction] = None) -> float:
        """
        Update game state based on action and return reward.
        
        Args:
            action: Direction to move snake (None for current direction)
            
        Returns:
            float: Reward for this step
        """
        if self.game_over:
            return 0.0

        # Move snake
        self.snake.move(action)
        self.steps += 1

        # Check for collisions
        if self.snake.check_collision(self.grid_width, self.grid_height):
            self.game_over = True
            return -10.0  # Death penalty

        # Check for food consumption
        reward = 0.0
        if self.food.is_eaten(self.snake.head):
            self.snake.grow()
            self.score += 1
            reward = 10.0  # Food reward
            
            # Generate new food
            try:
                self.food.generate_new_food(self.snake.get_body_positions())
            except ValueError:
                # Game won - no more space for food
                self.game_over = True
                reward = 100.0  # Win reward
        else:
            # Small penalty for each step to encourage efficiency
            reward = -0.1

        return reward

    def reset(self) -> None:
        """Reset game to initial state."""
        self.score = 0
        self.steps = 0
        self.game_over = False
        
        # Reset snake to center
        start_pos = (self.grid_width // 2, self.grid_height // 2)
        self.snake.reset(start_pos, Direction.RIGHT)
        
        # Generate new food
        self.food.generate_new_food(self.snake.get_body_positions())

    def get_state(self) -> Dict[str, Any]:
        """Return current game state for AI processing."""
        return {
            'snake': self.snake,
            'food': self.food,
            'grid_width': self.grid_width,
            'grid_height': self.grid_height,
            'score': self.score,
            'steps': self.steps,
            'game_over': self.game_over
        }

    def is_game_over(self) -> bool:
        """Check if game has ended."""
        return self.game_over

    def get_score(self) -> int:
        """Return current game score."""
        return self.score

    def get_snake_head(self) -> Tuple[int, int]:
        """Return current snake head position."""
        return self.snake.head

    def get_food_position(self) -> Tuple[int, int]:
        """Return current food position."""
        return self.food.get_position()

    def get_snake_length(self) -> int:
        """Return current snake length."""
        return self.snake.length 