import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box, Container } from "@mui/material";
import GameBoard from "./components/GameBoard";
import Dashboard from "./components/Dashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import { GameProvider } from "./contexts/GameContext";
import "./App.css";

// Create a dark cyberpunk theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00D4FF",
    },
    secondary: {
      main: "#00FF88",
    },
    background: {
      default: "#1A1A1A",
      paper: "rgba(255, 255, 255, 0.05)",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#E0E0E0",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GameProvider>
        <Box
          className="particle-bg"
          sx={{
            minHeight: "100vh",
            minWidth: "100vw",
            background: "linear-gradient(135deg, #1A1A1A 0%, #0F1419 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Scanline effect */}
          <Box className="scanline" />

          {/* Floating particles */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {[...Array(20)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  width: "2px",
                  height: "2px",
                  background: "linear-gradient(45deg, #00D4FF, #00FF88)",
                  borderRadius: "50%",
                  left: `${Math.random() * 100}%`,
                  animation: `particleFloat ${
                    5 + Math.random() * 10
                  }s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </Box>

          <Container
            maxWidth={false}
            disableGutters
            sx={{
              position: "relative",
              zIndex: 2,
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <Dashboard>
                <GameBoard />
              </Dashboard>
            </Box>
          </Container>
        </Box>
        </GameProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
