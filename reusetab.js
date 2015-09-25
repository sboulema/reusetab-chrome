function log(line) {
  //console.log("Reuse Tab: " + line);
}

var tabsToWatch = [];

function onUriKnown(newTab) {
  if (newTab.pinned) return;
  var url = newTab.url;
  var host = parseUri(url).host;
  if (host !== "localhost") return;
  chrome.tabs.query({"pinned": false}, function(pinnedTabs) {
    var matchedTab = _.find(pinnedTabs, function(pinnedTab) {
      return parseUri(pinnedTab.url).host === host;
    });
    log(matchedTab);
    if (!matchedTab) return;
    if (matchedTab.id === newTab.id) return;
    chrome.tabs.update(matchedTab.id, {"url": url, "active": true});
    chrome.tabs.remove(newTab.id);
    // make sure the new window is focused. on my version of chrome,
    // this happens automatically. perhaps on older versions it
    // does not, though.
    chrome.windows.update(matchedTab.windowId, {"focused": true});
  });
}


function onTabCreated(newTab) {
  var url = newTab.url;
  if (url) {
    log("Opening " + url);
    onUriKnown(newTab);
  } else {
    tabsToWatch.push(newTab.id);
  }
}

function onTabUpdated(id, change, tab) {
  log("Updating: " + tab.url);
  if (change.url) {
    var i = tabsToWatch.indexOf(id);
    if (i >= 0) {
      tabsToWatch.splice(i, 1);
      onUriKnown(tab);
    }
  }
}

chrome.tabs.onCreated.addListener(onTabCreated);
chrome.tabs.onUpdated.addListener(onTabUpdated);

