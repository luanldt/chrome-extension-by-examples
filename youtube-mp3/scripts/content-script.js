//// content-script.js ////

console.log({ search: window.location.search });

function getBackgroundImages() {
  const currentSearch = window.location.search;
  let start = currentSearch.indexOf("?v=");
  if (start === -1) return;

  let videoId = currentSearch.substring(start + 3);

  let end = currentSearch.indexOf("&");
  if (end !== -1) {
    videoId = currentSearch.substring(start + 3, end);
  }

  const imageUrls = [
    "maxresdefault",
    "sddefault",
    "hqdefault",
    "mqdefault",
    "0",
  ].map((resolution) => {
    return `https://img.youtube.com/vi/${videoId}/${resolution}.jpg`;
  });

  console.log({ videoId, imageUrls });

  return imageUrls;
}

function setBackgroundImage(videoElement, backgroundUrl) {
  videoElement.style.background = `transparent url(${backgroundUrl}) no-repeat center / cover`;
}

function findCurrentVideoElement() {
  let videoElements = window.document.getElementsByTagName("video");
  const videoElement = videoElements[0];

  if (!videoElement) {
    console.log("Youtube MP3 - Video element not found in this page.");
    return;
  }

  const videoRect = videoElement.getBoundingClientRect();
  if (videoRect.width === 0 && videoElement.height === 0) {
    console.log("Youtube MP3 - Video element not visible.");
    return;
  }

  console.log({ videoElement, videoRect });

  return videoElement;
}

function buildSetAudioURL(videoElement, url) {
  console.log({ url });
  function setAudioURL() {
    console.log("onloadeddata");
    if (url === "" || videoElement.src === url) {
      return;
    }

    videoElement.pause();
    videoElement.src = url;
    videoElement.currentTime = 0;
    videoElement.play();
  }

  return setAudioURL;
}


function showBadgeYoutubeMP3(videoElement) {
    if (document.getElementsByClassName('badge_youtube_mp3').length > 0) return
    const badge = document.createElement('div')
    badge.className = 'badge_youtube_mp3'

    const badgeTitle = document.createElement('p')
    badgeTitle.textContent = 'Youtube MP3 🎵 is currently working...'


    const badgeInstruction = document.createElement('p')
    badgeInstruction.textContent = 'To watch video just click on the extension icon and refresh your page'

    badge.appendChild(badgeTitle)
    badge.appendChild(badgeInstruction)

    const parent = videoElement.parentNode
    if (parent) {
        parent.appendChild(badge)
    }
}

function removeBadgeYoutubeMP3() {
    const elements = document.getElementsByClassName('badge_youtube_mp3');
    if (!elements.length) return;
    Array.from(elements).forEach(function(element) {
      element.remove();
    });
  }

chrome.runtime.onMessage.addListener((request) => {
  const { url } = request;

  const videoElement = findCurrentVideoElement();
  if (videoElement) {

    videoElement.onloadeddata = buildSetAudioURL(videoElement, url);

    if (url) {
        const backgroundImages = getBackgroundImages();
        setBackgroundImage(videoElement, backgroundImages[0]);
        showBadgeYoutubeMP3(videoElement)
    } else {
        removeBadgeYoutubeMP3()
    }
  }
});
