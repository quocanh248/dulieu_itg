// PDFPreviewer.tsx
import { useRef, useEffect, useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode'; // Import the qrcode package

const PDFPreviewer = ({ value }: { value: string }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [pdfURL, setPdfURL] = useState<string | null>(null);

  const generateQRCodeDataURL = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(value, { width: 200 }, (error, url) => {
        if (error) {
          reject(error);
        } else {
          resolve(url);
        }
      });
    });
  };


  const generatePDF = async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]); // A4 dimensions in points
    const { height } = page.getSize();

    page.drawText('My QR Code', {
      x: 50,
      y: height - 150,
      size: 30,
      color: rgb(0, 0, 0),
    });

    // Get QR code data URL
    const qrCodeDataUrl = await generateQRCodeDataURL();
    const pngImageBytes = await fetch(qrCodeDataUrl).then(res => res.arrayBuffer());
    const pngImage = await doc.embedPng(pngImageBytes);
    page.drawImage(pngImage, {
      x: 50,
      y: height - 200,
      width: 200,
      height: 200,
    });

    const pdfBytes = await doc.save();

    // Create URL and set it for iframe
    const file = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    setPdfURL(fileURL);
  };

  useEffect(() => {
    generatePDF();
  }, [value]);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe 
        ref={iframeRef}
        src={pdfURL || ''} 
        width="100%" 
        height="100%" 
        style={{ border: "none", display: 'block' }} 
      ></iframe>
    </div>
  );
};

export default PDFPreviewer;
