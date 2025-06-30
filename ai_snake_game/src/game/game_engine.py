from typing import Optional, Dict, Any, Tuple
from .snake import Snake, Direction
from .food import Food


class RewardConfig:
    """Configuration for reward values."""
    def __init__(self, death_penalty: float = -10.0, food_reward: float = 10.0, 
                 step_penalty: float = -0.1, win_reward: float = 100.0):
        self.death_penalty = death_penalty
        self.food_reward = food_reward
        self.step_penalty = step_penalty
        self.win_reward = win_reward


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

    def __init__(self, width: int, height: int, cell_size: int, reward_config: Optional[RewardConfig] = None):
        """Initialize game engine with grid dimensions and reward configuration."""
        self.grid_width = width
        self.grid_height = height
        self.cell_size = cell_size
        self.reward_config = reward_config or RewardConfig()
        
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
            return self.reward_config.death_penalty

        # Check for food consumption
        reward = 0.0
        if self.food.is_eaten(self.snake.head):
            self.snake.grow()
            self.score += 1
            reward = self.reward_config.food_reward
            
            # Generate new food
            try:
                self.food.generate_new_food(self.snake.get_body_positions())
            except ValueError:
                # Game won - no more space for food
                self.game_over = True
                reward = self.reward_config.win_reward
        else:
            # Small penalty for each step to encourage efficiency
            reward = self.reward_config.step_penalty

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

    def get_state_for_ai(self) -> list:
        """Return state vector for AI processing."""
        # Create a simple state vector for the AI
        head_x, head_y = self.snake.head
        food_x, food_y = self.food.get_position()
        
        # Direction one-hot encoding
        direction = self.snake.direction
        dir_up = 1 if direction == Direction.UP else 0
        dir_down = 1 if direction == Direction.DOWN else 0
        dir_left = 1 if direction == Direction.LEFT else 0
        dir_right = 1 if direction == Direction.RIGHT else 0
        
        # Danger detection (simplified)
        danger_straight = 0
        danger_right = 0
        danger_left = 0
        
        # Food direction
        food_up = 1 if food_y < head_y else 0
        food_down = 1 if food_y > head_y else 0
        food_left = 1 if food_x < head_x else 0
        food_right = 1 if food_x > head_x else 0
        
        return [
            dir_up, dir_down, dir_left, dir_right,
            danger_straight, danger_right, danger_left,
            food_up, food_down, food_left, food_right
        ]

    def change_direction(self, direction_str: str) -> None:
        """Change snake direction using string input."""
        direction_map = {
            'UP': Direction.UP,
            'DOWN': Direction.DOWN,
            'LEFT': Direction.LEFT,
            'RIGHT': Direction.RIGHT
        }
        if direction_str in direction_map:
            self.snake.change_direction(direction_map[direction_str])

    def move_snake(self) -> None:
        """Move the snake in its current direction."""
        if not self.game_over:
            self.snake.move()
            self.steps += 1
            
            # Check for collisions
            if self.snake.check_collision(self.grid_width, self.grid_height):
                self.game_over = True

    def check_food_collision(self) -> bool:
        """Check if snake head collides with food."""
        return self.food.is_eaten(self.snake.head)

    def eat_food(self) -> None:
        """Handle food consumption."""
        self.snake.grow()
        self.score += 1

    def spawn_food(self) -> None:
        """Generate new food."""
        try:
            self.food.generate_new_food(self.snake.get_body_positions())
        except ValueError:
            # Game won - no more space for food
            self.game_over = True 