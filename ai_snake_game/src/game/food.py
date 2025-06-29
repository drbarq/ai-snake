import random
from typing import List, Tuple


class Food:
    """
    Food generation and management with collision detection.
    
    Required Methods:
    - __init__(self, grid_width, grid_height)
    - generate_new_food(self, snake_positions)  # Generate food not on snake
    - is_eaten(self, snake_head)  # Check if food is consumed
    - get_position(self)  # Return current food position
    
    Required Properties:
    - position: Current food position (x, y)
    - grid_width, grid_height: Game area dimensions
    """

    def __init__(self, grid_width: int, grid_height: int):
        """Initialize food with grid dimensions."""
        self.grid_width = grid_width
        self.grid_height = grid_height
        self.position = (0, 0)
        self._generate_initial_food()

    def _generate_initial_food(self) -> None:
        """Generate initial food position."""
        self.position = (
            random.randint(0, self.grid_width - 1),
            random.randint(0, self.grid_height - 1)
        )

    def generate_new_food(
        self, snake_positions: List[Tuple[int, int]]
    ) -> None:
        """Generate new food position not occupied by snake."""
        available_positions = []
        
        # Find all available positions
        for x in range(self.grid_width):
            for y in range(self.grid_height):
                if (x, y) not in snake_positions:
                    available_positions.append((x, y))
        
        # If no available positions, game is won
        if not available_positions:
            raise ValueError(
                "No available positions for food - game won!"
            )
        
        # Choose random available position
        self.position = random.choice(available_positions)

    def is_eaten(self, snake_head: Tuple[int, int]) -> bool:
        """Check if food is consumed by snake head."""
        return snake_head == self.position

    def get_position(self) -> Tuple[int, int]:
        """Return current food position."""
        return self.position

    @property
    def position(self) -> Tuple[int, int]:
        """Current food position property."""
        return self._position

    @position.setter
    def position(self, value: Tuple[int, int]) -> None:
        """Set food position."""
        self._position = value 