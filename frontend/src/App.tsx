import { useEffect, useRef } from "react";
import { useGameStore } from "./stores/gameStore";
import { useTreeStore } from "./stores/treeStore";
import { usePlaybackStore } from "./stores/playbackStore";
import { useConnectionStore } from "./stores/connectionStore";
import { wsService } from "./services/websocket";
import { Header } from "./components/Header";
import { MainLayout } from "./components/MainLayout";
import { ControlBar } from "./components/ControlBar";

function App() {
  const gameName = useGameStore((s) => s.gameName);
  const status = useConnectionStore((s) => s.status);
  const stepForward = useTreeStore((s) => s.stepForward);
  const events = useTreeStore((s) => s.events);
  const currentStep = useTreeStore((s) => s.currentStep);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const speed = usePlaybackStore((s) => s.speed);
  const pause = usePlaybackStore((s) => s.pause);

  // WebSocket 接続
  useEffect(() => {
    wsService.connect();
    return () => wsService.disconnect();
  }, []);

  // 接続確立時に初期盤面を取得
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current !== "connected" && status === "connected") {
      wsService.getInitialState(gameName);
    }
    prevStatus.current = status;
  }, [status, gameName]);

  // 自動再生
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= events.length - 1) {
      pause();
      return;
    }
    const interval = Math.round(500 / speed);
    const id = setInterval(() => {
      const { currentStep: step, events: evs } = useTreeStore.getState();
      if (step >= evs.length - 1) {
        pause();
        clearInterval(id);
      } else {
        stepForward();
      }
    }, interval);
    return () => clearInterval(id);
  }, [isPlaying, speed, currentStep, events.length, stepForward, pause]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header />
      <MainLayout />
      <ControlBar />
    </div>
  );
}

export default App;
