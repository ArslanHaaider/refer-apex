/** Demo Google Sheets values used when GOOGLE_SHEETS_MOCK !== "false". */

function daysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function getMockSheetValues(): string[][] {
  return [
    [
      "full_name",
      "phone",
      "email",
      "last_service_date",
      "referred_by_contact_id",
      "referral_code",
      "booking_status",
    ],
    ["Ava Martinez", "+1555010001", "ava.martinez@example.com", daysAgo(45), "", "", "none"],
    ["Noah Chen", "+1555010002", "noah.chen@example.com", daysAgo(32), "", "", "none"],
    ["Mia Patel", "+1555010003", "mia.patel@example.com", daysAgo(20), "", "", "none"],
    ["Liam Brooks", "+1555010004", "liam.brooks@example.com", daysAgo(10), "", "", "none"],
    ["Emma Rivera", "+1555010005", "emma.rivera@example.com", daysAgo(60), "", "REF-EMMA", "paid"],
    ["Olivia Kim", "+1555010006", "olivia.kim@example.com", daysAgo(5), "", "", "none"],
    ["Ethan Wright", "+1555010007", "ethan.wright@example.com", daysAgo(90), "", "", "attended"],
    ["Sophia Diaz", "+1555010008", "sophia.diaz@example.com", daysAgo(35), "", "", "none"],
  ];
}

export const MOCK_SHEET_SPREADSHEETS = [
  { id: "mock-spreadsheet", name: "Demo Patients" },
];

export const MOCK_SHEET_TABS = [{ title: "Clients", sheetId: 0 }];
