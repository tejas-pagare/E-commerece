(function () {
  try {
    if (typeof io === "undefined") {
      return;
    }

    const socket = io();

    socket.on("backend-updated", (payload) => {
      if (!payload || !payload.method) return;
      // Avoid refresh loops for the current request by delaying slightly
      setTimeout(() => {
        window.location.reload();
      }, 150);
    });
  } catch (err) {
    // Silent fail to avoid breaking pages
  }
})();
