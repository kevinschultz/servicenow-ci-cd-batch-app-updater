// ==========================================
// CONFIGURATION
// ==========================================

var API_USER = 'USERNAME'; 
var API_PASS = 'PASSWORD'; 

// PASTE YOUR JSON HERE
var packagesList = [

];

var LOG_PREFIX = "[CICD-BATCH-V4] ";

// ==========================================
// LOGIC
// ==========================================
(function() {
    if (packagesList.length === 0) {
        gs.warn(LOG_PREFIX + "No packages provided.");
        return;
    }

    // 1. Construct the Root Payload
    // Matches the structure: { name, notes, packages: [] }
    var payload = {
        "name": "Batch Update - " + new GlideDateTime().getDisplayValue(),
        "notes": "Automated batch update via script",
        "packages": packagesList
    };

    try {
        var baseUrl = gs.getProperty('glide.servlet.uri'); 
        var endpoint = baseUrl + 'api/sn_cicd/app/batch/install';
        
        gs.info(LOG_PREFIX + "Sending Batch Request (" + packagesList.length + " items)...");

        var r = new sn_ws.RESTMessageV2();
        r.setHttpMethod('POST');
        r.setEndpoint(endpoint);
        r.setBasicAuth(API_USER, API_PASS);
        r.setRequestHeader("Content-Type", "application/json");
        r.setHttpTimeout(60000); // 60s timeout
        r.setRequestBody(JSON.stringify(payload));
        
        var response = r.execute();
        var httpStatus = response.getStatusCode();
        var body = response.getBody();

        // 2. Handle Response
        if (httpStatus >= 200 && httpStatus < 300) {
            gs.info(LOG_PREFIX + "SUCCESS: Batch Initiated (HTTP " + httpStatus + ")");
            
            try {
                var json = JSON.parse(body);
                
                // 3. Extract Tracker URL for monitoring
                if (json.result && json.result.links && json.result.links.progress) {
                     var trackerApiUrl = json.result.links.progress.url;
                     var trackerSysId = trackerApiUrl.split('/').pop();
                     
                     gs.info(LOG_PREFIX + "==============================================");
                     gs.info(LOG_PREFIX + ">>> TRACKER URL (Click to Watch):");
                     gs.info(LOG_PREFIX + baseUrl + "sys_execution_tracker.do?sys_id=" + trackerSysId);
                     gs.info(LOG_PREFIX + "==============================================");
                } else {
                     gs.warn(LOG_PREFIX + "No tracker link found in response. Check 'sys_execution_tracker' table manually.");
                }
            } catch(e) {
                gs.info(LOG_PREFIX + "Raw Response: " + body);
            }
        } else {
            gs.error(LOG_PREFIX + "FAILED: HTTP " + httpStatus);
            gs.error(LOG_PREFIX + "Response: " + body);
        }

    } catch (ex) {
        gs.error(LOG_PREFIX + "Script Error: " + ex.message);
    }
})();