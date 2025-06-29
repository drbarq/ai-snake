import { Box, Typography, Paper } from "@mui/material";

export default function GameBoard() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: "100%", md: "600px" },
        height: { xs: "400px", md: "600px" },
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        border: "2px solid",
        borderColor: "rgba(0, 212, 255, 0.3)",
        bgcolor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-2px",
          left: "-2px",
          right: "-2px",
          bottom: "-2px",
          background:
            "linear-gradient(45deg, #00D4FF, #00FF88, #8B5CF6, #00D4FF)",
          borderRadius: 4,
          zIndex: -1,
          animation: "neonGlow 3s ease-in-out infinite alternate",
        },
      }}
    >
      {/* Grid lines */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.1,
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Game content */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            fontWeight="700"
            color="white"
            mb={2}
            sx={{
              textShadow: "0 0 10px #00D4FF",
              "@media (max-width: 768px)": {
                fontSize: "1.5rem",
              },
            }}
          >
            AI Snake Game
          </Typography>

          {/* Sample snake visualization */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mb: 3,
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: "20px",
                  height: "20px",
                  background: "linear-gradient(45deg, #32D74B, #00FF88)",
                  borderRadius: 1,
                  animation: `pulse ${2 + i * 0.2}s ease-in-out infinite`,
                  boxShadow: "0 0 10px rgba(50, 215, 75, 0.5)",
                }}
              />
            ))}
          </Box>

          {/* Food element */}
          <Box
            sx={{
              width: "16px",
              height: "16px",
              background: "linear-gradient(45deg, #FF6B35, #FF8C42)",
              borderRadius: "50%",
              mx: "auto",
              animation: "pulse 1.5s ease-in-out infinite",
              boxShadow: "0 0 15px rgba(255, 107, 53, 0.6)",
            }}
          />

          <Typography variant="body2" color="gray.400" mt={2} fontWeight="500">
            Ready to play
          </Typography>
        </Box>
      </Box>

      {/* Corner accents */}
      <Box
        sx={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          borderTop: "2px solid",
          borderLeft: "2px solid",
          borderColor: "#00D4FF",
          borderRadius: "4px 0 0 0",
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "20px",
          height: "20px",
          borderTop: "2px solid",
          borderRight: "2px solid",
          borderColor: "#00FF88",
          borderRadius: "0 4px 0 0",
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          borderBottom: "2px solid",
          borderLeft: "2px solid",
          borderColor: "#8B5CF6",
          borderRadius: "0 0 0 4px",
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "20px",
          height: "20px",
          borderBottom: "2px solid",
          borderRight: "2px solid",
          borderColor: "#FF6B35",
          borderRadius: "0 0 4px 0",
          opacity: 0.7,
        }}
      />
    </Paper>
  );
}
