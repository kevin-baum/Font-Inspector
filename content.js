chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const fontDetailsTable = document.getElementById('fontDetails');
  
  const newRow = fontDetailsTable.insertRow();
  
  const propertyCell = newRow.insertCell(0);
  const valueCell = newRow.insertCell(1);
  
  propertyCell.textContent = 'Font Family';
  valueCell.textContent = message.fontFamily;
  
  const newRowSize = fontDetailsTable.insertRow();
  
  const sizePropertyCell = newRowSize.insertCell(0);
  const sizeValueCell = newRowSize.insertCell(1);
  
  sizePropertyCell.textContent = 'Font Size';
  sizeValueCell.textContent = message.fontSize;
});
