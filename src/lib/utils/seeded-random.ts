export function createSeededRandom(seed: number) {
  let state = seed;

  function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  }

  return {
    next,

    integer(min: number, max: number): number {
      return min + Math.floor(next() * (max - min + 1));
    },

    chance(probability: number): boolean {
      return next() < probability;
    },

    pick<T>(items: readonly T[]): T {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error('Нельзя выбрать элемент из пустого списка');
      return item;
    },
  };
}

export type SeededRandom = ReturnType<typeof createSeededRandom>;
