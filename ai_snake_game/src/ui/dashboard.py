import pygame
from typing import Dict, Any, Tuple


class Dashboard:
    """Dashboard for displaying and controlling game settings and stats."""
    
    def __init__(self, screen: pygame.Surface, width: int = 300):
        self.screen = screen
        self.width = width
        self.font_large = pygame.font.Font(None, 36)
        self.font_medium = pygame.font.Font(None, 24)
        self.font_small = pygame.font.Font(None, 18)
        
        # Colors
        self.bg_color = (20, 20, 30)
        self.text_color = (255, 255, 255)
        self.accent_color = (0, 255, 65)
        self.warning_color = (255, 100, 100)
        self.input_bg = (40, 40, 60)
        self.input_active_bg = (60, 60, 90)
        self.button_bg = (30, 120, 30)
        self.button_fg = (255, 255, 255)
        
        # Dashboard position (right side)
        self.x = screen.get_width() - width
        self.y = 0
        self.height = screen.get_height()
        
        # State
        self.training_mode = False
        self.target_episodes = 100
        self.current_episode = 0
        self.training_stats = {
            'scores': [],
            'avg_score': 0,
            'best_score': 0,
            'epsilon': 1.0
        }
        self.all_scores = []
        
        # Grid size input
        self.grid_width = 15
        self.grid_height = 17
        self.grid_width_input = str(self.grid_width)
        self.grid_height_input = str(self.grid_height)
        self.grid_input_active = None  # 'width' or 'height'
        
        # Training rounds input
        self.training_input = str(self.target_episodes)
        self.training_input_active = False
        
        # UI element rects (for mouse interaction)
        self.rects = {}

    def render(self, game_state: Dict[str, Any], mode: str):
        """Render the dashboard."""
        # Create dashboard surface
        dashboard_surface = pygame.Surface((self.width, self.height))
        dashboard_surface.fill(self.bg_color)
        
        y_offset = 20
        
        # Title
        title = self.font_large.render(
            "AI Snake Dashboard", True, self.accent_color
        )
        dashboard_surface.blit(title, (20, y_offset))
        y_offset += 50
        
        # Mode toggle button
        mode_label = self.font_medium.render(f"Mode: {mode}", True, self.text_color)
        dashboard_surface.blit(mode_label, (20, y_offset))
        mode_btn_rect = pygame.Rect(180, y_offset, 80, 30)
        pygame.draw.rect(
            dashboard_surface, self.button_bg, mode_btn_rect
        )
        btn_text = self.font_small.render(
            "Toggle", True, self.button_fg)
        dashboard_surface.blit(
            btn_text, (mode_btn_rect.x + 10, mode_btn_rect.y + 5)
        )
        self.rects['mode_toggle'] = mode_btn_rect.move(self.x, 0)
        y_offset += 40
        # Grid size input
        grid_label = self.font_medium.render(
            "Grid Size:", True, self.accent_color
        )
        dashboard_surface.blit(grid_label, (20, y_offset))
        y_offset += 30
        
        # Width input
        width_label = self.font_small.render("W:", True, self.text_color)
        dashboard_surface.blit(width_label, (20, y_offset))
        width_rect = pygame.Rect(45, y_offset, 40, 28)
        pygame.draw.rect(
            dashboard_surface,
            self.input_active_bg if self.grid_input_active == 'width' else self.input_bg,
            width_rect
        )
        width_text = self.font_small.render(
            self.grid_width_input, True, self.text_color
        )
        dashboard_surface.blit(
            width_text, (width_rect.x + 5, width_rect.y + 4)
        )
        self.rects['grid_width'] = width_rect.move(self.x, 0)
        
        # Height input
        height_label = self.font_small.render("H:", True, self.text_color)
        dashboard_surface.blit(height_label, (95, y_offset))
        height_rect = pygame.Rect(120, y_offset, 40, 28)
        pygame.draw.rect(
            dashboard_surface,
            self.input_active_bg if self.grid_input_active == 'height' else self.input_bg,
            height_rect
        )
        height_text = self.font_small.render(
            self.grid_height_input, True, self.text_color
        )
        dashboard_surface.blit(
            height_text, (height_rect.x + 5, height_rect.y + 4)
        )
        self.rects['grid_height'] = height_rect.move(self.x, 0)
        
        # Apply button
        apply_rect = pygame.Rect(180, y_offset, 80, 28)
        pygame.draw.rect(
            dashboard_surface, self.button_bg, apply_rect
        )
        apply_text = self.font_small.render("Apply", True, self.button_fg)
        dashboard_surface.blit(
            apply_text, (apply_rect.x + 15, apply_rect.y + 4)
        )
        self.rects['apply_grid'] = apply_rect.move(self.x, 0)
        y_offset += 40
        
        # Training rounds input
        train_label = self.font_medium.render(
            "Training Rounds:", True, self.accent_color
        )
        dashboard_surface.blit(train_label, (20, y_offset))
        y_offset += 30
        train_rect = pygame.Rect(20, y_offset, 80, 28)
        pygame.draw.rect(
            dashboard_surface,
            self.input_active_bg if self.training_input_active else self.input_bg,
            train_rect)
        train_text = self.font_small.render(
            self.training_input, True, self.text_color
        )
        dashboard_surface.blit(
            train_text, (train_rect.x + 5, train_rect.y + 4)
        )
        self.rects['train_input'] = train_rect.move(self.x, 0)
        
        # Set button
        set_rect = pygame.Rect(120, y_offset, 60, 28)
        pygame.draw.rect(
            dashboard_surface, self.button_bg, set_rect
        )
        set_text = self.font_small.render("Set", True, self.button_fg)
        dashboard_surface.blit(
            set_text, (set_rect.x + 10, set_rect.y + 4)
        )
        self.rects['set_train'] = set_rect.move(self.x, 0)
        y_offset += 40
        
        # Score tracking
        scores_label = self.font_medium.render(
            "Scores:", True, self.accent_color
        )
        dashboard_surface.blit(scores_label, (20, y_offset))
        y_offset += 30
        
        # Show all scores (scrollable if needed)
        max_scores = 8
        for i, score in enumerate(self.all_scores[-max_scores:][::-1]):
            score_text = self.font_small.render(
                f"{score}", True, self.text_color
            )
            dashboard_surface.blit(
                score_text, (30, y_offset)
            )
            y_offset += 22
        
        # Best/Avg/Recent
        if self.all_scores:
            best = max(self.all_scores)
            avg = sum(self.all_scores) / len(self.all_scores)
            recent = self.all_scores[-1]
            stats_text = self.font_small.render(
                f"Best: {best}  Avg: {avg:.1f}  Last: {recent}",
                True, self.text_color
            )
            dashboard_surface.blit(
                stats_text, (20, y_offset)
            )
            y_offset += 25
        
        # Training status
        y_offset += 10
        if self.training_mode:
            status_color = self.accent_color
            status_text = (
                f"Training: {self.current_episode}/{self.target_episodes}"
            )
        else:
            status_color = self.text_color
            status_text = "Training: Inactive"
            
        status = self.font_medium.render(
            status_text, True, status_color
        )
        dashboard_surface.blit(status, (20, y_offset))
        
        # Blit dashboard to main screen
        self.screen.blit(dashboard_surface, (self.x, self.y))

    def handle_event(self, event: pygame.event.Event) -> Tuple[str, Any]:
        """Handle mouse/keyboard events for dashboard UI. Returns (action, value) or (None, None)."""
        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            for key, rect in self.rects.items():
                if rect.collidepoint(mx, my):
                    if key == 'mode_toggle':
                        return ('toggle_mode', None)
                    elif key == 'apply_grid':
                        return ('apply_grid', (self.grid_width_input, self.grid_height_input))
                    elif key == 'grid_width':
                        self.grid_input_active = 'width'
                        self.grid_height_input = str(self.grid_height)
                        return (None, None)
                    elif key == 'grid_height':
                        self.grid_input_active = 'height'
                        self.grid_width_input = str(self.grid_width)
                        return (None, None)
                    elif key == 'set_train':
                        return ('set_train', self.training_input)
                    elif key == 'train_input':
                        self.training_input_active = True
                        return (None, None)
        elif event.type == pygame.KEYDOWN:
            if self.grid_input_active:
                if event.key == pygame.K_RETURN:
                    self.grid_input_active = None
                elif event.key == pygame.K_BACKSPACE:
                    if self.grid_input_active == 'width':
                        self.grid_width_input = self.grid_width_input[:-1]
                    else:
                        self.grid_height_input = self.grid_height_input[:-1]
                elif event.unicode.isdigit():
                    if self.grid_input_active == 'width':
                        self.grid_width_input += event.unicode
                    else:
                        self.grid_height_input += event.unicode
            elif self.training_input_active:
                if event.key == pygame.K_RETURN:
                    self.training_input_active = False
                elif event.key == pygame.K_BACKSPACE:
                    self.training_input = self.training_input[:-1]
                elif event.unicode.isdigit():
                    self.training_input += event.unicode
        return (None, None)

    def update_training_stats(self, stats: Dict[str, Any]):
        """Update training statistics."""
        self.training_stats = stats
        if stats.get('scores'):
            self.training_stats['avg_score'] = (
                sum(stats['scores']) / len(stats['scores'])
            )
            self.training_stats['best_score'] = max(stats['scores'])

    def set_training_mode(self, active: bool, target_episodes: int = 0):
        """Set training mode and target episodes."""
        self.training_mode = active
        self.target_episodes = target_episodes
        self.current_episode = 0

    def update_episode(self, episode: int):
        """Update current episode number."""
        self.current_episode = episode

    def set_grid_size(self, width: int, height: int):
        self.grid_width = width
        self.grid_height = height
        self.grid_width_input = str(width)
        self.grid_height_input = str(height)

    def add_score(self, score: int):
        self.all_scores.append(score) 