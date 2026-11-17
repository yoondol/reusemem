const stages = {
  setup: {
    image: "assets/photo-07.jpg",
    alt: "The two closed cases have moved to new positions below the trays.",
    label: "Before the requests",
    description: "The cases are closed and moved. Their contents and original positions are only visible in the earlier record.",
  },
  usb: {
    image: "assets/photo-08.jpg",
    alt: "The closed black case that holds the USB drive is in the left tray.",
    label: "USB case in the left tray",
    description: "The earlier view of the contents identifies which closed case to move.",
  },
  sd: {
    image: "assets/photo-09.jpg",
    alt: "The USB case remains in the left tray and the SD card case is in the right tray.",
    label: "SD case in the right tray",
    description: "The same record identifies the other case by its contents.",
  },
  return: {
    image: "assets/photo-10.jpg",
    alt: "The USB case is back at its original desk position. The SD card case remains on the right tray.",
    label: "USB case back at its origin",
    description: "The robot takes the USB case from the tray and returns it to the position seen before any request.",
  },
};

const stageButtons = document.querySelectorAll("[data-stage]");
const goalFrame = document.querySelector("#goal-frame");
const goalLabel = document.querySelector("#goal-label");
const goalDescription = document.querySelector("#goal-description");

for (const button of stageButtons) {
  button.addEventListener("click", () => {
    const stage = stages[button.dataset.stage];
    goalFrame.src = stage.image;
    goalFrame.alt = stage.alt;
    goalLabel.textContent = stage.label;
    goalDescription.textContent = stage.description;
    for (const choice of stageButtons) {
      choice.setAttribute("aria-pressed", String(choice === button));
    }
  });
}

// Set an entry to a published relative MP4 path to activate that player.
const videoSources = {
  case: "",
  toy: "",
  button: "",
  order: "",
  swap: "",
  highlight: "",
};

for (const poster of document.querySelectorAll("[data-media]")) {
  const src = videoSources[poster.dataset.media];
  if (!src) continue;
  const image = poster.querySelector("img");
  const kind = poster.dataset.kind;
  const video = document.createElement("video");
  const title = poster.closest("article").querySelector("h3").textContent;
  video.controls = true;
  video.playsInline = true;
  video.preload = "none";
  video.poster = image.src;
  video.setAttribute("aria-label", title + " demonstration");
  video.addEventListener("error", () => {
    video.replaceWith(image);
    if (kind) poster.dataset.kind = kind;
  });
  video.src = src;
  image.replaceWith(video);
  delete poster.dataset.kind;
}

const copy = document.querySelector("#copy-citation");
if (navigator.clipboard) {
  copy.hidden = false;
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.querySelector("#bibtex").textContent);
      copy.textContent = "Copied";
      document.querySelector("#copy-status").textContent = "BibTeX copied.";
    } catch {
      copy.textContent = "Select BibTeX to copy";
    }
  });
}
