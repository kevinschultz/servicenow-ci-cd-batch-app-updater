# ServiceNow CI/CD Batch App Updater

A two-script solution for batch updating ServiceNow applications using the CI/CD API. Mostly entirely generated through vibe coding with Gemini 3 Pro with Thinking, so use at your own risk! 🙂

## Overview

This toolset automates the process of updating multiple ServiceNow applications in a single batch operation, since the Application Manager doesn't offer the ability to update multiple apps in batch:

1. **Payload Generator** - Scans your instance for apps with available updates and generates the required JSON payload
2. **Batch Updater** - Executes the batch update using the ServiceNow CI/CD API

## Prerequisites

- Continuous Integration and Continuous Delivery (CICD) REST API application installed
- API user credentials with permissions to:
  - Read `sys_store_app` table
  - Execute CI/CD batch install operations
- Access to run background scripts in ServiceNow

## Usage

### Step 1: Generate Update Payload

1. Navigate to **System Definition > BS: Scripts - Background**
2. Paste the contents of `payload generator for app upgrade.js`
3. Click **Run script**
4. Copy the JSON output from the logs

### Step 2: Execute Batch Update

1. Open `upgrade apps and plugins cicd.js`
2. Update the configuration:
   ```javascript
   var API_USER = 'your_username';
   var API_PASS = 'your_password';
   ```
3. Paste the JSON payload from Step 1 into the `packagesList` array - note you may need to remove extra brackets / comments if you pasted the entire first script output. 
4. Navigate to **System Definition > BS: Scripts - Background**
5. Paste the modified script and click **Run script**
6. Click the tracker URL in the logs to monitor progress

## What It Does

### Payload Generator
- Queries all active apps in `sys_store_app`
- Compares installed version vs. latest available version
- Generates properly formatted JSON for the CI/CD batch API

### Batch Updater
- Constructs a batch install request
- Calls the `/api/sn_cicd/app/batch/install` endpoint
- Returns a tracker URL for monitoring the update process

## Example Output

After running the payload generator:
```json
[
  {
    "id": "abc123...",
    "type": "application",
    "requested_version": "2.1.0",
    "load_demo_data": false
  }
]
```

## Notes

- Updates are installed with `load_demo_data: false` by default
- The batch updater has a 60-second timeout per request
- Monitor the execution tracker for detailed progress and any errors
- Test in a sub-production environment first
- This assumes Basic Auth is ok for your use case - will require modification if not.

### ServiceNow Store Oddities

Just a warning that the script will skip / fail to install any updates that are not totally cleared to go as they would be in the Application Manager UI. The Store has all kinds of weird barriers with licensing, terms acceptance issues, etc. and if those aren't all squared away, the app can't be updated. There won't be any error logs for this - you'll just notice that when you check for updates on Application Manager after running (which you'd expected to be at zero) there will still be updates, but if you click into them you'll likely notice that there are some issues. Resolutions for these issues usually need to be done on the Store site itself, and then you have to wait a bit, re-sync instance with the store, then it will resolve. More info can be found in <a href="https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB2632787">this KB about the Store.</a>.

## API Reference

Uses ServiceNow's CI/CD API:
- Endpoint: `/api/sn_cicd/app/batch/install`
- Method: POST
- Authentication: Basic Auth

## Sources

I used a lot of guidance and information from this <a href="https://github.com/ServiceNow/sncicd-batch-install">official ServiceNow repo on CI/CD</a>.
