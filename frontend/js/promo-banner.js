// Front page banner for the printable "Akuutin obstruktion hoito lapsilla" guide.
// Shown until the user closes it; the choice is remembered in localStorage.
// To retire the banner, remove the #promo-banner section from index.html and this script tag.

const STORAGE_KEY = 'promo-obstruction-dismissed';

function isDismissed() {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('promo-banner');
    if (!banner || isDismissed()) return;

    const main = banner.closest('.search-main');
    banner.hidden = false;
    main?.classList.add('has-promo');

    document.getElementById('promo-banner-close')?.addEventListener('click', () => {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // storage unavailable: the banner just comes back on the next visit
        }
        banner.remove();
        main?.classList.remove('has-promo');
    });
});
