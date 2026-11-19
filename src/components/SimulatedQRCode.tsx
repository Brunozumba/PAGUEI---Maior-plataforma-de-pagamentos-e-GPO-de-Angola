import { useMemo } from 'react';

interface SimulatedQRCodeProps {
  value: string;
  size?: number;
  label?: string;
}

/**
 * Deterministic 25x25 QR-style SVG matrix with authentic 7x7 finder patterns,
 * timing lines, and a central PAGUEI! mark. Designed for high-contrast display
 * in both light and dark themes.
 */
export function SimulatedQRCode({
  value,
  size = 188,
  label = 'Código QR PAGUEI!',
}: SimulatedQRCodeProps) {
  const modules = useMemo(() => {
    const gridSize = 25;
    const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
      Array<boolean>(gridSize).fill(false),
    );
    const reserved: boolean[][] = Array.from({ length: gridSize }, () =>
      Array<boolean>(gridSize).fill(false),
    );

    const drawFinder = (startR: number, startC: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = startR + r;
          const cc = startC + c;
          if (rr < 0 || rr >= gridSize || cc < 0 || cc >= gridSize) continue;
          reserved[rr][cc] = true;
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[rr][cc] = false;
          } else {
            const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
            const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[rr][cc] = isOuter || isInner;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, gridSize - 7);
    drawFinder(gridSize - 7, 0);

    // Timing patterns
    for (let i = 8; i < gridSize - 8; i++) {
      reserved[6][i] = true;
      reserved[i][6] = true;
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Small 5x5 alignment pattern near bottom-right (16, 16)
    for (let r = 16; r <= 20; r++) {
      for (let c = 16; c <= 20; c++) {
        reserved[r][c] = true;
        const dr = r - 16;
        const dc = c - 16;
        matrix[r][c] =
          dr === 0 || dr === 4 || dc === 0 || dc === 4 || (dr === 2 && dc === 2);
      }
    }

    // Reserve clean 5x5 central badge area (10..14)
    for (let r = 10; r <= 14; r++) {
      for (let c = 10; c <= 14; c++) {
        reserved[r][c] = true;
        matrix[r][c] = false;
      }
    }

    // FNV-1a style seed from value
    let seed = 2166136261;
    for (let i = 0; i < value.length; i++) {
      seed ^= value.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (reserved[r][c]) continue;
        seed ^= (r * 31 + c * 17 + 13) | 0;
        seed = Math.imul(seed, 1664525) + 1013904223;
        matrix[r][c] = ((seed >>> 16) & 0xff) > 118;
      }
    }

    return matrix;
  }, [value]);

  const gridSize = modules.length;
  const padding = 2;
  const viewBoxSize = gridSize + padding * 2;

  return (
    <div
      className="inline-flex flex-col items-center justify-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs"
      role="img"
      aria-label={label}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        shapeRendering="crispEdges"
        className="block"
      >
        <rect x="0" y="0" width={viewBoxSize} height={viewBoxSize} fill="#FFFFFF" />
        {modules.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c + padding}
                y={r + padding}
                width={1}
                height={1}
                fill="#091936"
              />
            ) : null,
          ),
        )}
        {/* Centered PAGUEI! Emerald Badge */}
        <rect
          x={10 + padding}
          y={10 + padding}
          width={5}
          height={5}
          rx={1.1}
          fill="#102A56"
        />
        <text
          x={12.5 + padding}
          y={13.55 + padding}
          textAnchor="middle"
          fill="#16B981"
          fontSize="3.2"
          fontWeight="800"
          fontFamily="sans-serif"
        >
          P!
        </text>
      </svg>
    </div>
  );
}
