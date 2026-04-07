export function buildTestCode(userCode: string, testCode: string, language: string): string {
  if (!testCode) return userCode;

  if (language === "java") {
    const mainRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)\s*\{[\s\S]*?\n\s*\}/;
    if (mainRegex.test(userCode)) {
      return userCode.replace(
        mainRegex,
        `public static void main(String[] args) {\n${testCode}\n    }`
      );
    }
    const lastBrace = userCode.lastIndexOf("}");
    if (lastBrace !== -1) {
      return (
        userCode.slice(0, lastBrace) +
        `\n    public static void main(String[] args) {\n${testCode}\n    }\n}`
      );
    }
    return userCode + "\n" + testCode;
  }

  return userCode + "\n\n" + testCode;
}
