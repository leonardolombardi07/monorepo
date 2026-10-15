import { tool } from "ai";
import { z } from "zod";

/** Header names kept per table, so a very wide table doesn't flood the context. */
const MAX_TABLE_HEADERS = 30;

/*
 * How Office.js works, in three moves:
 * 1. Excel objects in JavaScript are proxies: `range.address` is empty until loaded.
 * 2. `load('...')` queues what to read; nothing is sent yet.
 * 3. `await context.sync()` sends the whole queue to Excel in one round trip.
 * Round trips are slow, so the code batches: here 3 syncs, however many sheets.
 */
async function readWorkbookOverview() {
  return Excel.run(async (context) => {
    const worksheets = context.workbook.worksheets;
    worksheets.load("items/name,items/visibility");
    const activeSheet = worksheets.getActiveWorksheet();
    activeSheet.load("name");
    const selection = context.workbook.getSelectedRange();
    selection.load("address");
    await context.sync();

    // Needs the sheet list from the first sync, hence a second one
    const sheets = worksheets.items.map((sheet) => {
      // `true`: only cells with values count, not cells that are merely formatted
      const usedRange = sheet.getUsedRangeOrNullObject(true);
      usedRange.load("address,rowCount,columnCount");
      sheet.tables.load("items/name");
      return { sheet, usedRange };
    });
    await context.sync();

    const tables = sheets.map(({ sheet }) =>
      sheet.tables.items.map((table) => {
        const range = table.getRange();
        range.load("address");
        const headerRow = table.getHeaderRowRange();
        headerRow.load("values");
        return { table, range, headerRow };
      }),
    );
    await context.sync();

    return {
      activeSheet: activeSheet.name,
      selection: selection.address,
      sheets: sheets.map(({ sheet, usedRange }, index) => ({
        name: sheet.name,
        visible: sheet.visibility === Excel.SheetVisibility.visible,
        // A null object, not an error, when the sheet is empty
        usedRange: usedRange.isNullObject
          ? null
          : {
              address: usedRange.address,
              rows: usedRange.rowCount,
              columns: usedRange.columnCount,
            },
        tables: (tables[index] ?? []).map(({ table, range, headerRow }) => {
          const headers = (headerRow.values[0] ?? []).map(String);
          return {
            name: table.name,
            address: range.address,
            headers: headers.slice(0, MAX_TABLE_HEADERS),
            ...(headers.length > MAX_TABLE_HEADERS && {
              moreHeaders: headers.length - MAX_TABLE_HEADERS,
            }),
          };
        }),
      })),
    };
  });
}

/*
 * A tool is what the model sees (`description`, `inputSchema`) plus what runs
 * when it calls it (`execute`). The description is the tool's documentation
 * for the model, so it says what it returns and when to use it.
 */
export const getWorkbookOverview = tool({
  description:
    "Get the workbook's structure, not its contents: the sheets with their used ranges, " +
    "the tables with their headers, the active sheet and the address the user has selected. " +
    "Call it first in a task, and again after the user may have changed the workbook.",
  inputSchema: z.object({}),
  execute: readWorkbookOverview,
});
