const tests = [
  '```json\n{"priority":"low"}\n```',
  '```\n{"priority":"low"}\n```',
  '{"priority":"low"}',
  ' \n ```json\n{"priority":"low"}\n``` \n '
];

for (let rawText of tests) {
  let original = rawText;
  if (rawText.trim().startsWith('```')) {
    rawText = rawText.trim().replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  }
  console.log("Original:", JSON.stringify(original));
  console.log("Parsed:", JSON.parse(rawText));
}
