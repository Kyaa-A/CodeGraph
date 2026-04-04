export const WANDBOX_URL = "https://wandbox.org/api/compile.json";

export const COMPILER_MAP: Record<string, string> = {
  python: "cpython-3.12.7",
  javascript: "nodejs-20.17.0",
  typescript: "nodejs-20.17.0",
  java: "openjdk-jdk-22+36",
  c: "gcc-13.2.0-c",
  cpp: "gcc-13.2.0",
  csharp: "mono-6.12.0.199",
  go: "go-1.23.2",
  rust: "rust-1.82.0",
  ruby: "ruby-3.4.1",
  php: "php-8.3.12",
  swift: "swift-6.0.1",
  kotlin: "openjdk-jdk-22+36",
  sql: "sqlite-3.46.1",
};

export const MAX_CODE_LENGTH = 50_000; // 50KB max code size
