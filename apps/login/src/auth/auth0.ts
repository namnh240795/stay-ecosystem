import { Auth0Client, createAuth0Client } from "@auth0/auth0-spa-js";

let auth0Client: Auth0Client | null = null;

export async function getAuth0Client(): Promise<Auth0Client> {
  if (auth0Client) {
    return auth0Client;
  }

  auth0Client = await createAuth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  });

  return auth0Client;
}

export type UserRole = "customer" | "partner" | "admin";

const REDIRECT_URIS: Record<UserRole, string> = {
  customer: "http://localhost:5174",
  partner: "http://localhost:5175",
  admin: "http://localhost:5176",
};

const AUTH0_CONNECTIONS: Record<UserRole, string> = {
  customer: "customers-db",
  partner: "partners-db",
  admin: "admins-db",
};

export async function loginWithRole(role: UserRole): Promise<void> {
  const client = await getAuth0Client();

  await client.loginWithRedirect({
    connection: AUTH0_CONNECTIONS[role],
    appState: {
      target: REDIRECT_URIS[role],
    },
  });
}

export async function signupWithRole(role: UserRole): Promise<void> {
  const client = await getAuth0Client();

  await client.loginWithRedirect({
    connection: AUTH0_CONNECTIONS[role],
    appState: {
      target: REDIRECT_URIS[role],
    },
    screen_hint: "signup",
  });
}

export async function handleRedirectCallback(): Promise<string | null> {
  const client = await getAuth0Client();
  const result = await client.handleRedirectCallback();

  return result.appState?.target ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const client = await getAuth0Client();
  return client.isAuthenticated();
}

export async function getUser() {
  const client = await getAuth0Client();
  return client.getUser();
}
