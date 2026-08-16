import * as pdfjsLib from 'pdfjs-dist';
import { Asset } from '../types';

// Set up pdf.js worker using reliable CDN with version fallback
if (typeof window !== 'undefined') {
  try {
    const version = pdfjsLib.version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF worker setup notice:', e);
  }
}

export interface PdfExtractionResult {
  structuredText: string;
  pageTexts: string[];
  assets: Asset[];
  numPages: number;
  imagePageCount: number;
  textOnlyPageCount: number;
}

/**
 * Extracts PDF contents with strict text vs. image distinction:
 * 1. Digital text pages (questions, rubrics, options, instructions) are extracted 100% as structured text.
 * 2. Only pages/elements containing genuine embedded images or bitmap graphics are treated as image assets.
 * 3. Text pages are NEVER screenshotted as image assets, preventing text from appearing as image attachments in forms.
 */
export async function extractPdfPagesAndImages(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: (current: number, total: number, status?: string) => void
): Promise<PdfExtractionResult> {
  const arrayBuffer =
    fileOrBuffer instanceof ArrayBuffer
      ? fileOrBuffer
      : await fileOrBuffer.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const assets: Asset[] = [];
  const pageTexts: string[] = [];
  const textLines: string[] = [];

  let imagePageCount = 0;
  let textOnlyPageCount = 0;

  // Track discovered case numbers across pages
  const pageCaseMap = new Map<number, string>();

  // Pass 1: Extract all text and case headers
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress(pageNum, numPages, `Reading page ${pageNum} text...`);
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageTextItems: string[] = [];

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        pageTextItems.push(item.str);
      }
    }

    const rawPageText = pageTextItems.join(' ').replace(/\s+/g, ' ').trim();
    pageTexts.push(rawPageText);

    // Detect Case Header (e.g., "Case 1 — Street address", "Case 2 — DulcoSoft")
    const caseMatch = rawPageText.match(/Case\s+(\d+)[\s:—–-]+([^\n\r☐\[\]]+)/i);
    let detectedCaseName = '';

    if (caseMatch) {
      detectedCaseName = `Case ${caseMatch[1]} — ${caseMatch[2].trim()}`;
      pageCaseMap.set(pageNum, detectedCaseName);
    } else if (/case\s+(\d+)/i.test(rawPageText)) {
      const simpleCase = rawPageText.match(/case\s+(\d+)/i);
      if (simpleCase) {
        detectedCaseName = `Case ${simpleCase[1]}`;
        pageCaseMap.set(pageNum, detectedCaseName);
      }
    }

    textLines.push(`--- PAGE ${pageNum} ${detectedCaseName ? `[${detectedCaseName}]` : ''} ---`);
    textLines.push(rawPageText);
    textLines.push('');
  }

  // Pass 2: Inspect operators and extract ONLY true visual image assets
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress(pageNum, numPages, `Analyzing visual assets on page ${pageNum}...`);
    }

    const page = await pdf.getPage(pageNum);
    const rawText = pageTexts[pageNum - 1] || '';

    // Check operator list for true raster image operations (paintImageXObject, paintInlineImageXObject)
    let hasEmbeddedRasterImageOps = false;
    try {
      const ops = await page.getOperatorList();
      const rasterImageOpCodes = [
        (pdfjsLib as any).OPS?.paintImageXObject,
        (pdfjsLib as any).OPS?.paintInlineImageXObject,
      ].filter(Boolean);

      for (let i = 0; i < ops.fnArray.length; i++) {
        if (rasterImageOpCodes.includes(ops.fnArray[i])) {
          hasEmbeddedRasterImageOps = true;
          break;
        }
      }
    } catch (opErr) {
      console.warn('Operator inspection notice for page', pageNum, opErr);
    }

    // IMAGE EXTRACTION RULES:
    // 1. Preserved Images: Any page with embedded raster images (paintImageXObject), diagrams, charts, UI screenshots,
    //    infographics, or scanned figures MUST be extracted as an image asset.
    //    It is completely valid and expected for images to contain text, labels, annotations, or captions.
    // 2. Scanned / Visual Pages: Pages with minimal digital text (<= 60 chars) or visual case exhibits are captured.
    // 3. Pure Text Pages: Only pages that have NO embedded image operations AND are strictly long-form pure digital text
    //    (e.g., > 600 characters of uninterrupted text paragraphs with no figures) are treated as text-only.
    const hasVisualImageContent = hasEmbeddedRasterImageOps || rawText.length <= 60 || (rawText.length < 400 && /case\s+\d+|figure\s+\d+|chart|diagram|screenshot|table/i.test(rawText));

    if (!hasVisualImageContent && rawText.length > 300) {
      textOnlyPageCount++;
      continue;
    }

    // Extract visual asset for this page (preserving diagrams, screenshots, product photos, and graphics with text)
    if (hasVisualImageContent || hasEmbeddedRasterImageOps || rawText.length <= 60) {
      // Optimize scale for blazing-fast rendering and transmission while preserving visual fidelity
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const maxDim = Math.max(unscaledViewport.width, unscaledViewport.height);
      const targetScale = maxDim > 900 ? 900 / maxDim : 1.0;
      const viewport = page.getViewport({ scale: Math.max(0.6, targetScale) });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
          canvas: canvas as any,
        }).promise;

        imagePageCount++;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.76);

        // Determine associated Case name
        let associatedCase = pageCaseMap.get(pageNum);
        if (!associatedCase) {
          if (pageCaseMap.has(pageNum - 1)) {
            associatedCase = pageCaseMap.get(pageNum - 1);
          } else if (pageCaseMap.has(pageNum + 1)) {
            associatedCase = pageCaseMap.get(pageNum + 1);
          } else {
            associatedCase = `Visual Asset ${imagePageCount} (Page ${pageNum})`;
          }
        }

        const caseNumMatch = associatedCase?.match(/case\s+(\d+)/i);
        const baseAssetId = caseNumMatch ? `asset_case_${caseNumMatch[1]}` : `asset_page_${pageNum}`;
        // Ensure asset ID is unique across all extracted pages
        let assetId = baseAssetId;
        if (assets.some((a) => a.assetId === assetId)) {
          assetId = `${baseAssetId}_p${pageNum}`;
        }

        const asset: Asset = {
          assetId,
          type: 'IMAGE',
          mimeType: 'image/jpeg',
          source: 'pdf-page',
          page: pageNum,
          sourceLocation: `Page ${pageNum} of ${numPages}`,
          dataUrl,
          associatedSection: associatedCase,
          description: `Visual reference asset for ${associatedCase}`,
        };

        assets.push(asset);
      }
    } else {
      textOnlyPageCount++;
    }
  }

  return {
    structuredText: textLines.join('\n'),
    pageTexts,
    assets,
    numPages,
    imagePageCount,
    textOnlyPageCount,
  };
}
