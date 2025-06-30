import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Grid,
  Chip,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import { useGame } from "../contexts/GameContext";

export default function ModelSettings() {
  const { gameState, isConnected } = useGame();
  
  // Model Configuration State
  const [config, setConfig] = useState({
    // Reward System
    rewards: {
      death_penalty: -10.0,
      food_reward: 10.0,
      step_penalty: -0.1,
      win_reward: 100.0,
    },
    
    // Network Architecture
    network: {
      type: "FeatureDQN", // GridDQN, FeatureDQN, VisionDQN, HybridDQN
      hidden_layers: [256, 128],
      activation: "relu",
    },
    
    // Training Parameters
    training: {
      learning_rate: 0.001,
      batch_size: 32,
      memory_size: 50000,
      epsilon_start: 1.0,
      epsilon_end: 0.01,
      epsilon_decay: 0.995,
      target_update_frequency: 1000,
    },
    
    // Input Processing
    features: {
      danger_detection: true,
      food_vector: true,
      wall_distances: true,
      body_awareness: true,
      movement_state: true,
    },
    
    // Vision Configuration (for VisionDQN)
    vision: {
      ray_count: 8,
      ray_length: 10,
      detect_walls: true,
      detect_body: true,
      detect_food: true,
    },
  });

  const [isModified, setIsModified] = useState(false);
  const [expanded, setExpanded] = useState("rewards");
  const [presets, setPresets] = useState({});

  // Handle configuration changes
  const updateConfig = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setIsModified(true);
  };

  // Handle array updates (like hidden layers)
  const updateHiddenLayers = (index, value) => {
    const newLayers = [...config.network.hidden_layers];
    newLayers[index] = parseInt(value);
    setConfig(prev => ({
      ...prev,
      network: {
        ...prev.network,
        hidden_layers: newLayers
      }
    }));
    setIsModified(true);
  };

  const addHiddenLayer = () => {
    setConfig(prev => ({
      ...prev,
      network: {
        ...prev.network,
        hidden_layers: [...prev.network.hidden_layers, 64]
      }
    }));
    setIsModified(true);
  };

  const removeHiddenLayer = (index) => {
    setConfig(prev => ({
      ...prev,
      network: {
        ...prev.network,
        hidden_layers: prev.network.hidden_layers.filter((_, i) => i !== index)
      }
    }));
    setIsModified(true);
  };

  // Load configuration from backend
  const loadConfig = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/config');
      if (response.ok) {
        const serverConfig = await response.json();
        setConfig(serverConfig);
        setIsModified(false);
      }
    } catch (error) {
      console.error("Failed to load configuration:", error);
    }
  };

  // Load presets from backend
  const loadPresets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/config/presets');
      if (response.ok) {
        const serverPresets = await response.json();
        setPresets(serverPresets);
      }
    } catch (error) {
      console.error("Failed to load presets:", error);
    }
  };

  // Load configuration and presets on component mount
  useEffect(() => {
    loadConfig();
    loadPresets();
  }, []);

  // Apply configuration
  const applyConfig = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Configuration applied:", result);
        setIsModified(false);
      } else {
        const error = await response.json();
        console.error("Failed to apply configuration:", error);
        alert(`Failed to apply configuration: ${error.detail}`);
      }
    } catch (error) {
      console.error("Failed to apply configuration:", error);
      alert("Failed to apply configuration. Make sure the backend is running.");
    }
  };

  // Load a preset configuration
  const loadPreset = (presetName) => {
    if (presets[presetName]) {
      setConfig(presets[presetName]);
      setIsModified(true);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (presets.default) {
      setConfig(presets.default);
    } else {
      setConfig({
        rewards: {
          death_penalty: -10.0,
          food_reward: 10.0,
          step_penalty: -0.1,
          win_reward: 100.0,
        },
        network: {
          type: "FeatureDQN",
          hidden_layers: [256, 128],
          activation: "relu",
        },
        training: {
          learning_rate: 0.001,
          batch_size: 32,
          memory_size: 50000,
          epsilon_start: 1.0,
          epsilon_end: 0.01,
          epsilon_decay: 0.995,
          target_update_frequency: 1000,
        },
        features: {
          danger_detection: true,
          food_vector: true,
          wall_distances: true,
          body_awareness: true,
          movement_state: true,
        },
        vision: {
          ray_count: 8,
          ray_length: 10,
          detect_walls: true,
          detect_body: true,
          detect_food: true,
        },
      });
    }
    setIsModified(false);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const canModifySettings = !gameState.training && !gameState.training_paused;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 212, 255, 0.2)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <SettingsIcon sx={{ mr: 1, color: "#00D4FF" }} />
        <Typography variant="h6" fontWeight="600">
          Model Settings
        </Typography>
        {isModified && (
          <Chip 
            label="Modified" 
            size="small" 
            color="warning" 
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {!canModifySettings && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Stop training to modify model settings
        </Alert>
      )}

      <Stack spacing={2}>
        {/* Reward System */}
        <Accordion 
          expanded={expanded === 'rewards'} 
          onChange={handleAccordionChange('rewards')}
          disabled={!canModifySettings}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="600">
              Reward System
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Death Penalty"
                  type="number"
                  value={config.rewards.death_penalty}
                  onChange={(e) => updateConfig('rewards', 'death_penalty', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 0.1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Food Reward"
                  type="number"
                  value={config.rewards.food_reward}
                  onChange={(e) => updateConfig('rewards', 'food_reward', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 0.1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Step Penalty"
                  type="number"
                  value={config.rewards.step_penalty}
                  onChange={(e) => updateConfig('rewards', 'step_penalty', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 0.01 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Win Reward"
                  type="number"
                  value={config.rewards.win_reward}
                  onChange={(e) => updateConfig('rewards', 'win_reward', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 1 }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Network Architecture */}
        <Accordion 
          expanded={expanded === 'network'} 
          onChange={handleAccordionChange('network')}
          disabled={!canModifySettings}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="600">
              Network Architecture
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Network Type</InputLabel>
                <Select
                  value={config.network.type}
                  onChange={(e) => updateConfig('network', 'type', e.target.value)}
                  label="Network Type"
                >
                  <MenuItem value="FeatureDQN">Feature DQN</MenuItem>
                  <MenuItem value="GridDQN">Grid DQN</MenuItem>
                  <MenuItem value="VisionDQN">Vision DQN</MenuItem>
                  <MenuItem value="HybridDQN">Hybrid DQN</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Hidden Layers
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {config.network.hidden_layers.map((size, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={size}
                        onChange={(e) => updateHiddenLayers(index, e.target.value)}
                        sx={{ width: 80, mr: 1 }}
                      />
                      <Button
                        size="small"
                        onClick={() => removeHiddenLayer(index)}
                        disabled={config.network.hidden_layers.length === 1}
                        color="error"
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                  <Button size="small" onClick={addHiddenLayer} variant="outlined">
                    + Add Layer
                  </Button>
                </Stack>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Activation Function</InputLabel>
                <Select
                  value={config.network.activation}
                  onChange={(e) => updateConfig('network', 'activation', e.target.value)}
                  label="Activation Function"
                >
                  <MenuItem value="relu">ReLU</MenuItem>
                  <MenuItem value="tanh">Tanh</MenuItem>
                  <MenuItem value="sigmoid">Sigmoid</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Training Parameters */}
        <Accordion 
          expanded={expanded === 'training'} 
          onChange={handleAccordionChange('training')}
          disabled={!canModifySettings}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="600">
              Training Parameters
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Learning Rate"
                  type="number"
                  value={config.training.learning_rate}
                  onChange={(e) => updateConfig('training', 'learning_rate', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 0.0001 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Batch Size"
                  type="number"
                  value={config.training.batch_size}
                  onChange={(e) => updateConfig('training', 'batch_size', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Memory Size"
                  type="number"
                  value={config.training.memory_size}
                  onChange={(e) => updateConfig('training', 'memory_size', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Target Update Freq"
                  type="number"
                  value={config.training.target_update_frequency}
                  onChange={(e) => updateConfig('training', 'target_update_frequency', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Epsilon Start"
                  type="number"
                  value={config.training.epsilon_start}
                  onChange={(e) => updateConfig('training', 'epsilon_start', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 0.01, min: 0, max: 1 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Epsilon End"
                  type="number"
                  value={config.training.epsilon_end}
                  onChange={(e) => updateConfig('training', 'epsilon_end', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 0.01, min: 0, max: 1 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Epsilon Decay"
                  type="number"
                  value={config.training.epsilon_decay}
                  onChange={(e) => updateConfig('training', 'epsilon_decay', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  InputProps={{ step: 0.001, min: 0, max: 1 }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Input Features */}
        <Accordion 
          expanded={expanded === 'features'} 
          onChange={handleAccordionChange('features')}
          disabled={!canModifySettings}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="600">
              Input Features
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.features.danger_detection}
                    onChange={(e) => updateConfig('features', 'danger_detection', e.target.checked)}
                  />
                }
                label="Danger Detection"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.features.food_vector}
                    onChange={(e) => updateConfig('features', 'food_vector', e.target.checked)}
                  />
                }
                label="Food Vector"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.features.wall_distances}
                    onChange={(e) => updateConfig('features', 'wall_distances', e.target.checked)}
                  />
                }
                label="Wall Distances"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.features.body_awareness}
                    onChange={(e) => updateConfig('features', 'body_awareness', e.target.checked)}
                  />
                }
                label="Body Awareness"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.features.movement_state}
                    onChange={(e) => updateConfig('features', 'movement_state', e.target.checked)}
                  />
                }
                label="Movement State"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Configuration Presets */}
        {Object.keys(presets).length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Configuration Presets
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {Object.keys(presets).map((presetName) => (
                <Button
                  key={presetName}
                  variant="outlined"
                  size="small"
                  onClick={() => loadPreset(presetName)}
                  disabled={!canModifySettings}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {presetName}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={applyConfig}
            disabled={!isModified || !canModifySettings || !isConnected}
            sx={{
              background: "linear-gradient(45deg, #00D4FF, #00FF88)",
              "&:hover": {
                background: "linear-gradient(45deg, #0099CC, #00CC66)",
              },
            }}
          >
            Apply Settings
          </Button>
          <Button
            variant="outlined"
            onClick={resetToDefaults}
            disabled={!canModifySettings}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}