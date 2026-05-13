document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("nav");

    navToggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });


    const yearEl = document.getElementById("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }


    // Back to top button 
    const sentinel = document.getElementById("top-sentinel");
    const backToTopBtn = document.getElementById("back-to-top-button");

    if (sentinel && backToTopBtn) {
        const observer = new IntersectionObserver(([entry]) => {
            backToTopBtn.classList.toggle("visible", !entry.isIntersecting);
        });

        observer.observe(sentinel);

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});
