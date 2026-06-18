import { useEffect, useState } from "react";
import type { LearningSession } from "../lib/types";
import { contentService } from "../services/contentService";

export function useSessions() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    contentService.fetchSessions().then((data) => {
      if (alive) {
        setSessions(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { sessions, loading };
}
