var clientsMain, clientsArr, clientsObj, clientRow = {}

const spreadsheet   = SpreadsheetApp.getActiveSpreadsheet()
const clientsTab    = spreadsheet.getSheetByName("Forecast")
const HistoricalTab = spreadsheet.getSheetByName("Historical")
const CurrentTab    = spreadsheet.getSheetByName("Current")
const ClientsDataRange = "A3:D"
