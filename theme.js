(function bloom() {

  /* == Utility functions == */
  function waitForElements(elementSelectors, func, attempts = 50) {
    const queries = elementSelectors.map((elementSelector) => document.querySelector(elementSelector));

    if (queries.every((element) => element)) {
      func(queries);
      return;
    }

    if (attempts <= 0) return;
    setTimeout(waitForElements, 100, elementSelectors, func, attempts - 1);
  }

  function ensureContentSpacer(node, id, height, prepend, waitForSelector, attempts = 50) {
    if (!node) return;

    const existingSpacer = node.querySelector(`#${id}`);
    if (existingSpacer) {
      existingSpacer.style.height = height;
      return;
    }

    if (waitForSelector) {
      const waitForNode = node.querySelector(waitForSelector);

      if (!waitForNode) {
        if (attempts <= 0) return;

        setTimeout(ensureContentSpacer, 100, node, id, height, prepend, waitForSelector, attempts - 1);
        return;
      }
    }

    const spacer = document.createElement("div");
    spacer.id = id;
    spacer.style.height = height;
    spacer.style.flexShrink = "0";

    if (prepend) node.prepend(spacer);
    else node.appendChild(spacer);
  }

  /* == Init == */
  waitForElements(
    // Move the 'Home' button from the left of the search bar to the other nav elements on the left
    [".main-globalNav-searchContainer button", ".main-globalNav-historyButtons"],
    ([searchButton, navLinksContainer]) => navLinksContainer.appendChild(searchButton)
  );

  waitForElements(
    [".Root__now-playing-bar", ".Root__main-view"],
    ([_, mainView]) => {
      alignNowPlayingBar();
      new ResizeObserver(() => {
        alignNowPlayingBar();
        alignNotificationContainer();
      }).observe(mainView);
    }
  );

  const alignNowPlayingBar = () => {
    // Move the now playing bar to align with the main content instead of being full width
    const nowPlayingBar = document.querySelector(".Root__now-playing-bar");
    const mainView = document.querySelector(".Root__main-view");

    if (!nowPlayingBar || !mainView) return;

    nowPlayingBar.style.width = `calc(${mainView.clientWidth}px - calc(var(--now-playing-bar-margin) * 2))`;
    nowPlayingBar.style.left = `calc(${mainView.getBoundingClientRect().left}px + var(--now-playing-bar-margin) - var(--panel-gap))`;
  };

  const alignNotificationContainer = () => {
    // Move the notification container to be above the now playing bar and aligned with the main content
    const notificationContainer = document.querySelector(".notistack-SnackbarContainer");
    const nowPlayingBar = document.querySelector(".Root__now-playing-bar");

    if (!notificationContainer || !nowPlayingBar) return;

    notificationContainer.style.left = `calc(${nowPlayingBar.getBoundingClientRect().left}px)`;
    notificationContainer.style.bottom = `calc(${nowPlayingBar.clientHeight}px + var(--now-playing-bar-margin))`;
  };

  /* == Content spacers == */
  const registeredSpacers = new Set();

  registeredSpacers.add({
    id: "main-home-content__spacer",
    nodeSelector: ".main-home-content",
    height: "8px",
    prepend: true,
    waitForSelector: undefined
  });

  registeredSpacers.add({
    id: "main-view-container__scroll-node-child__spacer",
    nodeSelector: ".main-view-container__scroll-node-child > main > section",
    height: "100px",
    prepend: false,
    waitForSelector: ".main-view-container__scroll-node-child > main > section > div:not(.main-loadingPage-container)"
  });

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (node.matches(".notistack-SnackbarContainer")) alignNotificationContainer();

        for (const spacer of registeredSpacers) {
          if (node.matches?.(spacer.nodeSelector)) ensureContentSpacer(node, spacer.id, spacer.height, spacer.prepend, spacer.waitForSelector);

          const innerNode = node.querySelector?.(spacer.nodeSelector);
          if (innerNode) ensureContentSpacer(innerNode, spacer.id, spacer.height, spacer.prepend, spacer.waitForSelector);
        }
      }
    }
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
})();