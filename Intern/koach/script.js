document.addEventListener('DOMContentLoaded', () => {
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(accordion => {
        accordion.addEventListener('click', () => {
            const content = accordion.nextElementSibling;
            const isExpanded = accordion.getAttribute('aria-expanded') === 'true';

            // Close all other accordions (optional, but good for single-view focus)
            accordions.forEach(otherAccordion => {
                if (otherAccordion !== accordion) {
                    otherAccordion.setAttribute('aria-expanded', 'false');
                    otherAccordion.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle current accordion
            if (!isExpanded) {
                accordion.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                accordion.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null;
            }
        });
    });

    // Open the first accordion by default
    if (accordions.length > 0) {
        accordions[0].click();
    }
});
