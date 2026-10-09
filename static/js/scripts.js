
const content_dir = 'contents/'
const config_file = 'config.yml'

const allowedUrlProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
const configOnlyKeys = ['nav', 'sections', 'backgrounds', 'background-interval-ms', 'background-overlay', 'logo', 'contact-form-email', 'contact-form-subject'];

function stringifyValue(value) {
    return value == null ? '' : value.toString();
}

function decodeText(value) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = String(value);
    return textarea.value;
}

function setElementValue(element, value) {
    if (value && typeof value === 'object') {
        if ('text' in value) {
            element.textContent = decodeText(value.text);
        }
        if ('href' in value && element instanceof HTMLAnchorElement) {
            element.href = value.href;
        }
        return;
    }

    element.textContent = decodeText(value);
}

function renderNavigation(navItems) {
    const navbarItems = document.getElementById('navbar-items');
    if (!navbarItems || !Array.isArray(navItems)) {
        return;
    }

    navbarItems.replaceChildren();

    navItems.forEach((item) => {
        if (!item || !item.text || !item.href) {
            return;
        }

        const listItem = document.createElement('li');
        const link = document.createElement('a');

        listItem.className = 'nav-item';
        link.className = 'nav-link me-lg-3';
        link.href = item.href;
        link.textContent = decodeText(item.text);

        listItem.appendChild(link);
        navbarItems.appendChild(listItem);
    });
}

function normalizeSections(sections) {
    if (!Array.isArray(sections)) {
        return [];
    }

    return sections
        .map((section) => {
            if (typeof section === 'string' && section.trim() !== '') {
                return {
                    id: section,
                    nav: section.toUpperCase(),
                    href: '#' + section,
                };
            }

            if (!section || typeof section !== 'object' || !section.id) {
                return null;
            }

            return {
                id: section.id,
                nav: section.nav || section.text || section.id.toUpperCase(),
                title: section.title || section.heading || section.nav || section.text || section.id.toUpperCase(),
                icon: section.icon || '',
                href: section.href || '#' + section.id,
            };
        })
        .filter(Boolean);
}

function getNavigationItems(yml) {
    const sections = normalizeSections(yml.sections);
    if (sections.length > 0) {
        return sections.map((section) => ({
            text: section.nav,
            href: section.href,
        }));
    }

    return Array.isArray(yml.nav) ? yml.nav : [];
}

function activateScrollSpy() {
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }
}

function bindResponsiveNavbar() {
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );

    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
}

function renderSections(sections) {
    const sectionsContainer = document.getElementById('sections');
    if (!sectionsContainer) {
        return;
    }

    sectionsContainer.replaceChildren();

    sections.forEach((section, index) => {
        const sectionElement = document.createElement('section');
        const container = document.createElement('div');
        const header = document.createElement('header');
        const title = document.createElement('h2');
        const body = document.createElement('div');

        sectionElement.id = section.id;
        sectionElement.className = [
            index % 2 === 0 ? 'bg-gradient-primary-to-secondary-light' : 'bg-gradient-primary-to-secondary-gray',
        ].join(' ');

        container.className = 'container px-5';

        if (section.titleId) {
            title.id = section.titleId;
        }

        if (section.icon) {
            const icon = document.createElement('i');
            icon.classList.add('bi', section.icon);
            title.appendChild(icon);
            title.appendChild(document.createTextNode('\u00a0'));
        }

        title.appendChild(document.createTextNode(decodeText(section.title)));
        body.className = 'main-body';
        body.id = section.id + '-md';

        header.appendChild(title);
        container.appendChild(header);
        container.appendChild(body);
        sectionElement.appendChild(container);
        sectionsContainer.appendChild(sectionElement);
    });
}

function normalizeBackgrounds(backgrounds) {
    if (Array.isArray(backgrounds)) {
        return backgrounds.filter((background) => typeof background === 'string' && background.trim() !== '');
    }

    if (typeof backgrounds === 'string' && backgrounds.trim() !== '') {
        return [backgrounds];
    }

    return [];
}

function chooseInitialBackgroundIndex(backgroundCount) {
    if (!Number.isFinite(backgroundCount) || backgroundCount <= 1) {
        return 0;
    }

    return Math.floor(Math.random() * backgroundCount);
}

window.chooseInitialBackgroundIndex = chooseInitialBackgroundIndex;

function initBackgroundSlideshow(yml) {
    const backgrounds = normalizeBackgrounds(yml.backgrounds);
    const layers = [...document.querySelectorAll('.top-section-bg')];
    const interval = Number(yml['background-interval-ms']) || 7000;
    const overlay = Number(yml['background-overlay']);

    if (Number.isFinite(overlay)) {
        document.documentElement.style.setProperty('--top-section-overlay', Math.min(0.85, Math.max(0, overlay)));
    }

    if (backgrounds.length === 0 || layers.length === 0) {
        return;
    }

    let activeLayer = 0;
    let activeBackground = chooseInitialBackgroundIndex(backgrounds.length);

    layers[activeLayer].style.backgroundImage = `url("${backgrounds[activeBackground]}")`;

    if (backgrounds.length === 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    window.setInterval(() => {
        const nextLayer = activeLayer === 0 ? 1 : 0;
        activeBackground = (activeBackground + 1) % backgrounds.length;

        layers[nextLayer].style.backgroundImage = `url("${backgrounds[activeBackground]}")`;
        layers[nextLayer].classList.add('top-section-bg-active');
        layers[activeLayer].classList.remove('top-section-bg-active');
        activeLayer = nextLayer;
    }, Math.max(2500, interval));
}

function sanitizeMarkdownHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll('script, style, iframe, object, embed, link, meta, base, form, input, button').forEach((node) => {
        node.remove();
    });

    template.content.querySelectorAll('*').forEach((node) => {
        [...node.attributes].forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim();

            if (name.startsWith('on')) {
                node.removeAttribute(attribute.name);
                return;
            }

            if (['href', 'src'].includes(name)) {
                try {
                    const url = new URL(value, window.location.href);
                    if (!allowedUrlProtocols.includes(url.protocol)) {
                        node.removeAttribute(attribute.name);
                    }
                } catch {
                    node.removeAttribute(attribute.name);
                }
            }
        });
    });

    return template.innerHTML;
}

function typesetMath() {
    if (!window.MathJax || !MathJax.startup || !MathJax.typesetPromise) {
        return Promise.resolve();
    }

    return MathJax.startup.promise.then(() => MathJax.typesetPromise());
}

function loadConfig() {
    return fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => jsyaml.load(text) || {})
        .catch(error => {
            console.log(error);
            return {};
        });
}

function applyConfig(yml) {
    Object.keys(yml).forEach(key => {
        if (configOnlyKeys.includes(key)) {
            return;
        }

        const element = document.getElementById(key);
        const value = yml[key];

        if (!element) {
            console.log("Unknown id and value: " + key + "," + stringifyValue(value))
            return;
        }

        try {
            setElementValue(element, value);
        } catch {
            console.log("Invalid id and value: " + key + "," + stringifyValue(value))
        }
    });
}

function getConfiguredSections(yml) {
    const sections = normalizeSections(yml.sections);
    if (sections.length > 0) {
        return sections.map((section) => section.id);
    }

    return [...document.querySelectorAll('[id$="-md"]')].map((element) => {
        return element.id.replace(/-md$/, '');
    });
}

function loadMarkdownSection(name) {
    return fetch(content_dir + name + '.md')
        .then(response => response.text())
        .then(markdown => {
            const target = document.getElementById(name + '-md');
            if (!target) {
                console.log("Unknown markdown section: " + name);
                return;
            }

            const html = sanitizeMarkdownHtml(marked.parse(markdown));
            target.innerHTML = html;
        })
        .catch(error => console.log(error));
}

function applyLogo(yml) {
    const avatar = document.getElementById('avatar');
    const img = document.getElementById('project-logo');
    if (!avatar || !img || !('logo' in yml)) {
        return;
    }
    if (!yml.logo) {
        avatar.remove();
        return;
    }
    img.src = yml.logo;
}

function renderContactForm(yml) {
    const target = document.getElementById('contact-md');
    const email = yml['contact-form-email'];
    if (!target || !email) {
        return;
    }

    const form = document.createElement('form');
    form.className = 'contact-form';
    form.noValidate = true;
    form.innerHTML = `
        <div class="contact-row">
            <div class="contact-field">
                <label for="cf-name">Name</label>
                <input id="cf-name" name="name" type="text" autocomplete="name" required>
            </div>
            <div class="contact-field">
                <label for="cf-email">Email</label>
                <input id="cf-email" name="email" type="email" autocomplete="email" required>
            </div>
        </div>
        <div class="contact-field">
            <label for="cf-message">Message</label>
            <textarea id="cf-message" name="message" rows="6" required></textarea>
        </div>
        <input type="text" name="_honey" class="contact-honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" class="contact-submit">Send message</button>
        <p class="contact-status" role="status" aria-live="polite"></p>`;

    const status = form.querySelector('.contact-status');
    const button = form.querySelector('.contact-submit');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        status.className = 'contact-status';

        const invalid = [...form.querySelectorAll('[required]')].find((field) => !field.checkValidity());
        if (invalid) {
            status.textContent = invalid.type === 'email' && invalid.value
                ? 'Enter a valid email address.'
                : 'Fill in your ' + invalid.labels[0].textContent.toLowerCase() + '.';
            status.classList.add('is-error');
            invalid.focus();
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        if (data._honey) {
            return;
        }
        data._subject = yml['contact-form-subject'] || 'New message from the website';
        data._template = 'table';
        data._captcha = 'false';
        data._replyto = data.email;

        button.disabled = true;
        button.textContent = 'Sending…';

        fetch('https://formsubmit.co/ajax/' + String(email).trim(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data),
        })
            .then((response) => response.json().then((body) => ({ ok: response.ok, body })))
            .then(({ ok, body }) => {
                if (!ok || String(body.success) !== 'true') {
                    throw new Error(body.message || 'Request failed');
                }
                form.reset();
                status.textContent = 'Message sent. Thank you, we will reply by email.';
                status.classList.add('is-success');
            })
            .catch(() => {
                status.textContent = 'Your message could not be sent. Check your connection and try again, or email us directly.';
                status.classList.add('is-error');
            })
            .finally(() => {
                button.disabled = false;
                button.textContent = 'Send message';
            });
    });

    target.appendChild(form);
}

function initStrip() {
    const track = document.querySelector('.gallery');
    if (!track) {
        return;
    }
    const slides = [...track.querySelectorAll('.slide')];
    if (slides.length === 0) {
        return;
    }

    const strip = document.createElement('div');
    strip.className = 'strip';
    track.parentNode.insertBefore(strip, track);
    strip.appendChild(track);
    track.setAttribute('aria-label', 'Photos');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'strip-arrow strip-prev';
    prev.setAttribute('aria-label', 'Previous photos');
    prev.innerHTML = '&#8249;';
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'strip-arrow strip-next';
    next.setAttribute('aria-label', 'Next photos');
    next.innerHTML = '&#8250;';
    strip.append(prev, next);

    const dots = document.createElement('div');
    dots.className = 'strip-dots';
    const dotButtons = slides.map((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to photo ' + (index + 1) + ' of ' + slides.length);
        dot.addEventListener('click', () => goTo(index));
        dots.appendChild(dot);
        return dot;
    });
    strip.appendChild(dots);

    function currentIndex() {
        const left = track.scrollLeft;
        let best = 0;
        slides.forEach((slide, index) => {
            if (Math.abs(slide.offsetLeft - track.offsetLeft - left) <
                Math.abs(slides[best].offsetLeft - track.offsetLeft - left)) {
                best = index;
            }
        });
        return best;
    }

    function goTo(index) {
        const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
        track.scrollTo({ left: target.offsetLeft - track.offsetLeft });
    }

    function update() {
        const index = currentIndex();
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', i === index || (atEnd && i === slides.length - 1) ? 'true' : 'false'));
        if (atEnd) {
            dotButtons.forEach((dot, i) => { if (i !== slides.length - 1) dot.setAttribute('aria-current', 'false'); });
        }
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = atEnd;
    }

    prev.addEventListener('click', () => goTo(currentIndex() - 1));
    next.addEventListener('click', () => goTo(currentIndex() + 1));
    track.addEventListener('scroll', () => window.requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    slides.forEach((slide) => {
        const img = slide.querySelector('img');
        if (img && !img.complete) {
            img.addEventListener('load', update);
        }
    });
    update();
}

function initGallery() {
    const figures = [...document.querySelectorAll('.gallery .slide')];
    if (figures.length === 0) {
        return;
    }

    const items = figures.map((figure) => {
        const img = figure.querySelector('img');
        const caption = figure.querySelector('figcaption');
        return { src: img.src, alt: img.alt, caption: caption ? caption.textContent : '' };
    });

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
        <button type="button" class="lightbox-prev" aria-label="Previous photo">&#8249;</button>
        <figure class="lightbox-figure">
            <img class="lightbox-img" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="lightbox-next" aria-label="Next photo">&#8250;</button>`;
    document.body.appendChild(box);

    const img = box.querySelector('.lightbox-img');
    const caption = box.querySelector('.lightbox-caption');
    let current = 0;
    let opener = null;

    function show(index) {
        current = (index + items.length) % items.length;
        img.src = items[current].src;
        img.alt = items[current].alt;
        caption.textContent = items[current].caption;
    }

    function open(index) {
        opener = document.activeElement;
        show(index);
        box.hidden = false;
        document.body.classList.add('lightbox-open');
        box.querySelector('.lightbox-close').focus();
    }

    function close() {
        box.hidden = true;
        document.body.classList.remove('lightbox-open');
        if (opener) {
            opener.focus();
        }
    }

    figures.forEach((figure, index) => {
        figure.tabIndex = 0;
        figure.setAttribute('role', 'button');
        figure.setAttribute('aria-label', 'Open photo: ' + (items[index].caption || items[index].alt));
        figure.addEventListener('click', () => open(index));
        figure.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open(index);
            }
        });
    });

    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
    box.addEventListener('click', (event) => {
        if (event.target === box) {
            close();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (box.hidden) {
            return;
        }
        if (event.key === 'Escape') {
            close();
        } else if (event.key === 'ArrowLeft') {
            show(current - 1);
        } else if (event.key === 'ArrowRight') {
            show(current + 1);
        } else if (event.key === 'Tab') {
            const buttons = [...box.querySelectorAll('button')];
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
}

// Show the group name in a font that has the IPA letters ɪ and ː.
const groupName = 'ɪreːn';

function markGroupName(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue.includes(groupName)) {
                return NodeFilter.FILTER_REJECT;
            }
            const parent = node.parentElement;
            if (!parent || parent.closest('script, style, textarea, title, .iren-name')) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        },
    });

    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        node.nodeValue.split(groupName).forEach((part, index) => {
            if (index > 0) {
                const span = document.createElement('span');
                span.className = 'iren-name';
                span.textContent = groupName;
                fragment.appendChild(span);
            }
            if (part) {
                fragment.appendChild(document.createTextNode(part));
            }
        });
        node.parentNode.replaceChild(fragment, node);
    });
}

function markSiteReady() {
    document.body.classList.remove('site-loading');
    document.body.classList.add('site-ready');
}

window.addEventListener('DOMContentLoaded', event => {
    marked.use({ mangle: false, headerIds: false });

    loadConfig()
        .then((yml) => {
            window.siteConfig = yml;
            applyConfig(yml);
            applyLogo(yml);
            const sections = normalizeSections(yml.sections);

            renderNavigation(getNavigationItems(yml));
            renderSections(sections);
            initBackgroundSlideshow(yml);
            activateScrollSpy();
            bindResponsiveNavbar();

            return Promise.all(getConfiguredSections(yml).map(loadMarkdownSection));
        })
        .then(() => renderContactForm(window.siteConfig || {}))
        .then(() => { initStrip(); initGallery(); })
        .then(() => markGroupName(document.body))
        .then(() => typesetMath())
        .catch(error => console.log(error))
        .finally(() => markSiteReady());

}); 
