// Hanzi practice sheet PDF generator (browser-only).
// Requires: HanziWriter (global) and jsPDF (window.jspdf.jsPDF).

const DEFAULTS = {
  pageSize: "letter",
  orientation: "portrait",
  unit: "mm",
  marginMm: 20,
  diagramSizeMm: 48,
  practiceRows: 5,
  practiceCols: 4,
  gridLineColor: [180, 180, 180],
  gridThinColor: [210, 210, 210],
  strokeColor: "#bdbdbd",
  arrowColor: "#2b2b2b",
  numberFill: "rgba(255,255,255,0.8)",
  numberStroke: "#9a9a9a",
  numberText: "#4a4a4a",
  diagramPx: 720
};

const CJK_FONT = {
  url: "/assets/fonts/NotoSansSC-Regular.ttf",
  vfsName: "NotoSansSC-Regular.ttf",
  fontName: "NotoSansSC"
};

let cjkFontBase64Promise = null;

function getJsPDF() {
  const api = window.jspdf && window.jspdf.jsPDF;
  if (!api) {
    throw new Error(
      "jsPDF not found. Include jsPDF and call generateHanziPracticePdf from the browser."
    );
  }
  return api;
}

function getHanziWriter() {
  if (!window.HanziWriter) {
    throw new Error(
      "HanziWriter not found. Include HanziWriter before generating the PDF."
    );
  }
  return window.HanziWriter;
}

function getPronunciationLine(char) {
  const parts = [];
  if (window.pinyinPro && typeof window.pinyinPro.pinyin === "function") {
    const pinyinText = window.pinyinPro.pinyin(char);
    if (pinyinText) parts.push(`Pinyin: ${pinyinText}`);
  }
  if (window.ToJyutping && typeof window.ToJyutping.getJyutpingText === "function") {
    const jyutpingText = window.ToJyutping.getJyutpingText(char);
    if (jyutpingText) parts.push(`Jyutping: ${jyutpingText}`);
  }
  return parts.join("   ");
}

async function loadFontBase64(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load font: " + url);
  }
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 1024) {
    throw new Error("Font file too small: " + url);
  }
  const header = new Uint8Array(buf.slice(0, 4));
  const signature = String.fromCharCode.apply(null, header);
  if (signature !== "\u0000\u0001\u0000\u0000" && signature !== "OTTO") {
    throw new Error("Font file is not TTF/OTF: " + url);
  }
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

async function ensureCjkFont(doc) {
  const list = doc.getFontList ? doc.getFontList() : {};
  if (list[CJK_FONT.fontName]) {
    doc.setFont(CJK_FONT.fontName, "normal");
    return;
  }
  if (!cjkFontBase64Promise) {
    cjkFontBase64Promise = loadFontBase64(CJK_FONT.url);
  }
  let base64;
  try {
    base64 = await cjkFontBase64Promise;
  } catch (err) {
    cjkFontBase64Promise = null;
    throw err;
  }
  doc.addFileToVFS(CJK_FONT.vfsName, base64);
  doc.addFont(CJK_FONT.vfsName, CJK_FONT.fontName, "normal");
  doc.setFont(CJK_FONT.fontName, "normal");
}

function coerceCharacters(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    return input.split("").filter((c) => c.trim().length > 0);
  }
  return [];
}

function mmToPx(mm, dpi = 96) {
  return Math.round((mm / 25.4) * dpi);
}

function ensureSvgEl(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function createArrowPath(x1, y1, x2, y2, size) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tipX = x2;
  const tipY = y2;
  const backX = x2 - Math.cos(angle) * size * 1.1;
  const backY = y2 - Math.sin(angle) * size * 1.1;
  const perpAngle = angle + Math.PI / 2;
  const halfWidth = size * 0.7;
  const leftX = backX + Math.cos(perpAngle) * halfWidth;
  const leftY = backY + Math.sin(perpAngle) * halfWidth;
  const rightX = backX - Math.cos(perpAngle) * halfWidth;
  const rightY = backY - Math.sin(perpAngle) * halfWidth;
  return `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY} Z`;
}

function shortenMedian(points, amount) {
  if (!points || points.length < 2) return points;
  const trimmed = points.slice();
  const last = trimmed[trimmed.length - 1];
  const prev = trimmed[trimmed.length - 2];
  const dx = last[0] - prev[0];
  const dy = last[1] - prev[1];
  const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const trim = Math.min(amount, dist - 1);
  const nx = dx / dist;
  const ny = dy / dist;
  trimmed[trimmed.length - 1] = [last[0] - nx * trim, last[1] - ny * trim];
  return trimmed;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveNumberPositions(points, radius, bounds) {
  const padding = 4;
  const iterations = 18;
  const spring = 0.15;
  const result = points.map((pt) => ({ ...pt, x: pt.x, y: pt.y }));

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let i = 0; i < result.length; i += 1) {
      const a = result[i];
      if (!a) continue;
      for (let j = i + 1; j < result.length; j += 1) {
        const b = result[j];
        if (!b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minDist = radius * 2 + padding;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }

    for (let i = 0; i < result.length; i += 1) {
      const p = result[i];
      if (!p) continue;
      p.x += (p.anchorX - p.x) * spring;
      p.y += (p.anchorY - p.y) * spring;
      p.x = clamp(p.x, bounds.minX + radius, bounds.maxX - radius);
      p.y = clamp(p.y, bounds.minY + radius, bounds.maxY - radius);
    }
  }

  return result;
}

function buildStrokeDiagramSvg(charData, opts) {
  const svg = ensureSvgEl("svg");
  const viewBoxMinX = 0;
  const viewBoxMinY = -124;
  const viewBoxMaxX = 1024;
  const viewBoxMaxY = 900;
  const viewBox = `${viewBoxMinX} ${viewBoxMinY} 1024 1024`;
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("width", opts.diagramPx);
  svg.setAttribute("height", opts.diagramPx);

  const flipYOffset = 776; // viewBox minY + maxY: -124 + 900
  const flipGroup = ensureSvgEl("g");
  flipGroup.setAttribute("transform", `translate(0 ${flipYOffset}) scale(1 -1)`);

  const pathsGroup = ensureSvgEl("g");
  const mediansGroup = ensureSvgEl("g");
  const numbersGroup = ensureSvgEl("g");

  const strokeWidth = 40;
  const medianWidth = 12;
  const arrowSize = 34;
  const numberRadius = 44;
  const numberStroke = 8;
  const numberFont = 72;
  const numberClampMin = viewBoxMinY + numberRadius;
  const numberClampMax = viewBoxMaxY - numberRadius;

  const numberAnchors = [];
  charData.strokes.forEach((pathD, idx) => {
    const path = ensureSvgEl("path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", opts.strokeColor);
    path.setAttribute("stroke", "none");
    pathsGroup.appendChild(path);

    const median = charData.medians[idx];
    if (opts.showMedians !== false && median && median.length > 1) {
      const medianForLine = shortenMedian(median, arrowSize * 1.1);
      const points = medianForLine.map((p) => p.join(",")).join(" ");
      const poly = ensureSvgEl("polyline");
      poly.setAttribute("points", points);
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", opts.arrowColor);
      poly.setAttribute("stroke-width", medianWidth.toString());
      poly.setAttribute("stroke-linecap", "round");
      poly.setAttribute("stroke-linejoin", "round");
      mediansGroup.appendChild(poly);

      const last = median[median.length - 1];
      const prev = median[median.length - 2];
      const arrow = ensureSvgEl("path");
      arrow.setAttribute(
        "d",
        createArrowPath(prev[0], prev[1], last[0], last[1], arrowSize)
      );
      arrow.setAttribute("fill", opts.arrowColor);
      arrow.setAttribute("stroke", "none");
      mediansGroup.appendChild(arrow);

      if (opts.showNumbers !== false) {
        const start = median[0];
        const numberX = start[0];
        let numberY = flipYOffset - start[1];
        if (numberY < numberClampMin) numberY = numberClampMin;
        if (numberY > numberClampMax) numberY = numberClampMax;
        numberAnchors.push({
          stroke: idx + 1,
          x: numberX,
          y: numberY,
          anchorX: numberX,
          anchorY: numberY
        });
      }
    }
  });

  flipGroup.appendChild(pathsGroup);
  flipGroup.appendChild(mediansGroup);
  svg.appendChild(flipGroup);
  if (opts.showNumbers !== false && numberAnchors.length) {
    const resolved = resolveNumberPositions(numberAnchors, numberRadius, {
      minX: viewBoxMinX,
      maxX: viewBoxMaxX,
      minY: viewBoxMinY,
      maxY: viewBoxMaxY
    });
    resolved.forEach((pos) => {
      const rect = ensureSvgEl("rect");
      const rectHeight = numberRadius * 1.7;
      const rectWidth = rectHeight * 1.2;
      rect.setAttribute("x", (pos.x - rectWidth / 2).toString());
      rect.setAttribute("y", (pos.y - rectHeight / 2).toString());
      rect.setAttribute("width", rectWidth.toString());
      rect.setAttribute("height", rectHeight.toString());
      rect.setAttribute("rx", "1");
      rect.setAttribute("ry", "1");
      rect.setAttribute("fill", opts.numberFill);
      rect.setAttribute("stroke", opts.numberStroke);
      rect.setAttribute("stroke-width", "2");
      numbersGroup.appendChild(rect);

      const text = ensureSvgEl("text");
      text.setAttribute("x", pos.x.toString());
      text.setAttribute("y", pos.y.toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("alignment-baseline", "middle");
      text.setAttribute("dy", "6");
      text.setAttribute("font-size", numberFont.toString());
      text.setAttribute("font-family", "Helvetica, Arial, sans-serif");
      text.setAttribute("fill", opts.numberText);
      text.textContent = String(pos.stroke);
      numbersGroup.appendChild(text);
    });
    svg.appendChild(numbersGroup);
  }
  return svg;
}

async function svgToPngDataUrl(svg, sizePx) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    const loaded = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
    });
    img.src = url;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, sizePx, sizePx);
    ctx.drawImage(img, 0, 0, sizePx, sizePx);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function renderSvgToPdf(doc, svg, x, y, width, height) {
  if (typeof doc.svg === "function") {
    await doc.svg(svg, { x, y, width, height });
    return;
  }
  const dataUrl = await svgToPngDataUrl(svg, DEFAULTS.diagramPx);
  doc.addImage(dataUrl, "PNG", x, y, width, height);
}

function drawPracticeGrid(doc, x, y, width, height, rows, cols, opts) {
  const boxSize = Math.min(width / cols, height / rows);
  const gridWidth = boxSize * cols;
  const gridHeight = boxSize * rows;
  const startX = x + (width - gridWidth) / 2;
  const startY = y + (height - gridHeight) / 2;

  doc.setDrawColor(...opts.gridLineColor);
  doc.setLineWidth(0.35);

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const bx = startX + c * boxSize;
      const by = startY + r * boxSize;
      doc.rect(bx, by, boxSize, boxSize);

      doc.setDrawColor(...opts.gridThinColor);
      doc.setLineWidth(0.2);
      doc.line(bx + boxSize / 2, by, bx + boxSize / 2, by + boxSize);
      doc.line(bx, by + boxSize / 2, bx + boxSize, by + boxSize / 2);
      doc.line(bx, by, bx + boxSize, by + boxSize);
      doc.line(bx + boxSize, by, bx, by + boxSize);

      doc.setDrawColor(...opts.gridLineColor);
      doc.setLineWidth(0.35);
    }
  }

  return { boxSize, startX, startY };
}

export async function generateHanziPracticePdf(options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const characters = coerceCharacters(opts.characters || opts.character);
  if (characters.length === 0) {
    throw new Error("No characters provided for PDF generation.");
  }

  const JsPDF = getJsPDF();
  const HanziWriter = getHanziWriter();
  const doc = new JsPDF({
    unit: opts.unit,
    format: opts.pageSize,
    orientation: opts.orientation
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < characters.length; i += 1) {
    const char = characters[i];
    if (i > 0) doc.addPage();

    const charData = await HanziWriter.loadCharacterData(char);
    const diagramY = opts.marginMm;
    const diagramSize = opts.diagramSizeMm;
    const diagramX = (pageWidth - diagramSize) / 2;
    const diagramSvg = buildStrokeDiagramSvg(charData, opts);
    await renderSvgToPdf(doc, diagramSvg, diagramX, diagramY, diagramSize, diagramSize);

    // Hanzi Guide logo (top right)
    const logoText = "Hanzi Guide";
    const logoPaddingX = 0;
    const logoPaddingY = 4;
    const helperLine1 = 'Looking for interactive practice?';
    const helperLine2 = 'Go to www.hanzi.guide';
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const helperWidth = Math.max(
      doc.getTextWidth(helperLine1),
      doc.getTextWidth(helperLine2)
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const logoTextWidth = doc.getTextWidth(logoText);
    const logoBoxWidth = logoTextWidth;
    const logoBoxHeight = 8;
    const logoWidth = helperWidth;
    const logoX = pageWidth - opts.marginMm - logoWidth;
    const logoY = opts.marginMm;
    doc.setFillColor(34, 34, 34);
    doc.rect(logoX, logoY, logoWidth, logoBoxHeight, "F");
    doc.setTextColor(255, 255, 255);
    const logoTextX = logoX + (logoWidth - logoTextWidth) / 2;
    doc.text(logoText, logoTextX, logoY + logoBoxHeight - 2);

    await ensureCjkFont(doc);
    const heading = `Practice Sheet for ${char}`;
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    const headingX = opts.marginMm;
    const headingY = opts.marginMm + 6;
    doc.text(heading, headingX, headingY);
    const underlineWidth = doc.getTextWidth(heading);
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.5);
    doc.line(headingX, headingY + 2, headingX + underlineWidth, headingY + 2);

    const pronunciationLine = getPronunciationLine(char);
    if (pronunciationLine) {
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(pronunciationLine, headingX, headingY + 7);
    }

    const gridTop = diagramY + diagramSize + 2;
    const gridLeft = opts.marginMm;
    const gridWidth = pageWidth - opts.marginMm * 2;
    const gridHeight = pageHeight - gridTop - opts.marginMm;

    const gridLayout = drawPracticeGrid(
      doc,
      gridLeft,
      gridTop,
      gridWidth,
      gridHeight,
      opts.practiceRows,
      opts.practiceCols,
      opts
    );

    // First row hints (light gray)
    const hintSvg = buildStrokeDiagramSvg(charData, {
      ...opts,
      showMedians: false,
      showNumbers: false,
      strokeColor: "#d6d6d6"
    });
    const hintPadding = 2;
    for (let col = 0; col < opts.practiceCols; col += 1) {
      const boxX = gridLayout.startX + col * gridLayout.boxSize;
      const boxY = gridLayout.startY;
      const size = gridLayout.boxSize - hintPadding * 2;
      await renderSvgToPdf(
        doc,
        hintSvg,
        boxX + hintPadding,
        boxY + hintPadding,
        size,
        size
      );
    }

    // Top-right helper link under logo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    const helperX = pageWidth - opts.marginMm - helperWidth;
    const helperY = opts.marginMm + 11;
    doc.text(helperLine1, helperX, helperY);
    doc.textWithLink(helperLine2, helperX, helperY + 4, {
      url: `https://hanzi.guide/#${encodeURIComponent(char)}`
    });
  }

  return doc;
}

export async function saveHanziPracticePdf(options = {}, filename = "practice.pdf") {
  const doc = await generateHanziPracticePdf(options);
  const rawChars = coerceCharacters(options.characters || options.character).join('');
  const suffix = rawChars ? '-' + rawChars : '';
  const finalName = filename.replace(/\.pdf$/i, '') + suffix + '.pdf';
  doc.save(finalName);
  return doc;
}
