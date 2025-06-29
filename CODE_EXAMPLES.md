# AI Snake Game - Implementation Examples & Code Templates

# ============================================================================

# Example 1: Snake Class Implementation Template

# ============================================================================

import pygame
from enum import Enum
from typing import List, Tuple, Optional

class Direction(Enum):
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)

class Snake:
"""Core snake game logic with smooth movement and collision detection."""

    def __init__(self, start_pos: Tuple[int, int], start_direction: Direction):
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

    @property
    def head(self) -> Tuple[int, int]:
        return self.positions[0]

    @property
    def length(self) -> int:
        return len(self.positions)

# ============================================================================

# Example 2: DQN Agent Implementation Template

# ============================================================================

import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque
import numpy as np

class DQNetwork(nn.Module):
"""Deep Q-Network for feature-based input."""

    def __init__(self, input_size: int, hidden_sizes: List[int], output_size: int):
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

class DQNAgent:
"""Deep Q-Network agent for learning Snake gameplay."""

    def __init__(self, state_size: int, action_size: int, config: dict):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=config['memory_size'])
        self.epsilon = config['epsilon_start']
        self.epsilon_min = config['epsilon_end']
        self.epsilon_decay = config['epsilon_decay']
        self.learning_rate = config['learning_rate']
        self.batch_size = config['batch_size']
        self.target_update_freq = config['target_update_frequency']
        self.step_count = 0

        # Neural networks
        hidden_sizes = config['hidden_layers']
        self.q_network = DQNetwork(state_size, hidden_sizes, action_size)
        self.target_network = DQNetwork(state_size, hidden_sizes, action_size)
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=self.learning_rate)

        # Copy weights to target network
        self.update_target_network()

    def act(self, state: np.ndarray, epsilon: Optional[float] = None) -> int:
        """Choose action using epsilon-greedy policy."""
        if epsilon is None:
            epsilon = self.epsilon

        if random.random() <= epsilon:
            return random.choice(range(self.action_size))

        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        q_values = self.q_network(state_tensor)
        return q_values.argmax().item()

    def remember(self, state: np.ndarray, action: int, reward: float,
                next_state: np.ndarray, done: bool) -> None:
        """Store experience in replay buffer."""
        self.memory.append((state, action, reward, next_state, done))

    def replay(self) -> Optional[float]:
        """Train the network on a batch of experiences."""
        if len(self.memory) < self.batch_size:
            return None

        batch = random.sample(self.memory, self.batch_size)
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

# ============================================================================

# Example 3: Input Processor Implementation Template

# ============================================================================

class InputProcessor:
"""Modular system for different AI input representations."""

    def __init__(self, input_type: str, config: dict):
        self.input_type = input_type
        self.config = config
        self.feature_extractors = self._setup_extractors()

    def _setup_extractors(self) -> dict:
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

        return extractors

    def process_state(self, game_state) -> np.ndarray:
        """Convert game state to AI input vector."""
        if self.input_type == 'grid':
            return self._process_grid_input(game_state)
        elif self.input_type == 'features':
            return self._process_feature_input(game_state)
        elif self.input_type == 'vision':
            return self._process_vision_input(game_state)
        else:
            raise ValueError(f"Unknown input type: {self.input_type}")

    def _process_feature_input(self, game_state) -> np.ndarray:
        """Extract engineered features from game state."""
        features = []

        for extractor_name, extractor_func in self.feature_extractors.items():
            feature_values = extractor_func(game_state)
            features.extend(feature_values)

        return np.array(features, dtype=np.float32)

    def _extract_danger_features(self, game_state) -> List[float]:
        """Extract danger detection features (collision risk in each direction)."""
        snake = game_state.snake
        head_x, head_y = snake.head
        grid_w, grid_h = game_state.grid_width, game_state.grid_height

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

    def _extract_food_features(self, game_state) -> List[float]:
        """Extract food-related features."""
        snake_head = game_state.snake.head
        food_pos = game_state.food.position

        # Relative position
        dx = food_pos[0] - snake_head[0]
        dy = food_pos[1] - snake_head[1]

        # Distance
        distance = abs(dx) + abs(dy)  # Manhattan distance

        # Normalized direction
        max_dist = game_state.grid_width + game_state.grid_height
        norm_dx = dx / max_dist
        norm_dy = dy / max_dist
        norm_distance = distance / max_dist

        return [norm_dx, norm_dy, norm_distance]

# ============================================================================

# Example 4: Beautiful Renderer Implementation Template

# ============================================================================

import pygame
import math
from typing import Dict, Any, Tuple

class ModernRenderer:
"""Advanced graphics rendering with themes and effects."""

    def __init__(self, screen: pygame.Surface, theme: str = 'neon_cyber'):
        self.screen = screen
        self.theme_name = theme
        self.theme = self._load_theme(theme)
        self.effects_enabled = True
        self.animation_time = 0

        # Pre-calculate common values
        self.cell_size = 30
        self.grid_offset_x = 50
        self.grid_offset_y = 50

    def _load_theme(self, theme_name: str) -> Dict[str, Any]:
        """Load theme configuration."""
        themes = {
            'neon_cyber': {
                'snake_body': (0, 255, 65),
                'snake_head': (255, 255, 255),
                'food': (255, 0, 128),
                'background': (10, 10, 10),
                'grid': (22, 33, 62, 77),  # RGBA with alpha
                'glow_enabled': True,
                'particles_enabled': True
            },
            'retro_arcade': {
                'snake_body': (50, 205, 50),
                'snake_head': (255, 255, 0),
                'food': (255, 69, 0),
                'background': (0, 0, 128),
                'grid': (255, 255, 255, 25),
                'glow_enabled': False,
                'particles_enabled': False
            }
        }
        return themes.get(theme_name, themes['neon_cyber'])

    def render_frame(self, game_state, ai_overlay: Optional[Dict] = None) -> None:
        """Render complete game frame with effects."""
        self.animation_time += 1

        # Clear screen with background
        self.screen.fill(self.theme['background'])

        # Render grid
        self._render_grid(game_state.grid_width, game_state.grid_height)

        # Render game objects
        self._render_food(game_state.food, game_state)
        self._render_snake(game_state.snake)

        # Render AI overlay if provided
        if ai_overlay:
            self._render_ai_overlay(ai_overlay, game_state)

    def _render_grid(self, grid_width: int, grid_height: int) -> None:
        """Render grid lines with theme styling."""
        grid_color = self.theme['grid'][:3]  # RGB only for pygame
        alpha = self.theme['grid'][3] if len(self.theme['grid']) > 3 else 255

        # Create surface for grid with alpha
        grid_surface = pygame.Surface((
            grid_width * self.cell_size,
            grid_height * self.cell_size
        ), pygame.SRCALPHA)

        # Draw vertical lines
        for x in range(grid_width + 1):
            start_pos = (x * self.cell_size, 0)
            end_pos = (x * self.cell_size, grid_height * self.cell_size)
            pygame.draw.line(grid_surface, (*grid_color, alpha), start_pos, end_pos, 1)

        # Draw horizontal lines
        for y in range(grid_height + 1):
            start_pos = (0, y * self.cell_size)
            end_pos = (grid_width * self.cell_size, y * self.cell_size)
            pygame.draw.line(grid_surface, (*grid_color, alpha), start_pos, end_pos, 1)

        self.screen.blit(grid_surface, (self.grid_offset_x, self.grid_offset_y))

    def _render_snake(self, snake) -> None:
        """Render snake with smooth animations and effects."""
        # Render body segments
        for i, (x, y) in enumerate(snake.positions[1:], 1):
            screen_x = self.grid_offset_x + x * self.cell_size
            screen_y = self.grid_offset_y + y * self.cell_size

            # Calculate segment size with slight variation
            segment_size = self.cell_size - 2
            if self.theme['glow_enabled']:
                segment_size -= 1

            rect = pygame.Rect(screen_x + 1, screen_y + 1, segment_size, segment_size)

            # Draw segment with glow effect if enabled
            if self.theme['glow_enabled']:
                self._draw_glow_rect(rect, self.theme['snake_body'], 3)
            else:
                pygame.draw.rect(self.screen, self.theme['snake_body'], rect)

        # Render head with special styling
        if snake.positions:
            head_x, head_y = snake.positions[0]
            screen_x = self.grid_offset_x + head_x * self.cell_size
            screen_y = self.grid_offset_y + head_y * self.cell_size

            head_rect = pygame.Rect(screen_x + 1, screen_y + 1,
                                  self.cell_size - 2, self.cell_size - 2)

            if self.theme['glow_enabled']:
                self._draw_glow_rect(head_rect, self.theme['snake_head'], 5)
            else:
                pygame.draw.rect(self.screen, self.theme['snake_head'], head_rect)

    def _render_food(self, food, game_state) -> None:
        """Render food with pulsing and particle effects."""
        x, y = food.position
        screen_x = self.grid_offset_x + x * self.cell_size
        screen_y = self.grid_offset_y + y * self.cell_size

        # Pulsing effect
        pulse = math.sin(self.animation_time * 0.2) * 0.1 + 0.9
        food_size = int((self.cell_size - 4) * pulse)

        # Center the pulsing food
        offset = (self.cell_size - food_size) // 2
        food_rect = pygame.Rect(screen_x + offset, screen_y + offset, food_size, food_size)

        if self.theme['glow_enabled']:
            self._draw_glow_rect(food_rect, self.theme['food'], 4)
        else:
            pygame.draw.rect(self.screen, self.theme['food'], food_rect)

        # Particle effects around food
        if self.theme['particles_enabled']:
            self._draw_food_particles(screen_x + self.cell_size // 2,
                                    screen_y + self.cell_size // 2)

    def _draw_glow_rect(self, rect: pygame.Rect, color: Tuple[int, int, int],
                       glow_radius: int) -> None:
        """Draw rectangle with glow effect."""
        # Create glow surface
        glow_size = rect.width + glow_radius * 2
        glow_surface = pygame.Surface((glow_size, glow_size), pygame.SRCALPHA)

        # Draw multiple layers for glow effect
        for i in range(glow_radius):
            alpha = 255 // (i + 1) // 3
            glow_color = (*color, alpha)
            glow_rect = pygame.Rect(glow_radius - i, glow_radius - i,
                                  rect.width + i * 2, rect.height + i * 2)
            pygame.draw.rect(glow_surface, glow_color, glow_rect)

        # Draw main rectangle
        main_rect = pygame.Rect(glow_radius, glow_radius, rect.width, rect.height)
        pygame.draw.rect(glow_surface, color, main_rect)

        # Blit to screen
        glow_pos = (rect.x - glow_radius, rect.y - glow_radius)
        self.screen.blit(glow_surface, glow_pos)

    def _draw_food_particles(self, center_x: int, center_y: int) -> None:
        """Draw particle effects around food."""
        for i in range(6):
            angle = (self.animation_time * 0.1 + i * math.pi / 3) % (2 * math.pi)
            radius = 15 + math.sin(self.animation_time * 0.15 + i) * 5

            particle_x = center_x + math.cos(angle) * radius
            particle_y = center_y + math.sin(angle) * radius

            # Particle alpha based on distance from center
            alpha = max(0, 150 - int(radius * 3))
            particle_color = (*self.theme['food'], alpha)

            # Create small particle surface
            particle_surface = pygame.Surface((4, 4), pygame.SRCALPHA)
            pygame.draw.circle(particle_surface, particle_color, (2, 2), 2)
            self.screen.blit(particle_surface, (particle_x - 2, particle_y - 2))

    def _render_ai_overlay(self, ai_data: Dict, game_state) -> None:
        """Render AI decision-making visualization overlay."""
        if 'q_values' in ai_data:
            self._render_decision_heatmap(ai_data['q_values'], game_state)

        if 'action_probs' in ai_data:
            self._render_action_arrows(ai_data['action_probs'], game_state.snake.head)

    def _render_decision_heatmap(self, q_values: List[float], game_state) -> None:
        """Render heatmap showing AI's value assessment of different directions."""
        directions = [(0, -1), (0, 1), (-1, 0), (1, 0)]  # up, down, left, right
        head_x, head_y = game_state.snake.head

        max_q = max(q_values) if q_values else 1
        min_q = min(q_values) if q_values else 0
        q_range = max_q - min_q if max_q != min_q else 1

        for i, (dx, dy) in enumerate(directions):
            next_x, next_y = head_x + dx, head_y + dy

            # Skip if out of bounds
            if (next_x < 0 or next_x >= game_state.grid_width or
                next_y < 0 or next_y >= game_state.grid_height):
                continue

            # Normalize Q-value to color intensity
            normalized_q = (q_values[i] - min_q) / q_range

            # Color from red (low) to green (high)
            if normalized_q > 0.5:
                color = (0, int(255 * normalized_q), 0, 100)  # Green
            else:
                color = (int(255 * (1 - normalized_q)), 0, 0, 100)  # Red

            # Draw overlay rectangle
            screen_x = self.grid_offset_x + next_x * self.cell_size
            screen_y = self.grid_offset_y + next_y * self.cell_size

            overlay_surface = pygame.Surface((self.cell_size, self.cell_size), pygame.SRCALPHA)
            pygame.draw.rect(overlay_surface, color, (0, 0, self.cell_size, self.cell_size))
            self.screen.blit(overlay_surface, (screen_x, screen_y))

# ============================================================================

# Example 5: Training Dashboard Implementation Template

# ============================================================================

import pygame
import matplotlib.pyplot as plt
import numpy as np
from typing import List, Dict, Any
import io

class TrainingDashboard:
"""Beautiful training dashboard with real-time metrics and charts."""

    def __init__(self, screen: pygame.Surface, theme: Dict[str, Any]):
        self.screen = screen
        self.theme = theme
        self.font_large = pygame.font.Font(None, 36)
        self.font_medium = pygame.font.Font(None, 24)
        self.font_small = pygame.font.Font(None, 18)

        # Dashboard dimensions and position
        self.dashboard_width = 400
        self.dashboard_height = screen.get_height()
        self.dashboard_x = screen.get_width() - self.dashboard_width
        self.dashboard_y = 0

        # Metrics storage
        self.score_history = []
        self.loss_history = []
        self.epsilon_history = []
        self.episode_count = 0

        # Chart surfaces
        self.chart_surfaces = {}
        self.chart_update_interval = 10  # Update charts every 10 episodes

    def update(self, training_data: Dict[str, Any]) -> None:
        """Update dashboard with latest training metrics."""
        self.episode_count += 1

        # Store metrics
        if 'score' in training_data:
            self.score_history.append(training_data['score'])
        if 'loss' in training_data:
            self.loss_history.append(training_data['loss'])
        if 'epsilon' in training_data:
            self.epsilon_history.append(training_data['epsilon'])

        # Update charts periodically
        if self.episode_count % self.chart_update_interval == 0:
            self._update_charts()

    def render(self) -> None:
        """Render the complete dashboard."""
        # Create dashboard background with glassmorphism effect
        dashboard_surface = pygame.Surface((self.dashboard_width, self.dashboard_height),
                                         pygame.SRCALPHA)

        # Semi-transparent background
        background_color = (*self.theme['background'][:3], 180)
        pygame.draw.rect(dashboard_surface, background_color,
                        (0, 0, self.dashboard_width, self.dashboard_height))

        # Gradient border effect
        border_color = self.theme['primary']
        pygame.draw.rect(dashboard_surface, border_color,
                        (0, 0, self.dashboard_width, self.dashboard_height), 2)

        # Render sections
        y_offset = 20
        y_offset = self._render_title(dashboard_surface, y_offset)
        y_offset = self._render_current_stats(dashboard_surface, y_offset)
        y_offset = self._render_charts(dashboard_surface, y_offset)

        # Blit dashboard to main screen
        self.screen.blit(dashboard_surface, (self.dashboard_x, self.dashboard_y))

    def _render_title(self, surface: pygame.Surface, y_offset: int) -> int:
        """Render dashboard title."""
        title = "AI Training Dashboard"
        title_surface = self.font_large.render(title, True, self.theme['primary'])
        title_rect = title_surface.get_rect(centerx=self.dashboard_width // 2, y=y_offset)
        surface.blit(title_surface, title_rect)

        # Underline
        underline_y = title_rect.bottom + 5
        pygame.draw.line(surface, self.theme['accent'],
                        (20, underline_y), (self.dashboard_width - 20, underline_y), 2)

        return underline_y + 20

    def _render_current_stats(self, surface: pygame.Surface, y_offset: int) -> int:
        """Render current training statistics."""
        stats = [
            ("Episode", str(self.episode_count)),
            ("Current Score", str(self.score_history[-1]) if self.score_history else "0"),
            ("Average Score", f"{np.mean(self.score_history[-100:]):.1f}" if self.score_history else "0"),
            ("Best Score", str(max(self.score_history)) if self.score_history else "0"),
            ("Epsilon", f"{self.epsilon_history[-1]:.3f}" if self.epsilon_history else "1.000"),
            ("Loss", f"{self.loss_history[-1]:.4f}" if self.loss_history else "0.0000")
        ]

        for label, value in stats:
            # Label
            label_surface = self.font_medium.render(f"{label}:", True, self.theme['text'])
            surface.blit(label_surface, (30, y_offset))

            # Value
            value_surface = self.font_medium.render(value, True, self.theme['accent'])
            value_rect = value_surface.get_rect(right=self.dashboard_width - 30, y=y_offset)
            surface.blit(value_surface, value_rect)

            y_offset += 30

        return y_offset + 20

    def _render_charts(self, surface: pygame.Surface, y_offset: int) -> int:
        """Render training progress charts."""
        if len(self.score_history) < 2:
            return y_offset

        chart_height = 120
        chart_width = self.dashboard_width - 40

        # Score progression chart
        if 'score_chart' in self.chart_surfaces:
            chart_label = self.font_medium.render("Score Progression", True, self.theme['text'])
            surface.blit(chart_label, (30, y_offset))
            y_offset += 25

            surface.blit(self.chart_surfaces['score_chart'], (20, y_offset))
            y_offset += chart_height + 20

        # Loss chart
        if 'loss_chart' in self.chart_surfaces and self.loss_history:
            chart_label = self.font_medium.render("Training Loss", True, self.theme['text'])
            surface.blit(chart_label, (30, y_offset))
            y_offset += 25

            surface.blit(self.chart_surfaces['loss_chart'], (20, y_offset))
            y_offset += chart_height + 20

        return y_offset

    def _update_charts(self) -> None:
        """Update chart surfaces using matplotlib."""
        if len(self.score_history) < 2:
            return

        # Score progression chart
        self._create_score_chart()

        # Loss chart
        if self.loss_history:
            self._create_loss_chart()

    def _create_score_chart(self) -> None:
        """Create score progression chart."""
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(4, 1.2), dpi=100)
        fig.patch.set_facecolor('none')
        ax.patch.set_facecolor('none')

        # Plot data
        episodes = range(len(self.score_history))
        ax.plot(episodes, self.score_history, color='#00ff41', linewidth=2, alpha=0.8)

        # Moving average
        if len(self.score_history) > 10:
            window_size = min(20, len(self.score_history) // 4)
            moving_avg = np.convolve(self.score_history,
                                   np.ones(window_size)/window_size, mode='valid')
            avg_episodes = range(window_size-1, len(self.score_history))
            ax.plot(avg_episodes, moving_avg, color='#ffd700', linewidth=2, alpha=0.9)

        # Styling
        ax.set_facecolor('none')
        ax.grid(True, alpha=0.3, color='#ffffff')
        ax.set_xlabel('Episode', color='white', fontsize=10)
        ax.set_ylabel('Score', color='white', fontsize=10)
        ax.tick_params(colors='white', labelsize=8)

        # Convert to pygame surface
        buf = io.BytesIO()
        plt.savefig(buf, format='png', transparent=True, bbox_inches='tight',
                   pad_inches=0.1, facecolor='none')
        buf.seek(0)

        chart_surface = pygame.image.load(buf)
        self.chart_surfaces['score_chart'] = chart_surface

        plt.close(fig)
        buf.close()

    def _create_loss_chart(self) -> None:
        """Create training loss chart."""
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(4, 1.2), dpi=100)
        fig.patch.set_facecolor('none')
        ax.patch.set_facecolor('none')

        # Plot data
        episodes = range(len(self.loss_history))
        ax.plot(episodes, self.loss_history, color='#ff0080', linewidth=1.5, alpha=0.8)

        # Styling
        ax.set_facecolor('none')
        ax.grid(True, alpha=0.3, color='#ffffff')
        ax.set_xlabel('Training Step', color='white', fontsize=10)
        ax.set_ylabel('Loss', color='white', fontsize=10)
        ax.tick_params(colors='white', labelsize=8)
        ax.set_yscale('log')  # Log scale for loss

        # Convert to pygame surface
        buf = io.BytesIO()
        plt.savefig(buf, format='png', transparent=True, bbox_inches='tight',
                   pad_inches=0.1, facecolor='none')
        buf.seek(0)

        chart_surface = pygame.image.load(buf)
        self.chart_surfaces['loss_chart'] = chart_surface

        plt.close(fig)
        buf.close()

# ============================================================================

# Example 6: Main Application Structure

# ============================================================================

class AISnakeGame:
"""Main application class coordinating all components."""

    def __init__(self, config_path: str = 'config.yaml'):
        # Load configuration
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)

        # Initialize pygame
        pygame.init()
        self.screen = pygame.display.set_mode((1200, 800))
        pygame.display.set_caption("AI Snake Game")
        self.clock = pygame.time.Clock()

        # Initialize components
        self.game_engine = GameEngine(
            self.config['game']['grid_width'],
            self.config['game']['grid_height'],
            self.config['game']['cell_size']
        )

        self.input_processor = InputProcessor(
            self.config['ai']['input_type'],
            self.config['ai']['feature_config']
        )

        self.agent = DQNAgent(
            self.input_processor.get_input_size(),
            4,  # Four actions: up, down, left, right
            self.config['ai']
        )

        self.renderer = ModernRenderer(self.screen, self.config['visual']['theme'])
        self.dashboard = TrainingDashboard(self.screen, self.renderer.theme)
        self.trainer = AITrainer(self.agent, self.game_engine, self.config['training'])

        # Training state
        self.training_active = False
        self.current_episode = 0

    def run(self) -> None:
        """Main application loop."""
        running = True

        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE:
                        self.training_active = not self.training_active
                    elif event.key == pygame.K_r:
                        self.game_engine.reset()

            # Training step
            if self.training_active:
                training_data = self.trainer.train_step()
                if training_data:
                    self.dashboard.update(training_data)

            # Render frame
            game_state = self.game_engine.get_state()
            ai_data = self._get_ai_visualization_data()

            self.renderer.render_frame(game_state, ai_data)
            self.dashboard.render()

            pygame.display.flip()
            self.clock.tick(self.config['game']['fps'])

        pygame.quit()

    def _get_ai_visualization_data(self) -> Dict[str, Any]:
        """Get AI data for visualization overlay."""
        if not hasattr(self.agent, 'last_q_values'):
            return {}

        return {
            'q_values': self.agent.last_q_values,
            'action_probs': self.agent.last_action_probs,
            'epsilon': self.agent.epsilon
        }

if **name** == "**main**":
game = AISnakeGame()
game.run()
'
