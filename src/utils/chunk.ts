export function chunk<T>(array: T[], size: number): T[][] {
  const totalChunks = Math.ceil(array.length / size);
  return Array.from({ length: totalChunks }, (_, chunkIndex) =>
    array.slice(chunkIndex * size, (chunkIndex + 1) * size)
  );
}
