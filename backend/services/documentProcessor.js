const { OfficeParser } = require('officeparser');

function getNodeText(node) {
  if (!node) return '';

  const ownText = typeof node.text === 'string' ? node.text : '';
  const childText = Array.isArray(node.children)
    ? node.children.map(getNodeText).filter(Boolean).join('\n')
    : '';

  return [ownText, childText].filter(Boolean).join('\n').trim();
}

async function processDocument(buffer, fileType) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Document buffer is empty.');
  }

  if (fileType === 'ppt') {
    throw new Error(
      'Legacy .ppt format is not directly supported for automated text extraction. Please save or export your presentation as .pptx or .pdf format before uploading.'
    );
  }

  let ast;
  try {
    ast = await OfficeParser.parseOffice(buffer, {
      fileType: fileType === 'pdf' ? 'pdf' : 'pptx',
      ocr: false,
    });
  } catch (err) {
    throw new Error(`OfficeParser failed to parse file structure: ${err.message}`);
  }

  if (fileType === 'pdf') {
    const result = await ast.to('text', {
      textConfig: {
        pageSeparator: '\f',
        preserveLayout: false,
      },
      includeImages: false,
    });

    const pages = (result.value || '')
      .split('\f')
      .map((text, index) => ({
        pageNumber: index + 1,
        text: text.trim(),
      }));

    const hasText = pages.some((page) => page.text.length > 0);

    return {
      format: 'pdf',
      pages,
      ocrRequired: !hasText,
    };
  }

  if (fileType === 'pptx') {
    const slideNodes = (ast.content || []).filter(
      (node) => node.type === 'slide'
    );

    const slides = slideNodes.map((slide, index) => ({
      slideNumber: index + 1,
      text: getNodeText(slide),
    }));

    const hasText = slides.some((s) => s.text.length > 0);

    return {
      format: 'pptx',
      slides,
      ocrRequired: !hasText,
    };
  }

  throw new Error(`Unsupported document format '${fileType}'. Supported formats are: PDF (.pdf) and PowerPoint Presentation (.pptx).`);
}

module.exports = { processDocument };
