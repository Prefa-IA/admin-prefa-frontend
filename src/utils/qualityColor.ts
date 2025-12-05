export function qualityColor(count?: number): string {
  if (count === undefined) return 'bg-gray-400';
  if (count === 0) return 'bg-red-500';
  if (count < 50) return 'bg-yellow-500';
  return 'bg-green-500';
}
