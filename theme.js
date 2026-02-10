(function bloom() {

  function waitForElements(elementSelectors, func, attempts = 50) {
    const queries = elementSelectors.map((elementSelector) => document.querySelector(elementSelector));

    if (queries.every((element) => element)) {
      func(queries);
      return;
    }

    if (attempts > 0) {
      setTimeout(waitForElements, 200, elementSelectors, func, attempts - 1);
    }
  }

  waitForElements(
    // Move the 'Home' button from the left of the search bar to the other nav elements on the left
    [".main-globalNav-searchContainer button", ".main-globalNav-historyButtons"],
    ([searchButton, navLinksContainer]) => navLinksContainer.appendChild(searchButton)
  );

  const MHC_SPACER_ID = "main-home-content__top-spacer";

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (node.matches?.(".main-home-content")) {
          ensureMainHomeContentSpacer(node);
          continue;
        }

        const inner = node.querySelector?.(".main-home-content");
        if (inner) ensureMainHomeContentSpacer(inner);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  function ensureMainHomeContentSpacer(node) {
    if (!node || node.querySelector(`#${MHC_SPACER_ID}`)) return;

    const spacer = document.createElement("div");
    spacer.id = MHC_SPACER_ID;
    spacer.style.height = "8px";
    spacer.style.flexShrink = "0";

    node.prepend(spacer);
    console.debug("Added main home content spacer");
  }
})();