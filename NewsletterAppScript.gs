function doPost(e) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };

  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }
    
    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById('1cnJ1ebHo2nL-qe1OLuT2ikKQzBNQ4Y6QWGIjZppWObY');
    let sheet = spreadsheet.getSheetByName('emails');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet('emails');
      sheet.appendRow(['Timestamp', 'Email', 'Status']);
      sheet.getRange('A1:C1').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Check if email already exists
    const emailData = sheet.getDataRange().getValues();
    const emailExists = emailData.some(row => row[1] === email);
    
    if (emailExists) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Email already subscribed'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Add new subscription
    sheet.appendRow([new Date(), email, 'Subscribed']);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 3);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Successfully subscribed to newsletter'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message || 'Failed to subscribe'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Newsletter service is running'
  }))
  .setMimeType(ContentService.MimeType.JSON);
}
