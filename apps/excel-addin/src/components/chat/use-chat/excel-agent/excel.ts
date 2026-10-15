/*
 * Office.js helpers shared by the tools and their approvals. Plain functions
 * with no AI SDK in them, so they keep working wherever the agent loop runs.
 */

/**
 * Resolves `Sales!A1:B2`, `'Q1 Data'!A1` or `A1:B2` (on the active sheet) to
 * the sheet and the range on it.
 */
export function getRange(context: Excel.RequestContext, address: string) {
  const separator = address.lastIndexOf("!");
  if (separator === -1) {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    return { sheet, range: sheet.getRange(address) };
  }
  // Excel quotes sheet names with spaces, and doubles quotes inside them
  const sheetName = address
    .slice(0, separator)
    .replace(/^'(.*)'$/, "$1")
    .replace(/''/g, "'");
  const sheet = context.workbook.worksheets.getItem(sheetName);
  return { sheet, range: sheet.getRange(address.slice(separator + 1)) };
}

/** Shows the user what changed: switches to the sheet and selects the range. */
export function revealRange(sheet: Excel.Worksheet, range: Excel.Range) {
  sheet.activate();
  range.select();
}
