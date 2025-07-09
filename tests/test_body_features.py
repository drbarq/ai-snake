import numpy as np
from ai_snake_game.src.ai.input_processor import InputProcessor
from ai_snake_game.src.game.snake import Snake, Direction


def test_body_feature_extraction():
    snake = Snake((5, 5), Direction.RIGHT)
    snake.positions = [
        (5, 5),  # head
        (5, 4),  # up 1
        (5, 3),  # up 2
        (6, 5),  # right 1
        (6, 6),  # down-right (should not count)
    ]
    game_state = {
        'snake': snake,
        'food': type('Food', (), {'position': (0, 0)})(),
        'grid_width': 10,
        'grid_height': 10
    }
    ip = InputProcessor('features', {'body_awareness': True})
    features = ip._extract_body_features(game_state)
    assert len(features) == 4
    expected = [0.1, 1.0, 1.0, 0.1]
    assert np.allclose(features, expected)
