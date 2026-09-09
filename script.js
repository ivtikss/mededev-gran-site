(() => {
  const navigation = document.querySelector("[data-screen-nav]");

  if (!navigation) {
    return;
  }

  const marks = Array.from(
    navigation.querySelectorAll("[data-screen-nav-mark]"),
  );
  const sections = marks
    .map((mark) => document.querySelector(mark.getAttribute("href")))
    .filter(Boolean);
  const indicator = navigation.querySelector("[data-screen-nav-indicator]");

  if (!indicator || sections.length !== marks.length) {
    return;
  }

  let framePending = false;
  let activeIndex = -1;

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateNavigation = () => {
    const sectionPositions = sections.map(
      (section) => section.getBoundingClientRect().top + window.scrollY,
    );
    const markerPositions = marks.map(
      (mark) => mark.offsetTop + mark.offsetHeight / 2,
    );
    const scrollPosition = window.scrollY;
    let previousIndex = 0;

    for (let index = 0; index < sectionPositions.length - 1; index += 1) {
      if (scrollPosition >= sectionPositions[index + 1]) {
        previousIndex = index + 1;
      } else {
        break;
      }
    }

    const nextIndex = Math.min(previousIndex + 1, sections.length - 1);
    const sectionDistance =
      sectionPositions[nextIndex] - sectionPositions[previousIndex];
    const progress =
      sectionDistance > 0
        ? clamp(
            (scrollPosition - sectionPositions[previousIndex]) / sectionDistance,
            0,
            1,
          )
        : 0;
    const indicatorPosition =
      markerPositions[previousIndex] +
      (markerPositions[nextIndex] - markerPositions[previousIndex]) * progress;
    const routeProgress =
      sections.length > 1
        ? (previousIndex + progress) / (sections.length - 1)
        : 0;
    const nextActiveIndex = progress >= 0.5 ? nextIndex : previousIndex;

    navigation.style.setProperty(
      "--screen-nav-indicator-y",
      `${indicatorPosition}px`,
    );
    navigation.style.setProperty(
      "--screen-nav-progress",
      routeProgress.toString(),
    );

    if (nextActiveIndex !== activeIndex) {
      marks.forEach((mark, index) => {
        const isActive = index === nextActiveIndex;

        mark.classList.toggle("is-active", isActive);

        if (isActive) {
          mark.setAttribute("aria-current", "page");
        } else {
          mark.removeAttribute("aria-current");
        }
      });

      activeIndex = nextActiveIndex;
    }
  };

  const scheduleNavigationUpdate = () => {
    if (framePending) {
      return;
    }

    framePending = true;
    window.requestAnimationFrame(() => {
      updateNavigation();
      framePending = false;
    });
  };

  window.addEventListener("scroll", scheduleNavigationUpdate, {
    passive: true,
  });
  window.addEventListener("resize", scheduleNavigationUpdate);
  window.addEventListener("load", scheduleNavigationUpdate, { once: true });
  scheduleNavigationUpdate();
})();
