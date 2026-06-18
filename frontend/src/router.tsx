import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/shell/AppShell";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Route-based code splitting
const Landing = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Onboarding = lazy(() => import("./pages/auth/Onboarding"));

// 🚀 SWAPPED: Pointing to your new Persona-Driven Engine
const AdaptiveDashboard = lazy(() => import("./pages/app/AdaptiveDashboard")); 

const Study = lazy(() => import("./pages/app/Study"));
const DeckDetail = lazy(() => import("./pages/app/DeckDetail"));
const Review = lazy(() => import("./pages/app/Review"));
const Quiz = lazy(() => import("./pages/app/Quiz"));
const Upload = lazy(() => import("./pages/app/Upload"));
const VisualLab = lazy(() => import("./pages/app/VisualLab"));
const OralExam = lazy(() => import("./pages/app/OralExam"));
const Agents = lazy(() => import("./pages/app/Agents"));
const Settings = lazy(() => import("./pages/app/Settings"));
const Profile = lazy(() => import("./pages/app/Profile"));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* 🚀 SWAPPED: Now loads the Traffic Cop instead of the static dashboard */}
        <Route index element={<AdaptiveDashboard />} />
        
        <Route path="study" element={<Study />} />
        <Route path="study/:deckId" element={<DeckDetail />} />
        <Route path="study/:deckId/review" element={<Review />} />
        <Route path="study/:deckId/quiz" element={<Quiz />} />
        
        {/* ✂️ DELETED: The old static /tutor route is officially gone! */}
        
        <Route path="upload" element={<Upload />} />
        <Route path="lab" element={<VisualLab />} />
        <Route path="oral" element={<OralExam />} />
        <Route path="agents" element={<Agents />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
