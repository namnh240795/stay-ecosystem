import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  // If Auth0 env vars are not configured, render children directly (mock mode)
  if (!domain || !clientId) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        connection: "customers-db",
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
