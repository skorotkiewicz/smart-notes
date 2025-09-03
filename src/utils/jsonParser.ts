export function extractAndParseJSON(response: string): any {
  try {
    // First try to parse the entire response as JSON
    return JSON.parse(response.trim());
  } catch {
    // Remove markdown code blocks if present
    const cleanResponse = response.replace(/```(?:json)?\s*\n?/g, "").replace(/```/g, "");

    try {
      return JSON.parse(cleanResponse.trim());
    } catch {
      // Look for JSON blocks using regex patterns
      const patterns = [
        // Standard JSON object
        /\{[\s\S]*?\}/,
        // JSON object that might span multiple lines
        /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/,
        // JSON object with nested structures
        /\{(?:[^{}]|\{[^{}]*\})*\}/,
      ];

      for (const pattern of patterns) {
        const match = cleanResponse.match(pattern);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch {}
        }
      }

      // Try to find all potential JSON objects and test each one
      const multipleJsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const matches = cleanResponse.match(multipleJsonRegex);

      if (matches) {
        // Try each match until we find a valid JSON
        for (const jsonCandidate of matches) {
          try {
            return JSON.parse(jsonCandidate);
          } catch {}
        }
      }

      // If all else fails, throw an error
      throw new Error("No valid JSON found in response");
    }
  }
}
