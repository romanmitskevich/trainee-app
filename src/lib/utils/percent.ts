export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function getRatio(part: number, total: number): number {
  return total > 0 ? part / total : 0;
}
