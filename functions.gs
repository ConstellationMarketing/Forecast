
function onOpen(e) {
  SpreadsheetApp.getActiveSpreadsheet().addMenu('Generate Results', generateMenu());
}

function generateMenu() {
  var entries = [
    {
      name: "Generate Forecast",
      functionName: "runProcess"
    }
  ];
  
  return entries;
}

function allClientsSheetURL() {
  return "1TqmfT05RHzrvKlDD8a832BJQDdiralW2g0t4rJ6Fg7w";
}

function dateNow() {
  var d = new Date();
  return ('0' + (d.getMonth()+1)).slice(-2)   + "/" + ('0' + d.getDate()).slice(-2) + "/" +  d.getFullYear()
}

function dateTodate() {
  var d = new Date();
  return Utilities.formatDate(d, Session.getScriptTimeZone(),
                              'yyyy-MM-dd');
}

function dateMonthStart() {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1); 
  return Utilities.formatDate(firstDay, Session.getScriptTimeZone(),
                                       'yyyy-MM-dd');
}

function dateMonthEnd(Mydate) {
  var date = new Date(Mydate);
  var EoD = new Date(date.getFullYear(), date.getMonth() + 1, 0); 
  return Utilities.formatDate(EoD, Session.getScriptTimeZone(),
                                       'yyyy-MM-dd');
}

function dateMonthPrior(minusMonth = 1) {
  var dt = new Date();
  dt.setMonth(dt.getMonth() - parseInt(minusMonth));
  var d = new Date(dt.getFullYear(), dt.getMonth(), 1); 
  return Utilities.formatDate(d, Session.getScriptTimeZone(),
                                       'yyyy-MM-dd');
}

function getSubDomain(domain) {
    var splitdomain = domain.split("//")[1]
    if (splitdomain !== undefined) {
     return splitdomain.replace(/\/$/, '').replace("www.", '')
     
    }
    return domain
}

function getClients() {
  var results = {}
    results['arr'] = {}
    results['obj'] = {}
    var clients = clientsTab.getDataRange().getValues()
  
  results['arr'] = clients
  for (var i = 0; i < clients.length; i++) {
    var subDomain = getSubDomain(clients[i][3])
    if(subDomain)
      results['obj'][subDomain] = clients[i];
    
  }
  
  return results;
}

/****

Google Analytics data functions

*****/
function getAnalyticsProfiles(clientsObj, startDate, endDate) {
  var results = {}
  var accounts = Analytics.Management.Accounts.list();
  if (accounts.getItems()) {
    for(var l = 0; l < (accounts.getItems().length - 1); l++) {
      
      var AccountId = accounts.getItems()[l].getId();
      Logger.log("AccountId: "+ AccountId)
      var webProperties = Analytics.Management.Webproperties.list(AccountId);
      Utilities.sleep(1000) //to avoid quota limitations
      var subDomainMatch = getSubDomain(webProperties.items[0].websiteUrl)
      Logger.log("subDomainMatch: "+subDomainMatch)
      if (webProperties.getItems() && clientsObj.hasOwnProperty(subDomainMatch)) {
        Logger.log("l :"+l)
        Logger.log("webProperties: "+ JSON.stringify(webProperties))
        var WebPropertyId = webProperties.getItems()[0].getId();
        var profiles = Analytics.Management.Profiles.list(AccountId, WebPropertyId);
        
        
        var profileId = profiles.items[0].id
        
        if(profileId) {
          //add profile Id to the Forecast tab column "D" -> GA profileId
          
        }
        Logger.log("profileId: "+ profileId)
        
        //return false
        var profileReport = runReport(profileId, startDate, endDate)
        Logger.log("profileReport: "+ JSON.stringify(profileReport))
        //return false
        Utilities.sleep(1000)
        if (Object.keys(profileReport).length > 0) {
          //var firstProfile = profiles.getItems()[0];
          results[subDomainMatch] = profileReport;
          
        } else {
          Logger.log('No data (profiles) found for Id / website: '+ profileId +" / "+ subDomainMatch);
          Logger.log('--------------------------------------------');
          //return false
        }
      } else {
        Logger.log('No webproperties found for website: ' + subDomainMatch);
        
      }
      //break
    } //end for loop
  } else {
    Logger.log('No accounts found.');
    return false
  }
  
  return results
}


function runReport(profileId, startDate, endDate) {

  var tableId = 'ga:' + profileId;
  var metric = 'ga:goalCompletionsAll,ga:organicSearches';
  var options = {
    //'dimensions': 'ga:source,ga:keyword',
    //'sort': '-ga:visits,ga:source',
    //'filters': 'ga:medium==organic',
    //'max-results': 25
  };
  

  try {
    var report = Analytics.Data.Ga.get(tableId, startDate, endDate, metric,
                                       options);
    Logger.log("profileReport: "+ JSON.stringify(report))
    return report.totalsForAllResults
  } catch (e) {
    Logger.log("error message: "+ profileId + " , "+ e.message)
    var tesVal = {}
    tesVal['ga:goalCompletionsAll'] = 0
    tesVal['ga:organicSearches'] = 0
    return tesVal
  }
}


function revokeAccess() {
  var url = "https://accounts.google.com/o/oauth2/revoke?token=" + ScriptApp.getOAuthToken();
  var res = UrlFetchApp.fetch(url);
  Logger.log(res.getResponseCode());
}
