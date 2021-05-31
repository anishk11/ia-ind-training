// Ruleset key
var rulesetKey = null;


jq(document).ready(function() {
    jq.Topic('viewTabChanged')
        .subscribe(function(oldTabId, newTabId) {
            AcctReconFlexTab.viewTabChanged(oldTabId, newTabId);
        });
});

    /**
 * Reconciliation Grid for selected row information server-side. When records are loaded, any selection is applied
 * before responding to the client.
 *
 * @type {{_posted: number, reset: AcctReconGrid.reset,
 * selectedChanged: AcctReconGrid.selectedChanged, payNowChanged: AcctReconGrid.payNowChanged,
 * selectAll: AcctReconGrid.selectAll, clearAll: AcctReconGrid.clearAll, gridPaging: AcctReconGrid.gridPaging,
 * updateTotals: AcctReconGrid.updateTotals}}
 */
var AcctReconFlexTab = window.AcctReconFlexTab ||
    {
        viewTabChanged: function(oldTabId, newTabId) {
            // Populate the data based on the tab IDs
            if(newTabId == 'intactTxnsTab') {
                toggleTransactionsView("true");
            } else {
                toggleTransactionsView("false");
            }
        }
    };

/**
 * Ajax method to save the reconciliation.
 *
 * @param doContinue
 */
function saveReconciliation(doContinue, report) {
    window.editor.showLoadingBar();
    doReport = report;
    var args = getQueryArgs(++window.AcctReconGrid._posted, null, null);
    invokeAjaxFunction('saveReconciliation', args, c_saveReconciliation, doContinue);
}

/**
 * Call back function for saving reconciliation
 *
 * @param values
 */
function c_saveReconciliation(values, doContinue) {

    window.editor.hideLoadingBar();
    if(values && processResponse(values)) {
        // For report, open with the url
        if(values['doReport']) {
            launchReport(values['REPORTURL']);
        }
        // If not save and continue, show the landing page
        else if(doContinue == false) {
            alert(values['MSG']);
            window.editor.submit(true, 'saverecon');
        }
    }
}

/**
 * Launches the report with given url.
 *
 * @param script
 */
function launchReport(script) {
    Launch(script, 'Report', 800, 550);
}

/**
 * Launches the initial open item lister.
 */
function launchInitialOpenItems() {
    if(ioitemUrl) {
        Launch(ioitemUrl, 'Initial_Open_Items', 800, 500);
    } else {
        alert(_('Initial open item link not available, please try again later'));
    }
}

/**
 * Opens to edit the reconciliation input page.
 */
function editReconciliation() {

    window.editor.showPage('BANKRECONINPUTPAGE', this);
    // Make the bank input disabled
    var fieldObj = window.editor.view.getField('FINANCIALENTITY');
    if(fieldObj) {
        fieldObj.updateProperty('disabled', true, true);
    }
}

/**
 * Opens to edit the reconciliation input page.
 */
function uploadFiles(fieldmeta) {

    // Validate the account
    if(!getFieldValue('FINANCIALENTITY')) {
        alert(_('Please select the financial account before uploading the files'));
        return;
    }
    window.editor.showPage('BANKFILEUPLOADPAGE', this);
    var grid = getGrid('BANKTXNFILES');
    if(grid) {
        //grid.setValue(fileUploads ? fileUploads : {0 : {__dummy: "", _isNewLine : true}});
        grid.setValue(fileUploads);
        grid.redraw();

    }
    addFileUploadEventListener();
    // Make the bank input disabled
    // var fieldObj = window.editor.view.getField('FINANCIALENTITY');
    // if(fieldObj) {
    //     fieldObj.updateProperty('disabled', true, true);
    // }
}

/**
 * Method to open match attributes.
 */
function openMatchRules() {

    if (!rulesetKey) {
        alert(_('Associate a matching rule set to this account before reconciling with an import or bank feeds.'));
        return;
    }

    window.editor.showLoadingBar();
    var args = {
        'RULESETKEY' : rulesetKey
    };
    invokeAjaxFunction('getexistingruleseturl', args, c_openMatchRules);
}

/**
 * Ajax response method to open match attributes.
 */
function c_openMatchRules(data) {

    window.editor.hideLoadingBar();
    if ( data['URL'] ) {
        Launch(data['URL'], 'Details', 800, 600);
    }
}

/**
 * Prcesses the more action button based on the account and date selection.
 *
 * @param moreActionButtons
 */
function processMoreActionButtons(moreActionButtons) {
    if(moreActionButtons) {
        // Iterate each more action buttons hide based on the result
        var buttons = window.editor.getView().stdButtons.buttons;
        if(buttons) {
            for (var btn = 0; btn < buttons.length; btn++) {
                // Only create more action buttons
                if(buttons[btn].inMoreActions && buttons[btn].action == 'create') {
                    // If button not present in the retrieved list, then hide them
                    if (!moreActionButtons[buttons[btn].id]) {
                        var button = jq("#" + buttons[btn].id);
                        button.hide();
                    }
                }
            }
        }
    }
}

/**
 * Method to process the more action url. This method will replace the attributes with real time value before
 * processing.
 *
 * @param url
 */
function processMoreActionURL(url) {
    if(url) {
        // Replace the recon date and acctid params with actual data from the page
        url = url.replace('STMTENDINGDATE', getFieldValue('STMTENDINGDATE'));
        url = url.replace('ACCTID', getID(getFieldValue('FINANCIALENTITY')));
        Launch(url, _('Details'), 800, 600);
    }
}

/**
 * Downloads the csv file template for import.
 *
 * @returns {boolean}
 */
function downLoadCSVFile() {
    var URL = "autobnkr.phtml?.sess="+gSess+"&.op=1316&.downloadcsvfile=true";
    var params = "width=640,status=yes,height=340,scrollbars=no,dependent,left=100,top=100";
    var wname = _('Template');
    var hWnd = window.open(URL, wname, params);
    if (hWnd == null) {return;}
    if (hWnd.opener == null) {
        hWnd.opener = self;
        window.name = "cmu";
    }
    hWnd.focus();
    return true;
}

/**
 * @param arguments
 *
 * @returns array
 */
function mergeObjects(arguments) {
    var resObj = {};
    if (arguments) {
        for (var i = 0; i < arguments.length; i += 1) {
            var obj = arguments[i],
                keys = Object.keys(obj);
            for (var j = 0; j < keys.length; j += 1) {
                resObj[keys[j]] = obj[keys[j]];
            }
        }
    }
    return resObj;
}
