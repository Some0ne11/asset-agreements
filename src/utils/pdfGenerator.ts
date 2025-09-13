import jsPDF from 'jspdf';
import type { AgreementData } from '../types';

export const generatePDF = async (data: AgreementData, download: boolean = true): Promise<string | void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);

  // Company Logo (placeholder - you can replace with actual logo)
  // For now, we'll create a simple text-based logo
  doc.setFillColor(59, 130, 246); // Blue color
  doc.rect(margin, 15, 40, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('COMPANY', margin + 5, 25);
  doc.setTextColor(0, 0, 0); // Reset to black

  // Company name and header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('ASSET ASSIGNMENT AGREEMENT', margin + 50, 25);

  // Date (top right)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const dateText = `Date: ${currentDate}`;
  doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), 20);

  // Horizontal line under header
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 35, pageWidth - margin, 35);

  // Employee and Asset Details Section
  let yPos = 55;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('AGREEMENT DETAILS', margin, yPos);

  yPos += 15;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  // Create a clean details section
  const details = [
    { label: 'Employee Name:', value: data.name },
    { label: 'Asset Name:', value: data.assetName },
    { label: 'Asset ID:', value: data.assetId }
  ];

  details.forEach((detail, index) => {
    doc.setFont(undefined, 'bold');
    doc.text(detail.label, margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(detail.value, margin + 35, yPos);
    yPos += 12;
  });

  // Agreement Text
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('TERMS AND CONDITIONS', margin, yPos);

  yPos += 15;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);

  const agreementText = [
    'This agreement confirms the assignment of company assets to the employee named above.',
    '',
    'By signing this agreement, the employee acknowledges and agrees to the following:',
    '',
    '• Receipt of the asset in good working condition',
    '• Responsibility for the proper care, custody, and maintenance of the asset',
    '• Agreement to use the asset solely for business purposes',
    '• Obligation to return the asset in good condition upon request or termination',
    '• Understanding that loss, damage, or misuse may result in financial responsibility',
    '• Compliance with all company policies regarding asset usage'
  ];

  agreementText.forEach((line) => {
    if (line === '') {
      yPos += 8;
    } else {
      const splitText = doc.splitTextToSize(line, maxWidth);
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * 6 + 4;
    }
  });

  // Acknowledgment statement
  yPos += 20;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  
  const acknowledgmentText = `I, ${data.name.toUpperCase()}, hereby acknowledge that I have received the above-mentioned asset and agree to the terms and conditions outlined in this agreement. I understand my responsibilities and obligations regarding the proper use and care of this company asset.`;
  
  const splitAcknowledgment = doc.splitTextToSize(acknowledgmentText, maxWidth);
  doc.text(splitAcknowledgment, margin, yPos);
  yPos += splitAcknowledgment.length * 6 + 20;

  // Signature and Date Section (Bottom of page)
  const bottomMargin = 40;
  const signatureY = pageHeight - bottomMargin - 30;

  // Signature section (bottom left)
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('Employee Signature:', margin, signatureY - 5);

  // Add signature image if available (without border)
  if (data.signature) {
    try {
      const sigHeight = 25;
      const sigWidth = 70;
      
      // Add signature image without any border
      doc.addImage(data.signature, 'PNG', margin, signatureY, sigWidth, sigHeight, undefined, 'FAST');
      
    } catch (error) {
      console.error('Error adding signature to PDF:', error);
      // Fallback: signature line
      doc.line(margin, signatureY + 15, margin + 70, signatureY + 15);
    }
  } else {
    // Signature line if no signature provided
    doc.line(margin, signatureY + 15, margin + 70, signatureY + 15);
  }

  // Date section (bottom right)
  doc.setFont(undefined, 'bold');
  doc.text('Date:', pageWidth - margin - 50, signatureY - 5);
  doc.setFont(undefined, 'normal');
  doc.text(currentDate, pageWidth - margin - 45, signatureY + 10);

  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

  // Footer text
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This document contains a legally binding digital signature.', 
    margin, pageHeight - 10);
  
  const footerRight = 'Generated electronically';
  doc.text(footerRight, pageWidth - margin - doc.getTextWidth(footerRight), pageHeight - 10);

  if (download) {
    // Save the PDF
    const fileName = `Asset_Agreement_${data.name.replace(/\s+/g, '_')}_${data.assetId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } else {
    // Return PDF as data URL for preview
    return doc.output('datauristring');
  }
};