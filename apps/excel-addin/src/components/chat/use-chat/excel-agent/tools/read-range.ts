import { tool } from "ai";
import { z } from "zod";
import { getRange } from "../excel";

/**
 * Cells per call. The values go into the model's context, so an unbounded
 * read of a big sheet would be slow, costly and could overflow it.
 */
export const READ_RANGE_MAX_CELLS = 2000;

type CellValue = string | number | boolean;

async function readCells(address: string) {
  return Excel.run(async (context) => {
    const { sheet, range } = getRange(context, address);
    /*
     * Cells outside the used range are empty, so cutting to it loses nothing,
     * and turns e.g. `C:C` (a million rows) into the rows that have data.
     */
    const used = range.getIntersectionOrNullObject(sheet.getUsedRange(true));
    used.load("rowCount,columnCount");
    await context.sync();

    if (used.isNullObject) {
      return { address, empty: true as const };
    }

    // Over the limit, keep the first rows that fit
    const columns = Math.min(used.columnCount, READ_RANGE_MAX_CELLS);
    const rows = Math.min(used.rowCount, Math.max(1, Math.floor(READ_RANGE_MAX_CELLS / columns)));
    const truncated = rows < used.rowCount || columns < used.columnCount;
    const read = truncated ? used.getCell(0, 0).getResizedRange(rows - 1, columns - 1) : used;
    read.load("address,values,formulas");
    await context.sync();

    const values = read.values as CellValue[][];
    // Formulas only where there is one, so plain data isn't sent twice
    const hasFormulas = read.formulas.some((row) =>
      row.some((cell) => typeof cell === "string" && cell.startsWith("=")),
    );

    return {
      address: read.address,
      values,
      ...(hasFormulas && {
        formulas: read.formulas.map((row) =>
          row.map((cell) => (typeof cell === "string" && cell.startsWith("=") ? cell : null)),
        ),
      }),
      ...(truncated && {
        truncated: {
          totalRows: used.rowCount,
          totalColumns: used.columnCount,
        },
      }),
    };
  });
}

export const readRange = tool({
  description:
    "Read the values of a range of cells, and their formulas where they have one. " +
    "Dates are Excel serial numbers (days since 1900-01-01). " +
    `Returns at most ${READ_RANGE_MAX_CELLS} cells, cut to the used range: ` +
    "when `truncated` is set, read the rest in further calls or work from a sample.",
  inputSchema: z.object({
    address: z
      .string()
      .describe(
        'A1-style address, with the sheet unless it is the active one, e.g. "Sales!A1:F50", ' +
          `"'Q1 Data'!B:B" or "A1:C10".`,
      ),
  }),
  execute: ({ address }) => readCells(address),
});
