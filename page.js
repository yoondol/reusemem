const stages = {
  setup: {
    image: "assets/photo-07.jpg",
    alt: "Two closed cases have moved to new positions below the trays.",
    description: "The cases are now closed and have moved. Choose a request to see its outcome.",
  },
  usb: {
    image: "assets/photo-08.jpg",
    alt: "The closed black case that holds the USB drive is in the left tray.",
    description: "The earlier view of the contents identifies which closed case to move.",
  },
  sd: {
    image: "assets/photo-09.jpg",
    alt: "The black USB case is in the left tray and the silver SD card case is in the right tray.",
    description: "The same record identifies the case that contains the SD card.",
  },
  return: {
    image: "assets/photo-10.jpg",
    alt: "The black USB case is back in its original desk position. The silver case remains in the right tray.",
    description: "The robot returns the USB case from the tray to the position it saw before any request.",
  },
};
const stageButtons = document.querySelectorAll("[data-stage]");
const goalFrame = document.querySelector("#goal-frame");
const goalDescription = document.querySelector("#goal-description");

for (const button of stageButtons) {
  button.addEventListener("click", () => {
    const stage = stages[button.dataset.stage];
    goalFrame.src = stage.image;
    goalFrame.alt = stage.alt;
    goalDescription.textContent = stage.description;
    for (const choice of stageButtons) {
      choice.setAttribute("aria-pressed", String(choice === button));
    }
  });
}

// Add a relative video path, poster, and a caption for each available clip.
const media = {
  case: [],
  toy: [],
  simulation: [],
};

for (const slot of document.querySelectorAll("[data-media]")) {
  for (const clip of media[slot.dataset.media]) {
    const figure = document.createElement("figure");
    figure.className = "media";
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "none";
    video.src = clip.src;
    video.poster = clip.poster;
    video.setAttribute("aria-label", clip.caption);
    const caption = document.createElement("figcaption");
    caption.textContent = clip.caption;
    figure.append(video, caption);
    slot.append(figure);
  }
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
