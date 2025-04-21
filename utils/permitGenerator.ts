import { PermitData } from "../types/permit"; // Adjust path as needed

export const generatePermitHtml = (permitData: PermitData): string => {
  // Format dates for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date strings
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  const formatDateShort = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting short date:", dateString, e);
      return "Invalid Date";
    }
  };

  const issueDate = formatDateShort(permitData.issue_date);
  const entryDate = formatDateShort(permitData.entry_date);
  const exitDate = formatDateShort(permitData.exit_date);
  const birthDate = formatDateShort(permitData.date_of_birth);

  // Generate a TIMS card number in the format shown in the image (using the actual card number)
  // const formattedTimsCardNo = `G-N-${new Date().getFullYear().toString().substr(2)}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}-${Math.floor(Math.random() * 100000).toString()}`;
  const formattedTimsCardNo = permitData.tims_card_no; // Use the actual TIMS card number

  // Create QR code data (Placeholder - actual QR generation requires a library)
  const qrCodeData = `TIMS Card No: ${permitData.tims_card_no}\nName: ${permitData.full_name}\nPassport: ${permitData.passport_number}`;

  // Helper to safely display potentially null values
  const displayValue = (
    value: string | number | null | undefined,
    defaultValue = "N/A"
  ) => {
    return value !== null && value !== undefined ? String(value) : defaultValue;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TIMS Permit</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #f9f9f9;
          font-size: 12px; /* Base font size */
        }
        .permit-container {
          width: 100%;
          max-width: 800px;
          margin: 10px auto;
          border: 1px solid #ccc;
          padding: 15px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .logo {
          width: 50px; /* Slightly smaller logo */
          height: 50px;
          background-color: #f0f0f0;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 5px;
          font-size: 10px; color: #999;
        }
        .title-container {
          text-align: center;
          flex-grow: 1;
          padding: 0 10px;
        }
        .title {
          font-size: 16px; /* Adjusted size */
          font-weight: bold;
          margin: 0;
          color: #1E5CB3;
        }
        .subtitle {
          font-size: 13px; /* Adjusted size */
          margin: 3px 0;
        }
        .url {
          font-size: 11px; /* Adjusted size */
          color: #666;
        }
        .section-header {
          background-color: #f0f0f0;
          padding: 6px 10px; /* Adjusted padding */
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          border-radius: 4px;
          font-size: 13px; /* Adjusted size */
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 12px; /* Table font size */
        }
        td, th {
          padding: 6px; /* Adjusted padding */
          border: 1px solid #ddd;
          vertical-align: top; /* Align content top */
        }
        th {
          background-color: #f5f5f5;
          text-align: left;
        }
        .label {
          width: 25%; /* Adjusted width */
          font-weight: bold;
          background-color: #f9f9f9;
        }
        .photo-container {
          width: 100px; /* Adjusted size */
          height: 125px; /* Adjusted size */
          border: 1px solid #ddd;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f0f0;
          margin: 0 auto; /* Center photo */
        }
        .photo-text {
          font-size: 11px; /* Adjusted size */
          color: #999;
          text-align: center;
        }
        .qr-code {
          width: 90px; /* Adjusted size */
          height: 90px; /* Adjusted size */
          border: 1px solid #ddd;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f0f0;
           margin: 0 auto; /* Center QR */
        }
        .qr-text {
          font-size: 10px; /* Adjusted size */
          color: #999;
          text-align: center;
          padding: 5px;
        }
        .contact-container {
          display: flex;
          width: 100%;
          margin-bottom: 15px;
          gap: 10px; /* Add gap between sections */
        }
        .contact-section {
          flex: 1; /* Make sections equal width */
          border: 1px solid #ddd;
          padding: 8px;
          border-radius: 4px; /* Add rounding */
        }
        .contact-title {
          font-weight: bold;
          margin-bottom: 8px;
          border-bottom: 1px solid #eee; /* Lighter border */
          padding-bottom: 5px;
          font-size: 13px; /* Adjusted size */
        }
        .contact-item {
          margin-bottom: 5px;
          font-size: 11px; /* Adjusted size */
          line-height: 1.4; /* Improve readability */
        }
        .contact-label {
          font-weight: bold;
        }
        .emergency-section, .regulations, .thanks-section {
          margin-top: 15px;
          border: 1px solid #ddd;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        .emergency-title, .regulations-title, .thanks-title {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 13px; /* Adjusted size */
        }
        .emergency-item, .regulation-item {
          margin-bottom: 5px;
          font-size: 11px; /* Adjusted size */
          line-height: 1.4;
        }
        .footer {
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        .footer-logo {
           width: 100px; /* Adjusted size */
           height: 35px; /* Adjusted size */
           background-color: #f0f0f0;
           display: flex; justify-content: center; align-items: center; border-radius: 4px;
           font-size: 10px; color: #999;
        }
        .signature {
          text-align: center;
          width: 150px;
        }
        .signature-line {
          width: 100%;
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
          height: 20px; /* Space for signature */
        }
        .signature-text {
          font-size: 11px; /* Adjusted size */
        }
        .mountain-graphic {
           width: 120px; /* Adjusted size */
           height: 35px; /* Adjusted size */
           background-color: #f0f0f0;
           display: flex; justify-content: center; align-items: center; border-radius: 4px;
           font-size: 10px; color: #999;
        }
      </style>
    </head>
    <body>
      <div class="permit-container">
        <div class="header">
          <div class="logo">NTB</div>
          <div class="title-container">
            <h1 class="title">Nepal Tourism Board</h1>
            <p class="subtitle">Trekkers Information Management System (TIMS)</p>
            <p class="url">https://tims.ntb.gov.np</p>
          </div>
          <div class="logo">TAAN</div>
        </div>

        <div class="section-header">
          <span>Trekker Details</span>
          <span>TIMS Card No: ${formattedTimsCardNo}</span>
          <span>Issue Date: ${issueDate}</span>
        </div>

        <table>
          <tr>
            <td class="label">Full Name</td>
            <td colspan="2">${displayValue(permitData.full_name)}</td>
            <td rowspan="4" style="width: 110px; text-align: center; vertical-align: middle;">
              <div class="photo-container">
                <div class="photo-text">Trekker Photo</div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="label">Nationality</td>
            <td colspan="2">${displayValue(permitData.nationality)}</td>
          </tr>
          <tr>
            <td class="label">Passport No.</td>
            <td>${displayValue(permitData.passport_number)}</td>
             <td class="label">Transaction ID</td>
            <td>${displayValue(permitData.transaction_id)}</td>
          </tr>
          <tr>
            <td class="label">Gender</td>
            <td>${displayValue(permitData.gender)}</td>
            <td class="label">Date of Birth</td>
            <td>${birthDate}</td>
          </tr>
        </table>

        <div class="section-header">
          <span>Trek Details</span>
        </div>

        <table>
          <tr>
            <td class="label">Trekker Area</td>
            <td colspan="2">${displayValue(permitData.trekker_area)}</td>
             <td rowspan="3" style="width: 100px; text-align: center; vertical-align: middle;">
              <div class="qr-code">
                <div class="qr-text">QR Code<br>Scan for details</div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="label">Route</td>
            <td colspan="2">${displayValue(permitData.route)}</td>
          </tr>
          <tr>
            <td class="label">Entry Date</td>
            <td>${entryDate}</td>
            <td class="label">Exit Date</td>
            <td>${exitDate}</td>
          </tr>
        </table>

        <div class="contact-container">
          <div class="contact-section">
            <div class="contact-title">Nepal Contact</div>
            <div class="contact-item"><span class="contact-label">Name:</span> ${displayValue(
              permitData.nepal_contact_name
            )}</div>
            <div class="contact-item"><span class="contact-label">Organization:</span> ${displayValue(
              permitData.nepal_organization
            )}</div>
            <div class="contact-item"><span class="contact-label">Designation:</span> ${displayValue(
              permitData.nepal_designation
            )}</div>
            <div class="contact-item"><span class="contact-label">Mobile:</span> ${displayValue(
              permitData.nepal_mobile
            )}</div>
            <div class="contact-item"><span class="contact-label">Office No:</span> ${displayValue(
              permitData.nepal_office_number
            )}</div>
            <div class="contact-item"><span class="contact-label">Address:</span> ${displayValue(
              permitData.nepal_address
            )}</div>
          </div>

          <div class="contact-section">
            <div class="contact-title">Home Country Contact</div>
            <div class="contact-item"><span class="contact-label">Name:</span> ${displayValue(
              permitData.home_contact_name
            )}</div>
            <div class="contact-item"><span class="contact-label">City:</span> ${displayValue(
              permitData.home_city
            )}</div>
            <div class="contact-item"><span class="contact-label">Mobile:</span> ${displayValue(
              permitData.home_mobile
            )}</div>
            <div class="contact-item"><span class="contact-label">Office No:</span> ${displayValue(
              permitData.home_office_number
            )}</div>
            <div class="contact-item"><span class="contact-label">Address:</span> ${displayValue(
              permitData.home_address
            )}</div>
          </div>
        </div>

        <div class="emergency-section">
          <div class="emergency-title">Emergency Contact</div>
          <div class="emergency-item">• 1144 - Tourist Police</div>
          <div class="emergency-item">• 9808717598 (Agency)</div>
          <div class="emergency-item">• 01-45 40 920 (TAAN, Kathmandu)</div>
          <div class="emergency-item">• 01-42 25 709 (Crisis Hotline NTB)</div>
          <div class="emergency-item">• 01-42 56 909 (NTB)</div>
          <div class="emergency-item">• 061-46 30 33 (TAAN, Pokhara)</div>
        </div>

        <div class="regulations">
          <div class="regulations-title">TIMS Regulatory Provision</div>
          <div class="regulation-item">• Card cost NRs. ${displayValue(
            permitData.permit_cost
          )} including VAT.</div>
          <div class="regulation-item">• Please keep this card with you during the trekking period.</div>
          <div class="regulation-item">• Please present this card to NTB/TAAN Officials, National Parks, Conservation Areas and Police Check Posts on request.</div>
          <div class="regulation-item">• Please keep a copy of passport along with you during your trek for verification.</div>
          <div class="regulation-item">• This card is non-transferable, non-endorsable and valid only for prescribed area and duration.</div>
          <div class="regulation-item">• This card is non-refundable.</div>
        </div>

        <div class="regulations">
          <div class="regulations-title">Group Trekker/s (GT)</div>
          <div class="regulation-item">Trekker/s using local facilites/expertise such as Trekking Guide/Support Staff and all pre-booked facilites.</div>
        </div>

        <div class="thanks-section">
          <div class="thanks-title">Thank you for:</div>
          <div class="regulation-item">• Respecting local people</div>
          <div class="regulation-item">• Respecting local culture and traditions</div>
          <div class="regulation-item">• Respecting nature and environment</div>
          <div class="regulation-item">• Using local products and facilities</div>
        </div>

        <div style="font-style: italic; margin-top: 10px; font-size: 11px;">
          *This card is valid for single entry only.<br>
          For reliable services, please make reservation through government registered trekking agencies.
        </div>

        <div class="footer">
          <div class="footer-logo">Nepal Tourism</div>
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-text">Authorized Signature</div>
          </div>
          <div class="mountain-graphic">Mountain Graphic</div>
        </div>
      </div>
    </body>
    </html>
  `;
};
