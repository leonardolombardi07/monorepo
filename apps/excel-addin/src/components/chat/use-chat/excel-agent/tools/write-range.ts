import { tool } from "ai";
import { z } from "zod";
import { getRange, revealRange } from "../excel";

/** Cells per call: the model writes them all out, so big writes are slow and error-prone. */
export const WRITE_RANGE_MAX_CELLS = 2000;

/** Formula errors reported back per call; the first few are enough to fix the cause. */
const MAX_REPORTED_ERRORS = 20;

const inputSchema = z.object({
  startCell: z
    .string()
    .describe(
      'Top-left cell to write from, with the sheet unless it is the active one, e.g. "Sales!B2".',
    ),
  rows: z
    .array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])))
    .min(1)
    .describe(
      "Rows of cells, written right and down from startCell. " +
        'A string starting with "=" is a formula, with English function names and commas, e.g. "=SUM(B2:B10)". ' +
        "null leaves that cell as it is.",
    ),
});

export type WriteRangeInput = z.infer<typeof inputSchema>;

type Cell = WriteRangeInput["rows"][number][number];

/** Pads short rows with `null` (unchanged cells), as Excel needs a rectangle. */
function toGrid(rows: Cell[][]) {
  const width = Math.max(1, ...rows.map((row) => row.length));
  const grid = rows.map((row) => [...row, ...Array<Cell>(width - row.length).fill(null)]);
  return { grid, width };
}

/** The range the rows cover, from `startCell`. */
function getTargetRange(context: Excel.RequestContext, { startCell, rows }: WriteRangeInput) {
  const { grid, width } = toGrid(rows);
  const { sheet, range } = getRange(context, startCell);
  const target = range.getCell(0, 0).getResizedRange(grid.length - 1, width - 1);
  return { sheet, target, grid };
}

/**
 * How many cells that already have data the write would change. Used to ask
 * the user first in Auto mode (see `../approval.ts`).
 */
export async function countOverwrittenCells(input: WriteRangeInput) {
  return Excel.run(async (context) => {
    const { target, grid } = getTargetRange(context, input);
    target.load("address,values");
    await context.sync();

    const count = grid.flatMap((row, r) =>
      row.filter((cell, c) => cell !== null && target.values[r]?.[c] !== ""),
    ).length;
    return { count, address: target.address };
  });
}

async function writeCells(input: WriteRangeInput) {
  const cellCount = input.rows.flat().length;
  if (cellCount > WRITE_RANGE_MAX_CELLS) {
    // Thrown errors go back to the model as the tool's result, so it can split the write
    throw new Error(
      `Too many cells (${cellCount}): write at most ${WRITE_RANGE_MAX_CELLS} per call.`,
    );
  }

  return Excel.run(async (context) => {
    const { sheet, target, grid } = getTargetRange(context, input);
    /*
     * `formulas` takes plain values too: "=..." becomes a formula, anything
     * else is entered as if typed. `null` leaves the cell unchanged.
     */
    target.formulas = grid;
    revealRange(sheet, target);
    // Read back what Excel calculated, to catch formulas that don't work
    target.load("address,values,valueTypes");
    await context.sync();

    const errorCells = target.valueTypes
      .flatMap((row, r) =>
        row.map((type, c) => (type === Excel.RangeValueType.error ? { r, c } : null)),
      )
      .filter((cell) => cell !== null)
      .slice(0, MAX_REPORTED_ERRORS);

    // A second round trip only when there are errors to locate
    const errors = errorCells.map(({ r, c }) => {
      const cell = target.getCell(r, c);
      cell.load("address");
      return { cell, value: String(target.values[r]?.[c]) };
    });
    if (errors.length > 0) await context.sync();

    return {
      address: target.address,
      cellsWritten: grid.flat().filter((cell) => cell !== null).length,
      ...(errors.length > 0 && {
        errors: errors.map(({ cell, value }) => ({
          cell: cell.address,
          value,
        })),
      }),
    };
  });
}

export const writeRange = tool({
  description:
    "Write values and formulas into cells, starting at startCell. " +
    `At most ${WRITE_RANGE_MAX_CELLS} cells per call. ` +
    "Returns the address written and, when formulas evaluate to errors like #REF! or #NAME?, " +
    "the cells with errors: fix them before you finish.",
  inputSchema,
  execute: writeCells,
});
