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

  const registeredSpacers = new Set();

  registeredSpacers.add({
    id: "main-home-content__spacer",
    nodeSelector: ".main-home-content",
    height: "8px",
    prepend: true
  });

  registeredSpacers.add({
    id: "main-yourLibraryX-libraryRootlist__spacer",
    nodeSelector: ".main-yourLibraryX-libraryRootlist",
    height: "100px",
    prepend: false
  });

  // Right sidebar (now playing, queue, etc.)
  registeredSpacers.add({
    id: "iHa_q9pq4un3VNRQgwTx__spacer",
    nodeSelector: ".iHa_q9pq4un3VNRQgwTx",
    height: "50px",
    prepend: false
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        for (const spacer of registeredSpacers) {
          if (node.matches?.(spacer.nodeSelector)) ensureContentSpacer(node, spacer.id, spacer.height, spacer.prepend);

          const innerNode = node.querySelector?.(spacer.nodeSelector);
          if (innerNode) ensureContentSpacer(innerNode, spacer.id, spacer.height, spacer.prepend);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  function ensureContentSpacer(node, id, height, prepend) {
    if (!node || node.querySelector(`#${id}`)) return;

    const spacer = document.createElement("div");
    spacer.id = id;
    spacer.style.height = height;
    spacer.style.flexShrink = "0";

    if (prepend) node.prepend(spacer);
    else node.appendChild(spacer);
  }
})();