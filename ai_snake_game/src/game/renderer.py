import pygame
from typing import Optional

class ModernRenderer:
    def __init__(self, screen: pygame.Surface, cell_size: int = 30):
        self.screen = screen
        self.cell_size = cell_size
        self.grid_offset_x = 50
        self.grid_offset_y = 50

    def render_frame(self, game_state, ai_overlay: Optional[dict] = None):
        self.screen.fill((10, 10, 10))
        self.render_grid(game_state['grid_width'], game_state['grid_height'])
        self.render_food(game_state['food'])
        self.render_snake(game_state['snake'])

    def render_grid(self, grid_width: int, grid_height: int):
        color = (22, 33, 62)
        for x in range(grid_width + 1):
            pygame.draw.line(
                self.screen, color,
                (self.grid_offset_x + x * self.cell_size, self.grid_offset_y),
                (self.grid_offset_x + x * self.cell_size, self.grid_offset_y + grid_height * self.cell_size), 1)
        for y in range(grid_height + 1):
            pygame.draw.line(
                self.screen, color,
                (self.grid_offset_x, self.grid_offset_y + y * self.cell_size),
                (self.grid_offset_x + grid_width * self.cell_size, self.grid_offset_y + y * self.cell_size), 1)

    def render_snake(self, snake):
        for i, (x, y) in enumerate(snake.positions):
            color = (0, 255, 65) if i > 0 else (255, 255, 255)
            rect = pygame.Rect(
                self.grid_offset_x + x * self.cell_size + 1,
                self.grid_offset_y + y * self.cell_size + 1,
                self.cell_size - 2, self.cell_size - 2)
            pygame.draw.rect(self.screen, color, rect)

    def render_food(self, food):
        x, y = food.position
        color = (255, 0, 128)
        rect = pygame.Rect(
            self.grid_offset_x + x * self.cell_size + 4,
            self.grid_offset_y + y * self.cell_size + 4,
            self.cell_size - 8, self.cell_size - 8)
        pygame.draw.rect(self.screen, color, rect) 