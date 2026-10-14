
class ImageSlider {
  constructor(root) {
    this.root = root;
    this.viewport = root.querySelector(".slider-viewport");
    this.track = root.querySelector(".slider-track");
    this.prevButton = root.querySelector(".prev");
    this.nextButton = root.querySelector(".next");
    this.dotsContainer = root.querySelector(".slider-dots");
    this.counter = root.querySelector(".slide-counter");

    this.originalSlides = Array.from(this.track.children);
    this.total = this.originalSlides.length;

    if (this.total === 0) return;

    this.index = 0;
    this.position = 1;
    this.isAnimating = false;
    this.duration = 500;

    // Clone the boundary slides for a seamless loop.
    const firstClone = this.originalSlides[0].cloneNode(true);
    const lastClone =
      this.originalSlides[this.total - 1].cloneNode(true);

    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");

    this.track.prepend(lastClone);
    this.track.append(firstClone);

    this.createDots();
    this.bindEvents();
    this.update(false);

    // Keep slide widths aligned with the responsive viewport.
    window.addEventListener("resize", () => this.update(false));
  }

  createDots() {
    this.dotsContainer.innerHTML = "";

    this.originalSlides.forEach((slide, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);

      dot.addEventListener("click", () => {
        if (index !== this.index && !this.isAnimating) {
          this.goTo(index);
        }
      });

      this.dotsContainer.appendChild(dot);
    });

    this.dots = Array.from(this.dotsContainer.children);
  }

  bindEvents() {
    this.nextButton.addEventListener("click", () => this.next());
    this.prevButton.addEventListener("click", () => this.previous());

    this.track.addEventListener("transitionend", (event) => {
      if (event.target !== this.track ||
          event.propertyName !== "transform") return;

      // If positioned on a clone, jump to the original without animation.
      if (this.position === this.total + 1) {
        this.position = 1;
        this.update(false);
      } else if (this.position === 0) {
        this.position = this.total;
        this.update(false);
      }

      this.isAnimating = false;
    });

    // Basic keyboard navigation when the slider has focus.
    this.root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") this.next();
      if (event.key === "ArrowLeft") this.previous();
    });
  }

  update(animate = true) {
    this.track.style.transition = animate
      ? `transform ${this.duration}ms ease-in-out`
      : "none";

    const slideWidth = this.viewport.clientWidth;
    this.track.style.transform =
      `translateX(-${this.position * slideWidth}px)`;

    this.dots.forEach((dot, index) => {
      const active = index === this.index;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });

    this.counter.textContent =
      `${this.index + 1} / ${this.total}`;
  }

  goTo(index) {
    if (this.isAnimating || index < 0 || index >= this.total) {
      return;
    }

    this.isAnimating = true;
    this.index = index;
    this.position = index + 1;
    this.update(true);
  }

  next() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.index = (this.index + 1) % this.total;
    this.position += 1;
    this.update(true);
  }

  previous() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.index = (this.index - 1 + this.total) % this.total;
    this.position -= 1;
    this.update(true);
  }
}

document.querySelectorAll(".slider").forEach((slider) => {
  new ImageSlider(slider);
});
