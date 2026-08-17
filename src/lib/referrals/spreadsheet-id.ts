export function extractSpreadsheetIdFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Raw ID pasted directly.
  if (!trimmed.includes("/")) {
    return trimmed;
  }

  // Google Sheets URL patterns:
  // https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit...
  // https://docs.google.com/spreadsheets/u/0/d/<SPREADSHEET_ID>/edit...
  const match = trimmed.match(/\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}
