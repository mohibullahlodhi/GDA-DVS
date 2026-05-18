import bwipjs from "bwip-js";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export type ProcessedDocument = {
  buffer: Uint8Array;
  contentType: string;
  fileName: string;
  documentId: string;
};

type DocumentKind = "pdf" | "docx";

const departmentCodes = {
  BCA: "BCA",
  Education: "EDU",
  Health: "HLT",
  Police: "POL",
  Revenue: "REV",
  Transport: "TRN",
} as const;

export type Department = keyof typeof departmentCodes;

export const generateDocumentId = (department: Department) => {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GDA-${departmentCodes[department]}-${new Date().getFullYear()}-${random}`;
};

export const getFileExtension = (fileName: string) => {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
};

const createBarcodeBuffer = async (documentId: string) => {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: documentId,
    scale: 2,
    height: 10,
    includetext: false,
    backgroundcolor: "FFFFFF",
  });
};

const buildOutputName = (fileName: string, documentId: string) => {
  const extension = getFileExtension(fileName);
  const baseName = fileName.replace(new RegExp(`\\.${extension}$`, "i"), "");
  return `${baseName}_${documentId}_stamped.${extension}`;
};

const stampPdf = async (input: ArrayBuffer, barcodeBuffer: Buffer) => {
  const pdfDoc = await PDFDocument.load(input);
  const barcodeImage = await pdfDoc.embedPng(barcodeBuffer);
  const firstPage = pdfDoc.getPages()[0];

  if (!firstPage) {
    throw new Error("The uploaded PDF does not contain any pages.");
  }

  const pageWidth = firstPage.getWidth();
  const pageHeight = firstPage.getHeight();
  const naturalSize = barcodeImage.scale(1);
  const maxWidth = Math.min(pageWidth * 0.28, 180);
  const maxHeight = 36;
  const scale = Math.min(maxWidth / naturalSize.width, maxHeight / naturalSize.height, 1);
  const drawWidth = naturalSize.width * scale;
  const drawHeight = naturalSize.height * scale;
  const drawX = pageWidth - drawWidth - 18;
  const drawY = pageHeight - drawHeight - 14;

  firstPage.drawImage(barcodeImage, {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  });

  return pdfDoc.save();
};

const makeImageParagraph = (
  relationshipId: string,
  docPrId: number,
  widthEmu: number,
  heightEmu: number,
) => {
  return `
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
        <w:spacing w:before="0" w:after="48"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
            <wp:docPr id="${docPrId}" name="GDAVS Barcode"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="${docPrId}" name="GDAVS Barcode"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${relationshipId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${widthEmu}" cy="${heightEmu}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
  `.trim();
};

const stampDocx = async (input: Buffer, barcodeBuffer: Buffer) => {
  const zip = await JSZip.loadAsync(input);

  zip.file("word/media/gdavs-barcode.png", barcodeBuffer, { binary: true });

  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!contentTypesFile) {
    throw new Error("The uploaded DOCX is missing [Content_Types].xml.");
  }

  let contentTypes = await contentTypesFile.async("string");
  if (!contentTypes.includes('Extension="png"')) {
    contentTypes = contentTypes.replace(
      "</Types>",
      '<Default Extension="png" ContentType="image/png"/></Types>',
    );
  }
  zip.file("[Content_Types].xml", contentTypes);

  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (!relsFile) {
    throw new Error("The uploaded DOCX is missing word/_rels/document.xml.rels.");
  }

  const relationshipId = "rIdGDAVSBarcode01";
  let rels = await relsFile.async("string");
  if (!rels.includes(relationshipId)) {
    rels = rels.replace(
      "</Relationships>",
      `<Relationship Id="${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/gdavs-barcode.png"/></Relationships>`,
    );
  }
  zip.file("word/_rels/document.xml.rels", rels);

  const documentFile = zip.file("word/document.xml");
  if (!documentFile) {
    throw new Error("The uploaded DOCX is missing word/document.xml.");
  }

  const documentXml = await documentFile.async("string");
  const barcodeBlock = makeImageParagraph(relationshipId, 101, 2400000, 420000);
  const updatedXml = documentXml.replace("<w:body>", `<w:body>${barcodeBlock}`);
  zip.file("word/document.xml", updatedXml);

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
};

export const stampUploadedDocument = async (file: File, department: Department) => {
  const extension = getFileExtension(file.name);
  const documentId = generateDocumentId(department);
  const barcodeBuffer = await createBarcodeBuffer(documentId);

  if (extension === "pdf") {
    const stamped = await stampPdf(await file.arrayBuffer(), barcodeBuffer);

    return {
      buffer: stamped,
      contentType: "application/pdf",
      fileName: buildOutputName(file.name, documentId),
      documentId,
    } satisfies ProcessedDocument;
  }

  if (extension === "docx") {
    const stamped = await stampDocx(Buffer.from(await file.arrayBuffer()), barcodeBuffer);

    return {
      buffer: stamped,
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName: buildOutputName(file.name, documentId),
      documentId,
    } satisfies ProcessedDocument;
  }

  throw new Error("Only PDF and DOCX files are supported.");
};