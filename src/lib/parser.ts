import { Asset, DocumentBlock, NormalizedDocument } from '../types';
import AdmZip from 'adm-zip';

/**
 * Detect image MIME type using file header magic bytes with extension fallback.
 */
export function detectMimeType(buffer: Buffer, filename: string): string {
  if (buffer.length >= 8) {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return 'image/png';
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    // GIF: 47 49 46 38
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return 'image/gif';
    }
    // WebP: RIFF ... WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return 'image/webp';
    }
  }

  const lowerName = filename.toLowerCase();
  if (lowerName.endsWith('.png')) return 'image/png';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg';
  if (lowerName.endsWith('.gif')) return 'image/gif';
  if (lowerName.endsWith('.webp')) return 'image/webp';
  if (lowerName.endsWith('.svg')) return 'image/svg+xml';
  if (lowerName.endsWith('.bmp')) return 'image/bmp';

  return 'image/png';
}

export interface DocxParseResult {
  structuredText: string;
  assets: Asset[];
  normalizedDocument: NormalizedDocument;
}

/**
 * Parses a DOCX file deeply by inspecting XML relationships and sequential document paragraphs,
 * extracting every embedded image, associating it with its surrounding Case / Section heading,
 * and generating base64 Data URLs for instant UI rendering and API consumption.
 */
export async function parseDocxWithImageFidelity(buffer: Buffer): Promise<DocxParseResult> {
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();

  // 1. Build relationship map from word/_rels/document.xml.rels
  const relIdToTargetMap = new Map<string, string>();
  const relEntry = zip.getEntry('word/_rels/document.xml.rels');
  if (relEntry) {
    const relXml = relEntry.getData().toString('utf8');
    // Match <Relationship Id="rIdX" Type=".../image" Target="media/imageY.png"/>
    const relRegex = /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g;
    let match;
    while ((match = relRegex.exec(relXml)) !== null) {
      const [, rId, target] = match;
      // Normalize target path (e.g. "media/image1.png" -> "word/media/image1.png")
      const normalizedTarget = target.startsWith('word/') ? target : `word/${target.replace(/^\//, '')}`;
      relIdToTargetMap.set(rId, normalizedTarget);
    }
  }

  // 2. Extract media files into memory map
  const mediaBufferMap = new Map<string, Buffer>();
  for (const entry of zipEntries) {
    if (entry.entryName.startsWith('word/media/')) {
      mediaBufferMap.set(entry.entryName, entry.getData());
    }
  }

  // 3. Parse word/document.xml sequentially
  const docEntry = zip.getEntry('word/document.xml');
  const assets: Asset[] = [];
  const blocks: DocumentBlock[] = [];
  const textLines: string[] = [];

  let currentHeadingOrCase = '';
  let assetCounter = 0;
  const processedTargets = new Set<string>();

  if (docEntry) {
    const docXml = docEntry.getData().toString('utf8');

    // Split into paragraphs <w:p ...>...</w:p> and tables <w:tbl ...>...</w:tbl>
    const elementRegex = /<(w:p|w:tbl)[\s>][\s\S]*?<\/\1>/g;
    let elemMatch;

    while ((elemMatch = elementRegex.exec(docXml)) !== null) {
      const elemXml = elemMatch[0];

      // Extract plain text from all <w:t> tags in this element
      const textMatches = elemXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
      const paragraphText = textMatches
        .map((t) => t.replace(/<[^>]+>/g, ''))
        .join('')
        .trim();

      // Check if this text defines a Case, Question, or Section Header
      if (paragraphText) {
        if (/^(Case\s+\d+|Section\s+[A-Z0-9]+|Question\s+\d+|Task\s+\d+|Test\s+\d+|Item\s+\d+)/i.test(paragraphText)) {
          currentHeadingOrCase = paragraphText;
        } else if (paragraphText.length > 0 && paragraphText.length < 80 && !paragraphText.startsWith('☐') && !paragraphText.startsWith('[')) {
          if (!currentHeadingOrCase) {
            currentHeadingOrCase = paragraphText;
          }
        }

        blocks.push({
          blockId: `blk_${blocks.length + 1}`,
          type: paragraphText.startsWith('☐') || paragraphText.startsWith('[ ]') ? 'CHECKBOX' : 'TEXT',
          content: paragraphText,
        });

        textLines.push(paragraphText);
      }

      // Check for image references in this element (w:drawing, a:blip, w:pict, v:imagedata)
      const blipMatches = [
        ...Array.from(elemXml.matchAll(/<a:blip[^>]+r:embed="([^"]+)"/g)),
        ...Array.from(elemXml.matchAll(/<v:imagedata[^>]+r:id="([^"]+)"/g)),
      ];

      for (const bMatch of blipMatches) {
        const rId = bMatch[1];
        const targetPath = relIdToTargetMap.get(rId);

        if (targetPath && mediaBufferMap.has(targetPath)) {
          const imgBuffer = mediaBufferMap.get(targetPath)!;
          const mimeType = detectMimeType(imgBuffer, targetPath);
          const dataUrl = `data:${mimeType};base64,${imgBuffer.toString('base64')}`;

          assetCounter++;
          const assetId = `asset_${assetCounter}`;
          processedTargets.add(targetPath);

          const asset: Asset = {
            assetId,
            type: 'IMAGE',
            mimeType,
            source: 'docx',
            page: null,
            sourceLocation: targetPath,
            dataUrl,
            data: imgBuffer,
            associatedSection: currentHeadingOrCase || `Item ${assetCounter}`,
            description: currentHeadingOrCase ? `Visual context for ${currentHeadingOrCase}` : `Document image ${assetCounter}`,
          };

          assets.push(asset);

          blocks.push({
            blockId: `blk_img_${assetId}`,
            type: 'IMAGE',
            content: `Image attached to ${currentHeadingOrCase || 'Question'}`,
            assetId,
          });

          // Insert an explicit, unmistakable image reference marker in the text flow
          textLines.push(`[ATTACHED_IMAGE_ASSET: ${assetId} | Section: ${currentHeadingOrCase || 'General'}]`);
        }
      }
    }
  }

  // 4. Also capture any remaining images in word/media/ that weren't matched in XML
  for (const [mediaPath, imgBuffer] of mediaBufferMap.entries()) {
    if (!processedTargets.has(mediaPath)) {
      assetCounter++;
      const assetId = `asset_${assetCounter}`;
      const mimeType = detectMimeType(imgBuffer, mediaPath);
      const dataUrl = `data:${mimeType};base64,${imgBuffer.toString('base64')}`;

      const asset: Asset = {
        assetId,
        type: 'IMAGE',
        mimeType,
        source: 'docx',
        page: null,
        sourceLocation: mediaPath,
        dataUrl,
        data: imgBuffer,
        associatedSection: `Image ${assetCounter}`,
        description: `Embedded document image ${assetCounter}`,
      };

      assets.push(asset);
      textLines.push(`[ATTACHED_IMAGE_ASSET: ${assetId}]`);
    }
  }

  const structuredText = textLines.join('\n');

  const normalizedDocument: NormalizedDocument = {
    title: 'Extracted Document',
    description: '',
    pages: [
      {
        pageNumber: 1,
        blocks,
      },
    ],
    assets,
  };

  return {
    structuredText,
    assets,
    normalizedDocument,
  };
}

/**
 * Legacy wrapper for backward compatibility.
 */
export async function extractAssetsFromDocx(buffer: Buffer): Promise<Asset[]> {
  const result = await parseDocxWithImageFidelity(buffer);
  return result.assets;
}
