import { Suspense } from "react";
import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./router";
import { PageLoader } from "./components/ui/Loader";

export default function App() {
  return (
    <AppProviders>
      <Suspense fallback={<PageLoader />}>
        <AppRouter />
      </Suspense>
    </AppProviders>
  );
}
