// Cloudflare Workers global type declarations
// Minimal types to avoid DOM conflicts while providing necessary Workers APIs

// Console
declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
};

// Crypto
declare const crypto: {
  getRandomValues<T extends ArrayBufferView>(array: T): T;
  randomUUID(): string;
  subtle: SubtleCrypto;
};

interface SubtleCrypto {
  digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
  sign(algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
  verify(algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams, key: CryptoKey, signature: BufferSource, data: BufferSource): Promise<boolean>;
  generateKey(algorithm: RsaKeyGenParams | EcKeyGenParams | AesKeyGenParams | HmacKeyGenParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey | CryptoKeyPair>;
  importKey(format: KeyFormat, keyData: JsonWebKey | BufferSource, algorithm: AlgorithmIdentifier | RsaKeyImportParams | EcKeyImportParams | HmacKeyImportParams | AesKeyImportParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey>;
}

type AlgorithmIdentifier = string | Algorithm;
interface Algorithm { name: string }
interface RsaPssParams extends Algorithm { saltLength?: number }
interface EcdsaParams extends Algorithm { hash?: AlgorithmIdentifier }
interface RsaKeyGenParams extends Algorithm { modulusLength: number; publicExponent: Uint8Array; hash?: AlgorithmIdentifier }
interface EcKeyGenParams extends Algorithm { namedCurve: string }
interface AesKeyGenParams extends Algorithm { length: number }
interface HmacKeyGenParams extends Algorithm { hash: AlgorithmIdentifier }
interface RsaKeyImportParams extends Algorithm { hash?: AlgorithmIdentifier }
interface EcKeyImportParams extends Algorithm { namedCurve?: string }
interface HmacKeyImportParams extends Algorithm { hash: AlgorithmIdentifier }
interface AesKeyImportParams extends Algorithm { length?: number }
type KeyUsage = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'wrapKey' | 'unwrapKey';
interface CryptoKey { type: string; extractable: boolean; algorithm: Algorithm; usages: KeyUsage[] }
interface CryptoKeyPair { publicKey: CryptoKey; privateKey: CryptoKey }

// URL
declare class URL {
  constructor(url: string, base?: string);
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  searchParams: URLSearchParams;
  hash: string;
  toString(): string;
}

declare class URLSearchParams {
  constructor(init?: string | Record<string, string> | string[][] | URLSearchParams);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  toString(): string;
}

// Fetch API (Workers-compatible)
type HeadersInit = Record<string, string> | Headers | string[][];
type BodyInit = ReadableStream | Blob | ArrayBuffer | ArrayBufferView | FormData | URLSearchParams | string;

interface Headers {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(callbackfn: (value: string, key: string) => void): void;
}

interface Body {
  readonly body: ReadableStream | null;
  readonly bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

declare class Request extends Body {
  constructor(input: string | Request, init?: RequestInit);
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;
  clone(): Request;
}

interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  mode?: string;
  credentials?: string;
  cache?: string;
  redirect?: string;
  referrer?: string;
  referrerPolicy?: string;
  integrity?: string;
}

type RequestInfo = string | Request;

declare class Response extends Body {
  constructor(body?: BodyInit | null, init?: ResponseInit);
  readonly status: number;
  readonly statusText: string;
  readonly ok: boolean;
  readonly headers: Headers;
  clone(): Response;
}

interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}

// D1 Database types
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<{ count: number; duration: number; results: unknown[] }>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  dump(): Promise<ArrayBuffer>;
}

interface D1PreparedStatement {
  bind(...bindings: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    size_after_memory_kb?: number;
    size_before_memory_kb?: number;
    changes?: number;
    last_row_id?: number | string;
    rows_read?: number;
    rows_written?: number;
  };
}

// KV types (minimal)
interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<unknown>;
  put(key: string, value: string | ReadableStream | ArrayBuffer | ArrayBufferView, options?: KVNamespacePutOptions): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult>;
}

interface KVNamespacePutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: unknown;
}

interface KVNamespaceListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

interface KVNamespaceListResult {
  keys: { name: string; expiration?: number; metadata?: unknown }[];
  list_complete: boolean;
  cache_status: string | null;
}

// R2 types (minimal)
interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string, options?: R2PutOptions): Promise<R2Object>;
  delete(key: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata: R2HTTPMetadata;
  customMetadata: Record<string, string>;
}

interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  md5?: string | ArrayBuffer;
}

interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

interface R2ListOptions {
  prefix?: string;
  delimiter?: string;
  cursor?: string;
  limit?: number;
  startAfter?: string;
  include?: ('httpMetadata' | 'customMetadata')[];
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
}

// Env type placeholder
interface Env {
  [key: string]: unknown;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}
