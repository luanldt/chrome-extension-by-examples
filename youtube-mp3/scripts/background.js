// chrome.tabs.onUpdated.addListener((tabId) => {
//     chrome.tabs.sendMessage(tabId, {
//         data: 'abc'
//     })
// })

const tabIds = {};

function removeURLParameters(url, parameters) {
  const urlParts = url.split("?");
  if (urlParts.length < 2) return;

  let currentParameters = urlParts[1].split(/[&;]/g);
  const encodedParameters = parameters.map(
    (para) => `${encodeURIComponent(para)}=`
  );
  const filteredParameters = currentParameters.filter(
    (p) => !encodedParameters.some((enc) => p.startsWith(enc))
  );

  return `${urlParts[0]}?${filteredParameters.join("&")}`;
}

function sendMessage(tabId) {
  if (!tabIds[tabId]) return;
  chrome.tabs.sendMessage(tabId, {
    url: tabIds[tabId],
  });
}

function processRequest(detail) {
  // console.log({detail})
  const { tabId, url } = detail;

  // ignore url without mime=audio
  if (!url.includes("mime=audio")) {
    return;
  }

  if (url.includes("live=1")) {
    return;
  }

  const paramsBeRemoved = ["range", "rn", "rbuf"];
  const audioURL = removeURLParameters(url, paramsBeRemoved);

  // storage audio url for every tabs
  if (audioURL && tabIds[tabId] !== audioURL) {
    tabIds[tabId] = audioURL;
    sendMessage(tabId);
  }
}

function enableExtension() {
  chrome.action.setIcon({
    path: {
      16: "/images/16.png",
      24: "/images/24.png",
    },
  });

  chrome.tabs.onUpdated.addListener(sendMessage);
  chrome.webRequest.onBeforeRequest.addListener(processRequest, {
    urls: ["<all_urls>"],
  });
}

function disableExtension() {
  chrome.action.setIcon({
    path: {
      16: "/images/disabled_16.png",
      24: "/images/disabled_24.png",
    },
  });

  chrome.tabs.onUpdated.removeListener(sendMessage);
  chrome.webRequest.onBeforeRequest.removeListener(processRequest);
}

function saveStatus(disabled) {
  chrome.storage.local.set({ youtube_mp3_enabled: disabled });
}

chrome.storage.local.get("youtube_mp3_enabled", (values) => {
  const enabled = values.youtube_mp3_enabled;

  enabled ? enableExtension() : disableExtension();

  saveStatus(!enabled);
});

chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get("youtube_mp3_enabled", (values) => {
    const enabled = values.youtube_mp3_enabled;

    enabled ? enableExtension() : disableExtension();

    saveStatus(!enabled);
  });

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
      url: "*://*.youtube.com/*",
    },
    (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
      }
    }
  );
});
