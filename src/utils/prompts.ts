export const ANALYSIS_PROMPT = (content: string) => {
  return `Analyze the following user note and respond ONLY in JSON format without additional comments:

{
  "type": "todo|note|reminder|idea|important",
  "priority": "low|medium|high", 
  "summary": "brief summary (max 50 characters)",
  "actionItems": ["list of specific actions if this is a task"],
  "dueContext": "time context if visible"
}

Categorization rules:
- "todo": if it contains specific tasks to be done
- "reminder": if it's a reminder about something important
- "idea": if it's an idea or inspiration
- "important": if it sounds urgent or very important
- "note": for general notes, observations

Priority:
- "high": urgent, with deadline, very important
- "medium": important but not urgent
- "low": can wait

User note: "${content}"`;
};
