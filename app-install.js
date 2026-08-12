// This site is a marketing page, not the app. Chromium browsers would otherwise
// offer to "install" it to the home screen, which gives people a shortcut to a
// website instead of the real Android/iOS app. The manifest opts out via
// display: browser + prefer_related_applications; the listener below is the
// belt-and-braces version for browsers that still fire the event.
//
// The browser's own prompt can only ever install this page, so in its place we
// show our own bar that goes to the store the visitor's phone actually uses.
// iOS Safari already gets that from the apple-itunes-app Smart App Banner, so it
// is skipped there.
(function () {
  var PLAY_URL = "https://play.google.com/store/apps/details?id=com.mkhakpaki.dodast";
  var APP_STORE_URL = "https://apps.apple.com/app/id6790904205";
  var DISMISS_KEY = "dodast.app-bar.dismissed";

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
  });

  var ua = navigator.userAgent || "";
  var isAndroid = /Android/i.test(ua);
  // iPadOS 13+ masquerades as Mac; treat touch-capable Macs as iPad.
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && "ontouchend" in document);
  // Safari on iOS shows the Smart App Banner instead — no second bar there.
  var isIOSSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  if ((!isAndroid && !isIOS) || isIOSSafari) return;

  function dismissed() {
    try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch (e) { /* private mode */ }
  }

  if (dismissed()) return;

  function build() {
    var storeUrl = isAndroid ? PLAY_URL : APP_STORE_URL;
    var storeName = isAndroid ? "Google Play" : "the App Store";
    // Each store's own word for the button, so it reads native on both.
    var verb = isAndroid ? "Install" : "Get";

    var bar = document.createElement("div");
    bar.className = "app-bar";
    bar.setAttribute("role", "complementary");
    bar.setAttribute("aria-label", "Get the dodast app");
    bar.innerHTML =
      '<img class="app-bar-icon" src="icon-192.png" alt="" width="40" height="40">' +
      '<div class="app-bar-text">' +
        '<strong>dodast — free</strong>' +
        '<span>Your music, in every room</span>' +
      '</div>' +
      '<a class="btn btn-primary app-bar-cta" href="' + storeUrl + '"' +
        ' aria-label="' + verb + ' dodast from ' + storeName + '">' + verb + '</a>' +
      '<button class="app-bar-close" type="button" aria-label="Dismiss">&times;</button>';

    bar.querySelector(".app-bar-close").addEventListener("click", function () {
      bar.remove();
      document.documentElement.classList.remove("has-app-bar");
      remember();
    });

    document.body.appendChild(bar);
    document.documentElement.classList.add("has-app-bar");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
