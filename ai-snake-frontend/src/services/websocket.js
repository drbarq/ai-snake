class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.onMessageCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      this.ws = new WebSocket("ws://127.0.0.1:8000/ws");

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  sendCommand(command) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(command));
    } else {
      console.warn("WebSocket not connected");
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  // Game commands
  toggleMode() {
    this.sendCommand({ action: "toggle_mode" });
  }

  startTraining() {
    this.sendCommand({ action: "start_training" });
  }

  pauseTraining() {
    this.sendCommand({ action: "pause_training" });
  }

  startRound() {
    this.sendCommand({ action: "start_round" });
  }

  setGrid(width, height) {
    this.sendCommand({ action: "set_grid", width, height });
  }

  setTrainingRounds(rounds) {
    this.sendCommand({ action: "set_training_rounds", rounds });
  }

  sendDirection(direction) {
    this.sendCommand({ action: "manual_direction", direction });
  }

  resetGame() {
    this.sendCommand({ action: "reset" });
  }
}

export default new WebSocketService();
