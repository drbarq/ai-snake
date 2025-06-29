from enum import Enum
from typing import List, Tuple, Optional


class Direction(Enum):
    """Enumeration for snake movement directions."""
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)


class Snake:
    """
    Core snake game logic with smooth movement and collision detection.
    
    Required Methods:
    - __init__(self, start_pos, start_direction)
    - move(self, direction=None)  # Move snake, handle growth
    - check_collision(self, walls, body=True)  # Collision detection
    - grow(self)  # Increase snake length
    - get_head_pos(self)  # Return current head position
    - get_body_positions(self)  # Return all body segment positions
    - reset(self, start_pos, start_direction)  # Reset to initial state
    
    Required Properties:
    - length: Current snake length
    - direction: Current movement direction
    - positions: List of all body segment positions
    - head: Head position (x, y)
    """

    def __init__(self, start_pos: Tuple[int, int], start_direction: Direction):
        """Initialize snake with starting position and direction."""
        self.positions = [start_pos]
        self.direction = start_direction
        self.grow_pending = False
        self.initial_pos = start_pos
        self.initial_direction = start_direction

    def move(self, new_direction: Optional[Direction] = None) -> None:
        """Move snake in current or new direction."""
        if new_direction and self._is_valid_direction(new_direction):
            self.direction = new_direction

        # Calculate new head position
        head_x, head_y = self.positions[0]
        dx, dy = self.direction.value
        new_head = (head_x + dx, head_y + dy)

        # Add new head
        self.positions.insert(0, new_head)

        # Remove tail unless growing
        if not self.grow_pending:
            self.positions.pop()
        else:
            self.grow_pending = False

    def _is_valid_direction(self, new_direction: Direction) -> bool:
        """Check if direction change is valid (not opposite direction)."""
        current_dx, current_dy = self.direction.value
        new_dx, new_dy = new_direction.value
        return (current_dx, current_dy) != (-new_dx, -new_dy)

    def change_direction(self, new_direction: Direction) -> None:
        """Change snake direction if valid."""
        if self._is_valid_direction(new_direction):
            self.direction = new_direction

    def grow(self) -> None:
        """Mark snake for growth on next move."""
        self.grow_pending = True

    def check_collision(self, grid_width: int, grid_height: int,
                        check_self: bool = True) -> bool:
        """Check for wall or self collision."""
        head_x, head_y = self.positions[0]

        # Wall collision
        if (head_x < 0 or head_x >= grid_width or
                head_y < 0 or head_y >= grid_height):
            return True

        # Self collision
        if check_self and len(self.positions) > 1:
            return self.positions[0] in self.positions[1:]

        return False

    def get_head_pos(self) -> Tuple[int, int]:
        """Return current head position."""
        return self.positions[0]

    def get_body_positions(self) -> List[Tuple[int, int]]:
        """Return all body segment positions."""
        return self.positions.copy()

    def reset(self, start_pos: Optional[Tuple[int, int]] = None,
              start_direction: Optional[Direction] = None) -> None:
        """Reset snake to initial state."""
        if start_pos is None:
            start_pos = self.initial_pos
        if start_direction is None:
            start_direction = self.initial_direction

        self.positions = [start_pos]
        self.direction = start_direction
        self.grow_pending = False

    @property
    def head(self) -> Tuple[int, int]:
        """Head position property."""
        return self.positions[0]

    @property
    def length(self) -> int:
        """Current snake length property."""
        return len(self.positions)

    @property
    def direction(self) -> Direction:
        """Current movement direction property."""
        return self._direction

    @direction.setter
    def direction(self, value: Direction) -> None:
        """Set movement direction."""
        self._direction = value 