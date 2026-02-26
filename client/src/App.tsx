import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";

import { I18nProvider } from "./lib/i18n";
import { Layout } from "./components/layout";
import { useAuth } from "@/hooks/use-auth";

import WordsPage from "./pages/words";
import RulesPage from "./pages/rules";
import VerbsPage from "./pages/verbs";
import ContextPage from "./pages/context";
import { Loader2 } from "lucide-react";

function AuthenticatedRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/">
          <Redirect to="/words" />
        </Route>
        <Route path="/words" component={WordsPage} />
        <Route path="/rules" component={RulesPage} />
        <Route path="/verbs" component={VerbsPage} />
        <Route path="/context" component={ContextPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
