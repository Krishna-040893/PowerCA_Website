import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createAgreementPDF() {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  const margin = 50;
  let y = height - margin;

  // Title
  page.drawText('POWERCA SERVICE AGREEMENT', {
    x: margin,
    y: y,
    size: 20,
    font: timesRomanBoldFont,
    color: rgb(0.1, 0.1, 0.5),
  });
  y -= 40;

  // Subtitle
  page.drawText('Professional CA Practice Management Services', {
    x: margin,
    y: y,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 50;

  // Agreement content
  const content = [
    'This Service Agreement ("Agreement") is entered into between PowerCA',
    '("Service Provider") and the undersigned client ("Client").',
    '',
    '1. SERVICES PROVIDED',
    'PowerCA agrees to provide the following services:',
    '   • Client Management and CRM Services',
    '   • Tax Compliance and Deadline Tracking',
    '   • Document Management and Cloud Storage',
    '   • Billing and Invoice Generation',
    '   • Task Management and Team Collaboration',
    '',
    '2. TERM AND TERMINATION',
    'This Agreement shall commence upon signing and continue for the',
    'subscription period selected by the Client.',
    '',
    '3. FEES AND PAYMENT',
    'Client agrees to pay the applicable subscription fees as per the',
    'selected plan. Payments are due as per the billing cycle.',
    '',
    '4. DATA PROTECTION',
    'PowerCA shall maintain appropriate security measures to protect',
    'Client data in accordance with applicable data protection laws.',
    '',
    '5. CONFIDENTIALITY',
    'Both parties agree to maintain confidentiality of all proprietary',
    'information shared during the course of this Agreement.',
    '',
    '6. LIMITATION OF LIABILITY',
    'PowerCA liability shall be limited to the fees paid by the Client',
    'for the services during the preceding twelve (12) months.',
    '',
    '',
    'CLIENT SIGNATURE:',
    '',
    '_______________________________     Date: _______________',
    '',
    'Name: _________________________',
    '',
    'Company: ______________________',
    '',
    '',
    'FOR POWERCA:',
    '',
    '_______________________________     Date: _______________',
    '',
    'Authorized Signatory',
  ];

  for (const line of content) {
    if (y < margin) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }

    const isBold = line.match(/^\d\.|^CLIENT|^FOR POWERCA|^POWERCA/);
    page.drawText(line, {
      x: margin,
      y: y,
      size: 11,
      font: isBold ? timesRomanBoldFont : timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 18;
  }

  // Footer
  page.drawText('PowerCA - Complete CA Practice Management Solution', {
    x: margin,
    y: 30,
    size: 9,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('www.powerca.in', {
    x: width - margin - 80,
    y: 30,
    size: 9,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();

  const outputPath = path.join(process.cwd(), 'public', 'docs', 'PowerCA-Service-Agreement.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`PDF created successfully at: ${outputPath}`);
}

createAgreementPDF().catch(console.error);
