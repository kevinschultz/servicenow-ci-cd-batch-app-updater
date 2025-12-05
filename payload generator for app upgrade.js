(function() {
    var packages = [];
    
    gs.info("--- SCANNING FOR UPDATES ---");
    
    var grApp = new GlideRecord('sys_store_app');
    grApp.addQuery('active', true);
    grApp.query();

    while (grApp.next()) {
        var installed = grApp.getValue('version');
        var available = grApp.getValue('latest_version');
        
        // Check if update is needed
        if (available && installed != available) {
            
            // CONSTRUCT PACKAGE OBJECT
            // Using the schema found in your research
            packages.push({
                "id": grApp.getUniqueValue(),       // Send Sys ID
                "type": "application",              // Type is always application
                "requested_version": available,     // <--- THE KEY FIX
                "load_demo_data": false             // Good practice to be explicit
            });
        }
    }

    gs.info("Found " + packages.length + " apps to update.");
    gs.info("--- COPY THE JSON BELOW ---");
    gs.info(JSON.stringify(packages, null, 2));
    gs.info("--- END JSON ---");
})();