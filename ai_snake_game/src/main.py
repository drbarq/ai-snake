import pygame
from game.game_engine import GameEngine
from game.snake import Direction
from game.renderer import ModernRenderer

def main():
    pygame.init()
    screen = pygame.display.set_mode((800, 800))
    pygame.display.set_caption("AI Snake Game - Minimal Demo")
    clock = pygame.time.Clock()

    engine = GameEngine(20, 20, 30)
    renderer = ModernRenderer(screen, cell_size=30)

    running = True
    direction = Direction.RIGHT
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    direction = Direction.UP
                elif event.key == pygame.K_DOWN:
                    direction = Direction.DOWN
                elif event.key == pygame.K_LEFT:
                    direction = Direction.LEFT
                elif event.key == pygame.K_RIGHT:
                    direction = Direction.RIGHT
                elif event.key == pygame.K_r:
                    engine.reset()

        if not engine.is_game_over():
            engine.update(direction)

        renderer.render_frame(engine.get_state())
        pygame.display.flip()
        clock.tick(10)

    pygame.quit()

if __name__ == "__main__":
    main()