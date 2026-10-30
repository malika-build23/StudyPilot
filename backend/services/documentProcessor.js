
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
  const ast = await OfficeParser.parseOffice(buffer);

  if (fileType === 'pdf') {
    const result = await ast.to('text', {
      textConfig: {
        pageSeparator: '\f',
        preserveLayout: false,
      },
      includeImages: false,
    });

    const pages = result.value
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

    return {
      format: 'pptx',
      slides,
      ocrRequired: false,
    };
  }

  throw new Error('Unsupported document format');
}

module.exports = { processDocument };
