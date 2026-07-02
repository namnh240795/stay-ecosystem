import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

type Bindings = {
  AUTH_SERVICE_URL: string;
  USERS_SERVICE_URL: string;
  PROPERTIES_SERVICE_URL: string;
  BOOKINGS_SERVICE_URL: string;
  PAYMENTS_SERVICE_URL: string;
  REVIEWS_SERVICE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const ROUTE_MAP: Record<string, (env: Bindings) => string> = {
  "/api/auth": (env) => env.AUTH_SERVICE_URL,
  "/api/users": (env) => env.USERS_SERVICE_URL,
  "/api/properties": (env) => env.PROPERTIES_SERVICE_URL,
  "/api/bookings": (env) => env.BOOKINGS_SERVICE_URL,
  "/api/payments": (env) => env.PAYMENTS_SERVICE_URL,
  "/api/reviews": (env) => env.REVIEWS_SERVICE_URL,
};

async function proxyToUpstream(
  upstreamBase: string,
  request: Request,
  pathSuffix: string,
): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = `${upstreamBase.replace(/\/$/, "")}${pathSuffix}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");

  return fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
  });
}

for (const [prefix, resolveUpstream] of Object.entries(ROUTE_MAP)) {
  app.all(`${prefix}/**`, async (c) => {
    const upstream = resolveUpstream(c.env);
    if (!upstream) {
      return c.json(
        { error: `Upstream URL for ${prefix} is not configured` },
        502,
      );
    }
    const pathSuffix = new URL(c.req.url).pathname;
    return proxyToUpstream(upstream, c.req.raw, pathSuffix);
  });

  app.all(prefix, async (c) => {
    const upstream = resolveUpstream(c.env);
    if (!upstream) {
      return c.json(
        { error: `Upstream URL for ${prefix} is not configured` },
        502,
      );
    }
    return proxyToUpstream(upstream, c.req.raw, "");
  });
}

app.get("/health", (c) =>
  c.json({ status: "ok", service: "gateway", timestamp: new Date().toISOString() }),
);

const OPENAPI_SERVICES = [
  { name: "Auth Service", prefix: "/api/auth" },
  { name: "Users Service", prefix: "/api/users" },
  { name: "Properties Service", prefix: "/api/properties" },
  { name: "Bookings Service", prefix: "/api/bookings" },
  { name: "Payments Service", prefix: "/api/payments" },
  { name: "Reviews Service", prefix: "/api/reviews" },
];

function buildUnifiedSpec(): Record<string, unknown> {
  return {
    openapi: "3.1.0",
    info: {
      title: "Booking Apartment System",
      description:
        "Unified API for the Cloudflare Booking Apartment System. " +
        "This gateway aggregates endpoints from all downstream microservices.",
      version: "0.0.1",
    },
    servers: [{ url: "/", description: "Gateway" }],
    paths: Object.fromEntries(
      OPENAPI_SERVICES.flatMap((svc) => [
        [
          `${svc.prefix}/{path+}`,
          {
            summary: `Proxied to ${svc.name}`,
            description: `All requests matching \`${svc.prefix}/**\` are forwarded to ${svc.name}.`,
            servers: [{ url: svc.prefix }],
            parameters: [
              {
                name: "path+",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Path forwarded to the upstream service",
              },
            ],
          },
        ],
      ]),
    ),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: OPENAPI_SERVICES.map((svc) => ({
      name: svc.name,
      description: `Endpoints proxied from ${svc.name}`,
    })),
  };
}

app.get("/openapi.json", (c) => c.json(buildUnifiedSpec()));

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  }),
);

app.notFound((c) =>
  c.json(
    {
      error: "Not Found",
      message: `No route matched ${c.req.method} ${new URL(c.req.url).pathname}`,
    },
    404,
  ),
);

export default app;
