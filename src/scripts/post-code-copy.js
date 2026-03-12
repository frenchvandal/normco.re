// @ts-check
(() => {
  const article = globalThis.document.querySelector(
    ".post-article[data-code-copy-label]",
  );

  if (!(article instanceof HTMLElement)) {
    return;
  }

  const codeBlocks = article.querySelectorAll(".post-content pre > code");

  if (codeBlocks.length === 0) {
    return;
  }

  const copyLabel = article.dataset.codeCopyLabel ?? "Copy code";
  const copyFeedback = article.dataset.codeCopyFeedback ?? "Code copied";
  const copyFailedFeedback = article.dataset.codeCopyFailedFeedback ??
    "Cannot copy code";
  const feedbackResetMs = 1800;
  let execCommandWriterPromise;

  function getExecCommandWriter() {
    if (execCommandWriterPromise !== undefined) {
      return execCommandWriterPromise;
    }

    // TODO(phiphi): [Carbon-P3] Remove execCommand fallback after clipboard API support baseline for site visitors reaches full parity in analytics.
    execCommandWriterPromise = import("/scripts/post-code-copy-exec-command.js")
      .then(({ writeWithExecCommand }) => {
        return typeof writeWithExecCommand === "function"
          ? writeWithExecCommand
          : undefined;
      })
      .catch(() => undefined);

    return execCommandWriterPromise;
  }

  async function copyText(text) {
    const clipboard = globalThis.navigator.clipboard;

    if (clipboard !== undefined && typeof clipboard.writeText === "function") {
      try {
        await clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to the lazy legacy fallback.
      }
    }

    const writeWithExecCommand = await getExecCommandWriter();
    return typeof writeWithExecCommand === "function" &&
      writeWithExecCommand(text);
  }

  for (const codeBlock of codeBlocks) {
    const pre = codeBlock.parentElement;

    if (!(pre instanceof HTMLElement)) {
      continue;
    }

    const codeText = codeBlock.textContent?.trim() ?? "";

    if (codeText.length === 0) {
      continue;
    }

    const copyButton = globalThis.document.createElement("cds-copy-button");
    copyButton.className = "post-code-copy-button";
    copyButton.setAttribute("feedback", copyFeedback);
    copyButton.setAttribute("feedback-timeout", String(feedbackResetMs));
    copyButton.textContent = copyLabel;
    pre.classList.add("post-code-copy-target");
    pre.before(copyButton);
    copyButton.addEventListener("click", () => {
      void copyText(codeText).then((copied) => {
        if (copied) {
          return;
        }

        copyButton.setAttribute("feedback", copyFailedFeedback);
        globalThis.setTimeout(() => {
          copyButton.setAttribute("feedback", copyFeedback);
        }, feedbackResetMs);
      });
    });
  }
})();
