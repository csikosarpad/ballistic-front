/** Bitmaszk a terep ütközéséhez; a vizuális RenderTexture-rel párhuzamosan kopik. */
export class TerrainMask {
  private data: Uint8Array;

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
}
