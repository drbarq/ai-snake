class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.onMessageCallback = null;
    this.onErrorCallback = null;
    this.onCloseCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.commandQueue = []; // Queue commands until connection is ready
  }

  connect() {
    if (this.isConnecting || this.isConnected) {
      return; // Already connecting or connected
    }
    
    try {
      this.isConnecting = true;
      this.ws = new WebSocket("ws://127.0.0.1:8000/ws");

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Process any queued commands
        while (this.commandQueue.length > 0) {
          const command = this.commandQueue.shift();
          this.ws.send(JSON.stringify(command));
        }
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
        this.isConnecting = false;
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnected = false;
        this.isConnecting = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
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
        if (!this.isConnected && !this.isConnecting) {
          this.connect();
        }
      }, Math.min(1000 * this.reconnectAttempts, 5000)); // Cap at 5 seconds
    } else {
      console.error("Max reconnection attempts reached");
      // Clear the command queue after max attempts
      this.commandQueue = [];
    }
  }

  sendCommand(command) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(command));
      } catch (error) {
        console.error("Error sending command:", error);
        // Queue the command for retry
        this.commandQueue.push(command);
      }
    } else if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      // Queue command if still connecting
      console.log("WebSocket connecting, queueing command:", command.action);
      this.commandQueue.push(command);
    } else {
      console.warn("WebSocket not connected, attempting to reconnect");
      this.commandQueue.push(command);
      this.connect();
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onClose(callback) {
    this.onCloseCallback = callback;
  }

  disconnect() {
    if (this.ws) {
      this.isConnected = false;
      this.isConnecting = false;
      this.ws.close();
      this.commandQueue = []; // Clear any pending commands
    }
  }

  // Game commands
  toggleMode() {
    this.sendCommand({ action: "toggle_mode" });
  }

  setMode(mode) {
    console.log(`WebSocket: Sending setMode command for mode: ${mode}`);
    this.sendCommand({ action: "set_mode", mode });
  }

  startTraining() {
    this.sendCommand({ action: "start_training" });
  }

  pauseTraining() {
    this.sendCommand({ action: "pause_training" });
  }

  resumeTraining() {
    this.sendCommand({ action: "resume_training" });
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

  saveModel() {
    this.sendCommand({ action: "save_model" });
  }

  evaluateModel(episodes = 20) {
    this.sendCommand({ action: "evaluate_model", episodes });
  }

  setSpeed(speed) {
    this.sendCommand({ action: "set_speed", speed });
  }

  loadModel(filename) {
    this.sendCommand({ action: "load_model", filename });
  }

  listModels() {
    this.sendCommand({ action: "list_models" });
  }
}

export default new WebSocketService();
