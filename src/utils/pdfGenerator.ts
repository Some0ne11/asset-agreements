import html2pdf from 'html2pdf.js';
import type { AgreementData } from '../types';

// Simple CSS styles
export const pdfStyles = `
  @page {
    margin: 0.75in;
    size: A4;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.8;
    color: #333;
  }
  
  .header {
    text-align: center;
    margin-bottom: 3rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #333;
  }
  
  .header h1 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 0.8rem;
  }
  
  .header .date {
    font-size: 14px;
    color: #666;
  }
  
  .details {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 4px;
  }
  
  .details h2 {
    font-size: 18px;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .detail-row {
    margin-bottom: 0.8rem;
    font-size: 14px;
  }
  
  .detail-row strong {
    display: inline-block;
    width: 140px;
  }
  
  .agreement-text {
    text-align: justify;
    line-height: 2;
    font-size: 14px;
  }
  
  .agreement-text p {
    margin-bottom: 1.5rem;
  }
  
  .footer {
    margin-top: 2rem;
  }
  
  .signature-area {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    width: 100%;
  }
  
  .signature-section {
    width: 48%;
    text-align: left;
  }
  
  .date-section {
    width: 48%;
    text-align: right;
  }
  
  .signature-section h4, .date-section h4 {
    font-size: 14px;
    margin-bottom: 1.5rem;
    color: #666;
  }
  
  .signature-image {
    max-width: 250px;
    max-height: 80px;
    object-fit: contain;
    margin-bottom: 0.8rem;
    background: transparent;
  }
  
  .signature-line {
    width: 250px;
    height: 1px;
    background: #333;
    margin-bottom: 0.8rem;
  }
  
  .date-line {
    width: 180px;
    height: 1px;
    background: #333;
    margin-bottom: 0.8rem;
  }
  
  .signature-name, .date-value {
    font-size: 13px;
    color: #666;
  }
  
  .footer-line {
    border-top: 1px solid #ccc;
    padding-top: 1rem;
    text-align: center;
    font-size: 12px;
    color: #999;
  }
  
  .date-section {
    text-align: center;
  }
  
  @media print {
    body {
      -webkit-print-color-adjust: exact;
    }
  }
`;

// Function to create HTML content for the PDF
const createAgreementHTML = (data: AgreementData): string => {
  const currentDate = new Date().toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Asset Assignment Agreement</title>
        <style>${pdfStyles}</style>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <h1>ASSET ASSIGNMENT AGREEMENT</h1>
            <div class="date">Date: ${currentDate}</div>
        </div>

        <!-- Details -->
        <div class="details">
            <h2>Agreement Details</h2>
            <div class="detail-row">
                <strong>Employee Name:</strong> ${data.name}
            </div>
            <div class="detail-row">
                <strong>Asset Name:</strong> ${data.assetName}
            </div>
            <div class="detail-row">
                <strong>Asset ID:</strong> ${data.assetId}
            </div>
            ${Array.isArray(data.additionalAssets) && data.additionalAssets.length > 0 ?
              `<div class="detail-row">
                <strong>Additional Assets:</strong> ${data.additionalAssets.join(", ")}
              </div>` 
              : ``
              }
        </div>

        <!-- Agreement Paragraph -->
        <div class="agreement-text">
            <p>
                I, <strong>${data.name}</strong>, hereby acknowledge that I have received the company asset 
                "<strong>${data.assetName}</strong>" with Asset ID <strong>${data.assetId}</strong> in good working condition. 
                I understand and agree to the following terms and conditions:
            </p>

            <p>
                I will use this asset solely for business purposes and will take reasonable care to maintain it in good condition. 
                I am responsible for any damage, loss, or theft that may occur while the asset is in my possession, except for normal wear and tear. 
                I agree to return the asset immediately upon request or upon termination of my employment, in the same condition as received.
            </p>

            <p>
                I understand that failure to comply with these terms may result in disciplinary action and/or financial responsibility 
                for the replacement or repair of the asset. I acknowledge that I have read, understood, and agree to be bound by 
                the company's asset management policies.
            </p>

            <p>
                By signing below, I confirm that I have received the above-mentioned asset and agree to all terms and conditions 
                outlined in this agreement.
            </p>
        </div>

        <!-- Footer with Signature and Date -->
        <div class="footer">
            <div class="signature-area">
                <div class="signature-section">
                    <h4>Employee Signature:</h4>
                    ${data.signature 
                        ? `<img src="${data.signature}" alt="Employee Signature" class="signature-image" />`
                        : `<p> No signature provided </p>`
                    }
                    <div class="signature-line"></div>
                    <div class="signature-name">${data.name}</div>
                </div>
                
                <div class="date-section">
                    <h4>Date: ${currentDate}</h4>
                </div>
            </div>
            
            <div class="footer-line">
                This agreement is legally binding and has been digitally signed.
            </div>
        </div>
    </body>
    </html>
  `;
};

// PDF generation function
export const generatePDF = async (data: AgreementData, download: boolean = true): Promise<string | void> => {
  try {
    const htmlContent = createAgreementHTML(data);
    
    const options = {
      margin: 0.75,
      filename: `Asset_Agreement_${data.name.replace(/[^a-zA-Z0-9]/g, '_')}_${data.assetId}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };

    if (download) {
      await html2pdf().set(options).from(htmlContent).save();
    } else {
      const pdfBlob = await html2pdf().set(options).from(htmlContent).outputPdf('blob');
      const url = URL.createObjectURL(pdfBlob);
      return url;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};