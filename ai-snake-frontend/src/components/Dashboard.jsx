import {
  Box,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Paper,
} from "@mui/material";

export default function Dashboard() {
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        p: 4,
        borderRadius: 4,
        width: "100%",
        maxWidth: "400px",
        mx: "auto",
        bgcolor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Typography variant="h4" color="white" fontWeight="bold">
        AI SNAKE
      </Typography>

      <Stack width="100%" spacing={3}>
        {/* Grid Size Control */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 212, 255, 0.05)",
            border: "1px solid rgba(0, 212, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight="600" color="white">
              GRID SIZE
            </Typography>
            <Chip
              label="CONFIG"
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="W"
              defaultValue="15"
              sx={{
                width: "60px",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(0, 212, 255, 0.3)",
                  },
                  "& input": {
                    color: "white",
                  },
                },
              }}
            />
            <Typography color="gray.400">×</Typography>
            <TextField
              size="small"
              placeholder="H"
              defaultValue="17"
              sx={{
                width: "60px",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(0, 212, 255, 0.3)",
                  },
                  "& input": {
                    color: "white",
                  },
                },
              }}
            />
            <Button size="small" variant="contained" color="primary">
              APPLY
            </Button>
          </Box>
        </Paper>

        {/* Training Rounds Control */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 255, 136, 0.05)",
            border: "1px solid rgba(0, 255, 136, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight="600" color="white">
              TRAINING ROUNDS
            </Typography>
            <Chip label="AI" size="small" color="success" variant="outlined" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="Rounds"
              defaultValue="100"
              sx={{
                width: "80px",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(0, 255, 136, 0.3)",
                  },
                  "& input": {
                    color: "white",
                  },
                },
              }}
            />
            <Button size="small" variant="contained" color="success">
              SET
            </Button>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={65}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(0, 0, 0, 0.3)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#00FF88",
                },
              }}
            />
            <Typography
              variant="caption"
              color="gray.400"
              textAlign="center"
              display="block"
              mt={0.5}
            >
              65% Complete
            </Typography>
          </Box>
        </Paper>

        {/* Game Mode Selection */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(139, 92, 246, 0.05)",
            border: "1px solid rgba(139, 92, 246, 0.1)",
          }}
        >
          <Typography
            variant="body2"
            fontWeight="600"
            color="white"
            textAlign="center"
            mb={1.5}
          >
            GAME MODE
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Button size="small" variant="outlined" color="success">
              MANUAL
            </Button>
            <Button size="small" variant="outlined" color="primary">
              AI
            </Button>
            <Button size="small" variant="outlined" color="secondary">
              TRAIN
            </Button>
          </Box>
        </Paper>
      </Stack>

      {/* Stats Section */}
      <Stack width="100%" spacing={2}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(255, 107, 53, 0.05)",
            border: "1px solid rgba(255, 107, 53, 0.1)",
          }}
        >
          <Typography variant="body2" fontWeight="600" color="#FF6B35">
            CURRENT SCORE
          </Typography>
          <Typography variant="h3" fontWeight="800" color="white">
            0
          </Typography>
          <Typography variant="caption" color="gray.400">
            Steps: 0 | Time: 00:00
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 212, 255, 0.05)",
            border: "1px solid rgba(0, 212, 255, 0.1)",
          }}
        >
          <Typography variant="body2" fontWeight="600" color="#00D4FF">
            BEST PERFORMANCE
          </Typography>
          <Typography variant="h3" fontWeight="800" color="white">
            0
          </Typography>
          <Typography variant="caption" color="gray.400">
            Avg: 0 | Last: 0 | Epoch: 1
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0, 255, 136, 0.05)",
            border: "1px solid rgba(0, 255, 136, 0.1)",
          }}
        >
          <Typography variant="body2" fontWeight="600" color="#00FF88">
            EXPLORATION RATE
          </Typography>
          <Typography variant="h3" fontWeight="800" color="white">
            1.00
          </Typography>
          <Typography variant="caption" color="gray.400">
            Epsilon: 1.00 | Decay: 0.995
          </Typography>
        </Paper>
      </Stack>

      {/* Recent Scores */}
      <Box width="100%">
        <Typography
          variant="body2"
          fontWeight="600"
          color="white"
          textAlign="center"
          mb={1.5}
        >
          RECENT SCORES
        </Typography>
        <Paper
          elevation={0}
          sx={{
            maxHeight: "120px",
            overflowY: "auto",
            bgcolor: "rgba(0, 0, 0, 0.3)",
            p: 1.5,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Stack spacing={1}>
            {[12, 8, 5, 15, 3, 9].map((score, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="white" fontWeight="600" variant="body2">
                  {score}
                </Typography>
                <Chip
                  label={score > 10 ? "GOOD" : score > 5 ? "OK" : "POOR"}
                  size="small"
                  color={
                    score > 10 ? "success" : score > 5 ? "warning" : "error"
                  }
                  variant="outlined"
                />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* Reset Button */}
      <Button
        fullWidth
        size="large"
        variant="contained"
        color="error"
        sx={{ mt: 2 }}
      >
        RESET GAME
      </Button>
    </Paper>
  );
}
