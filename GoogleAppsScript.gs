function doPost(e) {
  // Log the incoming request
  console.log('Received POST request');
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };

  // Handle preflight requests
  if (e.postData.type === "application/x-www-form-urlencoded") {
    return ContentService.createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
  }
  
  try {
    // Log the raw post data
    console.log('Raw postData:', e.postData.contents);
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    console.log('Parsed data:', data);
    
    // Check if this is a newsletter subscription
    if (data.type === 'newsletter') {
      const success = handleNewsletter(data.email);
      return ContentService.createTextOutput(success ? "Success" : "Error")
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    // Get the specific spreadsheet using ID
    const spreadsheet = SpreadsheetApp.openById('1cnJ1ebHo2nL-qe1OLuT2ikKQzBNQ4Y6QWGIjZppWObY');
    const sheet = spreadsheet.getSheetByName('Leads');
    
    if (!sheet) {
      console.error('Sheet "Leads" not found');
      throw new Error('Sheet "Leads" not found');
    }
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Prepare the data row
    const rowData = [
      timestamp,
      data.name || '',
      data.phone || '',
      data.query || ''
    ];
    
    // Log the row data before appending
    console.log('Appending row:', rowData);
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Log success
    console.log('Successfully appended row');
    
    // Return success response
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
    
  } catch (error) {
    // Log the error
    console.error('Error in doPost:', error);
    console.error('Error stack:', error.stack);
    
    // Return error response
    return ContentService.createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
  }
}

function handleNewsletter(email) {
  try {
    // Get the specific spreadsheet using ID
    const spreadsheet = SpreadsheetApp.openById('1cnJ1ebHo2nL-qe1OLuT2ikKQzBNQ4Y6QWGIjZppWObY');
    
    // Get or create 'emails' sheet
    let sheet = spreadsheet.getSheetByName('emails');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('emails');
      // Add headers
      sheet.appendRow(['Timestamp', 'Email', 'Status']);
    }
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Append the email data
    sheet.appendRow([timestamp, email, 'Subscribed']);
    
    return true;
  } catch (error) {
    console.error('Error in handleNewsletter:', error);
    return false;
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Service is running")
    .setMimeType(ContentService.MimeType.TEXT);
}
