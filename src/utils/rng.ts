export class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(): number {
    return this.next();
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }

  getSeed(): number {
    return this.seed;
  }
}

// Global RNG instance
export const gameRNG = new SeededRNG(Date.now());
