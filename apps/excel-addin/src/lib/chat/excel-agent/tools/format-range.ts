import { tool } from "ai";
import { z } from "zod";
import { getRange, revealRange } from "../excel";

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .describe('Hex color, e.g. "#1F4E78".');

const inputSchema = z.object({
  address: z
    .string()
    .describe('A1-style address, with the sheet unless it is the active one, e.g. "Sales!B2:B40".'),
  numberFormat: z
    .string()
    .optional()
    .describe(
      'Excel number format code, e.g. "#,##0.00", "0.0%", "yyyy-mm-dd", "$#,##0" or "@" for text.',
    ),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  fontColor: colorSchema.optional(),
  /** `null` removes the fill. */
  fillColor: colorSchema
    .nullable()
    .optional()
    .describe('Hex color, e.g. "#DDEBF7", or null to remove the fill.'),
  horizontalAlignment: z.enum(["Left", "Center", "Right"]).optional(),
  wrapText: z.boolean().optional(),
  autofitColumns: z.boolean().optional().describe("Resize the columns to fit their contents."),
});

type FormatRangeInput = z.infer<typeof inputSchema>;

async function formatCells({
  address,
  numberFormat,
  bold,
  italic,
  fontColor,
  fillColor,
  horizontalAlignment,
  wrapText,
  autofitColumns,
}: FormatRangeInput) {
  return Excel.run(async (context) => {
    const { sheet, range } = getRange(context, address);
    const { format } = range;

    // Only what the model asked for changes: `undefined` means "leave as is"
    if (numberFormat !== undefined) {
      // Office.js applies a single value to every cell, though its types only describe 2D arrays
      range.numberFormat = numberFormat as unknown as string[][];
    }
    if (bold !== undefined) format.font.bold = bold;
    if (italic !== undefined) format.font.italic = italic;
    if (fontColor !== undefined) format.font.color = fontColor;
    if (fillColor === null) format.fill.clear();
    else if (fillColor !== undefined) format.fill.color = fillColor;
    if (horizontalAlignment !== undefined) {
      format.horizontalAlignment = horizontalAlignment;
    }
    if (wrapText !== undefined) format.wrapText = wrapText;
    if (autofitColumns) format.autofitColumns();

    revealRange(sheet, range);
    range.load("address");
    await context.sync();
    return { address: range.address };
  });
}

export const formatRange = tool({
  description:
    "Format cells: number format, bold, italic, font and fill colors, alignment, wrapping, " +
    "and fitting column widths. Only the options you pass change.",
  inputSchema,
  execute: formatCells,
});
