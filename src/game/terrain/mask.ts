export interface TerrainSpan {
  x: number;
  y: number;
  width: number;
}

/** Talajhoz kötött terep bitmaszkja; külön lebegő objektumok nem ebben a maszkban élnek. */
export class TerrainMask {
  private data: Uint8Array;
  private connected: Uint8Array | null = null;
  private queue: Uint32Array | null = null;

  private constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8Array(width * height);
  }

  /** A magasságtérkép alatti rész lesz szilárd. */
  static fromHeightmap(heightmap: ArrayLike<number>, height: number): TerrainMask {
    const mask = new TerrainMask(heightmap.length, height);
    for (let x = 0; x < mask.width; x++) {
      for (let y = Math.max(0, Math.floor(heightmap[x]!)); y < height; y++) mask.data[y * mask.width + x] = 1;
    }
    return mask;
  }

  isSolid(x: number, y: number): boolean {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    if (xi < 0 || xi >= this.width || yi < 0 || yi >= this.height) return false;
    return this.data[yi * this.width + xi] === 1;
  }

  /** Az oszlop legfelső szilárd pixelének y-ja, vagy `height`, ha nincs. */
  surfaceY(x: number): number {
    const xi = Math.floor(x);
    if (xi < 0 || xi >= this.width) return this.height;
    for (let y = 0; y < this.height; y++) if (this.data[y * this.width + xi] === 1) return y;
    return this.height;
  }

  carveCircle(cx: number, cy: number, r: number): void {
    const r2 = r * r;
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + r));
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) this.data[y * this.width + x] = 0;
      }
    }
  }

  /** Az alsó pályaszélhez négy szomszédon keresztül nem kapcsolódó talaj törlése, soronkénti szakaszokkal. */
  removeDetachedGround(): TerrainSpan[] {
    const { width, height, data } = this;
    if (!width || !height) return [];
    const connected = (this.connected ??= new Uint8Array(data.length));
    const queue = (this.queue ??= new Uint32Array(data.length));
    connected.fill(0);
    let head = 0;
    let tail = 0;
    const visit = (index: number) => {
      if (data[index] === 1 && connected[index] === 0) {
        connected[index] = 1;
        queue[tail++] = index;
      }
    };
    for (let x = 0; x < width; x++) visit((height - 1) * width + x);
    while (head < tail) {
      const index = queue[head++]!;
      const x = index % width;
      if (x > 0) visit(index - 1);
      if (x < width - 1) visit(index + 1);
      if (index >= width) visit(index - width);
      if (index < data.length - width) visit(index + width);
    }

    const removed: TerrainSpan[] = [];
    for (let y = 0; y < height; y++) {
      let start = -1;
      for (let x = 0; x <= width; x++) {
        const index = y * width + x;
        if (x < width && data[index] === 1 && connected[index] === 0) {
          data[index] = 0;
          if (start < 0) start = x;
        } else if (start >= 0) {
          removed.push({ x: start, y, width: x - start });
          start = -1;
        }
      }
    }
    return removed;
  }
}
