export const number = (value: number, decimals = 0) =>
  new Intl.NumberFormat("nl-NL", { maximumFractionDigits: decimals }).format(
    value,
  );
export const weight = (grams: number) =>
  grams >= 1000 ? `${number(grams / 1000, 2)} kg` : `${number(grams, 1)} g`;
export function downloadText(
  text: string,
  filename: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
