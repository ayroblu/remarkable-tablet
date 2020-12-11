export function printToConsole(message: string) {
  // clearLine necessary if the line length decreases
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(message);
}

export function bufferedGet(buffer: Buffer, idx: number) {
  const result = buffer[idx];
  if (result === undefined || result === null) 
    throw new Error(`index ${idx} not found in buffer`);
  
  return result;
}

export const chunkBuffer = (
  buffer: Buffer,
  chunkSize = 1,
  cache: Buffer[] = []
): Buffer[] => {
  if (chunkSize <= 0) return cache;
  for (let i = 0; i < buffer.length; i += chunkSize) 
    cache.push(buffer.slice(i, i + chunkSize));
  
  return cache;
};
