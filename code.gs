/**
 * @OnlyCurrentDoc
 */

function runProcess() {
  
  
  clientsMain = getClients()
  clientsArr = clientsMain['arr']
  clientsObj = clientsMain['obj']
  

  if(clientsArr.length < 4) {
   Browser.msgBox("Unable to find client list, please check the clients list is populated correctly.")
   return false
  }
  
  processHistorical()
  processCurrent()
}

function processHistorical() {
  Logger.log("Start processHistorical")
  
  var dateMonthPrior_1 = dateMonthPrior(1)
  var dateMonthPrior_1_End = dateMonthEnd(dateMonthPrior_1)
  Logger.log("dateMonthPrior(1): "+ dateMonthPrior_1)
  Logger.log("dateMonthPrior(1) End: "+ dateMonthPrior_1_End)
  
  var dateMonthPrior_2 = dateMonthPrior(2)
  var dateMonthPrior_2_End = dateMonthEnd(dateMonthPrior_2)
  Logger.log("dateMonthPrior(2): "+ dateMonthPrior_2)
  Logger.log("dateMonthPrior(2) End: "+ dateMonthPrior_2_End)
  
  var dateMonthPrior_3 = dateMonthPrior(3)
  var dateMonthPrior_3_End = dateMonthEnd(dateMonthPrior_3)
  Logger.log("dateMonthPrior(3): "+ dateMonthPrior_3)
  Logger.log("dateMonthPrior(3) End: "+ dateMonthPrior_3_End)
 
  
  var dataArr = []
  var currDate = dateNow()

  var maxRows = HistoricalTab.getLastRow();
  if(maxRows < 3) maxRows = "";

  var GADataRange = 3

  HistoricalTab.getRange("A"+GADataRange+":L"+maxRows).clearContent(); //clear existing data in the All Data sheet
  
  var GADataRangeStart = parseInt(GADataRange)
  
  
  for (var i = 0; i < clientsArr.length; i++) {
    
    if(i < 2) continue;
    
    var isDomain = getSubDomain(clientsArr[i][3])
    var profileId = clientsArr[i][2]

    
    Logger.log(i + ". isDomain: "+ isDomain)
    Logger.log(i + ". profileId: "+ profileId)

    //Logger.log("AnalyticsProfiles[isDomain]: " + JSON.stringify(AnalyticsProfiles[isDomain]))
    var analyticsData_1 = {}, analyticsData_2 = {}, analyticsData_3 = {}
    if(parseInt(profileId)) {
      analyticsData_1 = runReport(profileId, dateMonthPrior_1, dateMonthPrior_1_End)
      analyticsData_2 = runReport(profileId, dateMonthPrior_2, dateMonthPrior_2_End)
      analyticsData_3 = runReport(profileId, dateMonthPrior_3, dateMonthPrior_3_End)
      Utilities.sleep(1000)
    }

    /*Logger.log("analyticsData_1: " + JSON.stringify(analyticsData_1))
    Logger.log("analyticsData_2: " + JSON.stringify(analyticsData_2))
    Logger.log("analyticsData_3: " + JSON.stringify(analyticsData_3))*/
    
    dataArr[GADataRange] = []
    dataArr[GADataRange][0] = clientsArr[i][0]
    dataArr[GADataRange][1] = clientsArr[i][1]
    dataArr[GADataRange][2] = clientsArr[i][3]
    dataArr[GADataRange][3] = currDate
    
    dataArr[GADataRange][4] = '=IFERROR(AVERAGE(G'+ (GADataRange) +',H'+ (GADataRange) +',I'+ (GADataRange) +'), "")'
    dataArr[GADataRange][5] = '=IFERROR(AVERAGE(J'+ (GADataRange) +',K'+ (GADataRange) +',L'+ (GADataRange) +'), "")'
    
    if(analyticsData_1) {
      dataArr[GADataRange][6] = (analyticsData_1['ga:goalCompletionsAll'] > 0) ? analyticsData_1['ga:goalCompletionsAll'] : 0;
      dataArr[GADataRange][9] = (analyticsData_1['ga:organicSearches'] > 0) ? analyticsData_1['ga:organicSearches'] : 0; 
    }
    
    if(analyticsData_2) {
      dataArr[GADataRange][7] = (analyticsData_2['ga:goalCompletionsAll'] > 0) ? analyticsData_2['ga:goalCompletionsAll'] : 0;
      dataArr[GADataRange][10] = (analyticsData_2['ga:organicSearches'] > 0) ? analyticsData_2['ga:organicSearches'] : 0; 
    }
    
    if(analyticsData_3) {
      dataArr[GADataRange][8] = (analyticsData_3['ga:goalCompletionsAll'] > 0) ? analyticsData_3['ga:goalCompletionsAll'] : 0;
      dataArr[GADataRange][11] = (analyticsData_3['ga:organicSearches'] > 0) ? analyticsData_3['ga:organicSearches'] : 0; 
    }

    GADataRange++
      
  }

  if(dataArr.length > 0)
    dataArr = dataArr.filter(function(e){return e[0].length > 0}); 
  Logger.log("dataArr.length"+ dataArr.length)
  Logger.log("A"+ (GADataRangeStart) +":L"+ (dataArr.length + (GADataRangeStart - 1) ))
  //update data in the columns
  HistoricalTab.getRange( "A"+ (GADataRangeStart) +":L"+ (dataArr.length + (GADataRangeStart - 1) )).setValues(dataArr)          
  return false 
}

function processCurrent() {
  Logger.log("Start processCurrent")
  
  var dateMonthToday = dateTodate()
  var dateMonthBegin = dateMonthStart()
  Logger.log("dateMonthToday: "+ dateMonthToday)
  Logger.log("dateMonthBegin: "+ dateMonthBegin)
 
  
  var dataArr = []
  var currDate = dateNow()

  var maxRows = CurrentTab.getLastRow();
  if(maxRows < 2) maxRows = "";
  
  var GADataRange = 2
  CurrentTab.getRange("A"+GADataRange+":F"+maxRows).clearContent(); //clear existing data in the All Data sheet
 
  var GADataRangeStart = parseInt(GADataRange)
  
  
  for (var i = 0; i < clientsArr.length; i++) {
    
    if(i < 2) continue;
    
    var isDomain = getSubDomain(clientsArr[i][3])
    var profileId = clientsArr[i][2]

    
    Logger.log(i + ". isDomain: "+ isDomain)
    Logger.log(i + ". profileId: "+ profileId)
    
    var analyticsData = {}
    if(parseInt(profileId)) {
      analyticsData = runReport(profileId, dateMonthBegin, dateMonthToday)
      Utilities.sleep(500)
    }

    dataArr[GADataRange] = []
    dataArr[GADataRange][0] = clientsArr[i][0]
    dataArr[GADataRange][1] = clientsArr[i][1]
    dataArr[GADataRange][2] = clientsArr[i][3]
    dataArr[GADataRange][3] = currDate
    
    if(analyticsData) {
      dataArr[GADataRange][4] = (analyticsData['ga:goalCompletionsAll'] > 0) ? analyticsData['ga:goalCompletionsAll'] : 0;
      dataArr[GADataRange][5] = (analyticsData['ga:organicSearches'] > 0) ? analyticsData['ga:organicSearches'] : 0;
    }

    GADataRange++
  }

  if(dataArr.length > 0)
    dataArr = dataArr.filter(function(e){return e[0].length > 0}); 
  Logger.log("dataArr.length"+ dataArr.length)
  Logger.log("A"+ (GADataRangeStart) +":L"+ (dataArr.length + (GADataRangeStart - 1) ))
  //update data in the columns
  CurrentTab.getRange( "A"+ (GADataRangeStart) +":F"+ (dataArr.length + (GADataRangeStart - 1) ) ).setValues(dataArr)          
  return false 
}
