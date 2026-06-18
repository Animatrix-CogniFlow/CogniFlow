import { Suspense, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { PageTransition } from "./PageTransition";
import { PageLoader } from "../ui/Loader";
import { AmbientBackground } from "../visuals/AmbientBackground";
import { FloatingTutor } from "../ui/FloatingTutor";
import { useChatStore } from "../../stores/useChatStore";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [persona, setPersona] = useState<string | null>(null);
  
  const selectedDocumentId = useChatStore((s) => s.selectedDocumentId);
  const selectDocument = useChatStore((s) => s.selectDocument);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  
  const location = useLocation();

  // Load documents list on initial load
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Real-time persona sync from Firestore
  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribeSnapshot = onSnapshot(
          doc(db, "users", user.uid),
          (docSnap) => {
            if (docSnap.exists() && docSnap.data().persona) {
              setPersona(docSnap.data().persona);
            } else {
              setPersona(null);
            }
          }
        );
        return () => unsubscribeSnapshot();
      } else {
        setPersona(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync URL deckId to selectedDocumentId if present
  useEffect(() => {
    const segments = location.pathname.split("/");
    const studyIndex = segments.indexOf("study");
    if (studyIndex !== -1 && segments[studyIndex + 1]) {
      const urlDocId = segments[studyIndex + 1];
      if (urlDocId && urlDocId !== "review" && urlDocId !== "quiz" && urlDocId !== selectedDocumentId) {
        selectDocument(urlDocId);
      }
    }
  }, [location.pathname, selectedDocumentId, selectDocument]);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="relative flex-1 cf-grid-bg overflow-hidden">
          <AmbientBackground />
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>

      {/* Floating AI Tutor — visible everywhere in the app */}
      <FloatingTutor persona={persona} documentId={selectedDocumentId} />
    </div>
  );
}
