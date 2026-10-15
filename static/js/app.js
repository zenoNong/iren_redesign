(function() {
  'use strict';

  /* -------------------------------------------------------------
     1. HERO ANIMATIONS: SVG ORGANIC RINGS & MULTILINGUAL SCRIPT
  ------------------------------------------------------------- */
  function initHeroAnimations() {
    function blob(rx, ry, seed, amp) {
      var n = 120, pts = [];
      for (var k = 0; k < n; k++) {
        var t = k / n * Math.PI * 2;
        var d = 1 + amp * (0.55 * Math.sin(2 * t + seed) + 0.3 * Math.sin(3 * t + seed * 1.7) + 0.2 * Math.sin(5 * t + seed * 0.6));
        pts.push([Math.cos(t) * rx * d, Math.sin(t) * ry * d]);
      }
      var s = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
      for (var k = 0; k < n; k++) {
        var p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
        s += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + "," +
             (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + "," +
             p2[0].toFixed(1) + " " + p2[1].toFixed(1);
      }
      return s + "Z";
    }

    var svg = document.getElementById("rings"), NS = "http://www.w3.org/2000/svg";
    if (svg) {
      svg.replaceChildren();
      for (var r = 0; r < 7; r++) {
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", blob(330 + r * 22, 250 + r * 20, 1.1 + r * 0.28, 0.06 + r * 0.01));
        p.style.setProperty("--i", r);
        svg.appendChild(p);
      }
    }

    var mark = document.querySelector("[data-ring]");
    if (mark) {
      mark.setAttribute("d", blob(44, 26, 1.1, 0.1));
    }

    var names = [
      ["IREN", "en"],
      ["आइरेन", "hi"],
      ["ஐரென்", "ta"],
      ["ಐರೆನ್", "kn"],
      ["আইরেন", "bn"],
      ["ഐറെൻ", "ml"],
      ["ఐరెన్", "te"],
      ["ਆਈਰੇਨ", "pa"],
      ["አይረን", "am"]
    ];

    var el = document.getElementById("name");
    if (!el) return;

    var i = 0;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var viramas = "\u094D\u09CD\u0A4D\u0BCD\u0C4D\u0CCD\u0D4D";

    function letters(str) {
      var parts = window.Intl && Intl.Segmenter
        ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(str), function(x) { return x.segment; })
        : (str.match(/\P{M}\p{M}*/gu) || [str]);
      var out = [];
      parts.forEach(function(p) {
        var prev = out[out.length - 1];
        if (prev && viramas.indexOf(prev.charAt(prev.length - 1)) > -1) {
          out[out.length - 1] = prev + p;
        } else {
          out.push(p);
        }
      });
      return out;
    }

    function build(str, lang, latin) {
      el.textContent = "";
      el.setAttribute("lang", lang);
      el.classList.toggle("latin", latin);
      return letters(str).map(function(ch) {
        var slot = document.createElement("span");
        slot.className = "ch";
        var inner = document.createElement("i");
        inner.textContent = ch;
        slot.appendChild(inner);
        el.appendChild(slot);
        return inner;
      });
    }

    function rollOut(nodes) {
      return Promise.all(nodes.map(function(n, k) {
        return n.animate([
          { transform: "perspective(500px) translateY(0) rotateX(0)", opacity: 1 },
          { transform: "perspective(500px) translateY(-120%) rotateX(70deg)", opacity: 0 }
        ], { duration: 560, delay: k * 70, easing: "cubic-bezier(.7,0,.84,0)", fill: "forwards" }).finished;
      }));
    }

    function rollIn(nodes) {
      return Promise.all(nodes.map(function(n, k) {
        return n.animate([
          { transform: "perspective(500px) translateY(120%) rotateX(-70deg)", opacity: 0 },
          { transform: "perspective(500px) translateY(-6%) rotateX(6deg)", opacity: 1, offset: 0.7 },
          { transform: "perspective(500px) translateY(0) rotateX(0)", opacity: 1 }
        ], { duration: 900, delay: k * 95, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }).finished;
      }));
    }

    var current = build(names[0][0], names[0][1], true);
    if (!reduce) {
      current.forEach(function(n) { n.style.opacity = 0; });
      rollIn(current).then(function() {
        current.forEach(function(n) { n.style.opacity = ""; });
      });
      var cycle = function() {
        setTimeout(function() {
          rollOut(current).then(function() {
            i = (i + 1) % names.length;
            current = build(names[i][0], names[i][1], i === 0);
            return rollIn(current);
          }).then(cycle);
        }, 2800);
      };
      setTimeout(cycle, 1200);
    }

    // Interactive 3D Spatial Tilt on Hero Section (High-Performance Dampened)
    var heroSection = document.getElementById("hero-section");
    var heroLockup = document.getElementById("hero-lockup");
    if (heroSection && heroLockup && !reduce) {
      var targetTiltX = 0, targetTiltY = 0;
      var currentTiltX = 0, currentTiltY = 0;
      var isHovered = false;
      var rafId = null;

      function updateTilt() {
        currentTiltX += (targetTiltX - currentTiltX) * 0.08;
        currentTiltY += (targetTiltY - currentTiltY) * 0.08;

        heroLockup.style.transform = "perspective(1200px) rotateX(" + currentTiltX.toFixed(2) + "deg) rotateY(" + currentTiltY.toFixed(2) + "deg)";

        var diffX = Math.abs(targetTiltX - currentTiltX);
        var diffY = Math.abs(targetTiltY - currentTiltY);

        // Only continue rAF loop while motion is settling
        if (diffX > 0.02 || diffY > 0.02) {
          rafId = requestAnimationFrame(updateTilt);
        } else {
          currentTiltX = targetTiltX;
          currentTiltY = targetTiltY;
          if (!isHovered && currentTiltX === 0 && currentTiltY === 0) {
            heroLockup.style.transform = "";
          } else {
            heroLockup.style.transform = "perspective(1200px) rotateX(" + currentTiltX.toFixed(2) + "deg) rotateY(" + currentTiltY.toFixed(2) + "deg)";
          }
          rafId = null;
        }
      }

      heroSection.addEventListener("mousemove", function(e) {
        var rect = heroSection.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        targetTiltX = -y * 6;
        targetTiltY = x * 8;
        isHovered = true;
        if (!rafId) rafId = requestAnimationFrame(updateTilt);
      }, { passive: true });

      heroSection.addEventListener("mouseleave", function() {
        targetTiltX = 0;
        targetTiltY = 0;
        isHovered = false;
        if (!rafId) rafId = requestAnimationFrame(updateTilt);
      });
    }
  }

  /* -------------------------------------------------------------
     2. DATA LOADER UTILITIES
  ------------------------------------------------------------- */
  async function fetchJSON(path) {
    try {
      const resp = await fetch(path);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${path}`);
      return await resp.json();
    } catch (err) {
      console.error("Error loading JSON:", path, err);
      return null;
    }
  }

  function createPersonCard(person) {
    const card = document.createElement("div");
    card.className = "person-card";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");

    if (person.photo && person.photo.trim() !== "") {
      const img = document.createElement("img");
      img.src = person.photo;
      img.alt = person.name;
      avatar.appendChild(img);
    } else {
      avatar.textContent = person.initials || person.name.slice(0, 2).toUpperCase();
    }

    const info = document.createElement("div");
    info.className = "person-info";

    const nameEl = document.createElement("strong");
    if (person.url && person.url.trim() !== "" && person.url !== "https://example.org") {
      const link = document.createElement("a");
      link.href = person.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = person.name;
      nameEl.appendChild(link);
    } else {
      nameEl.textContent = person.name;
    }

    const affil = document.createElement("span");
    affil.className = "affiliation";
    affil.textContent = person.affiliation;

    info.appendChild(nameEl);
    info.appendChild(affil);

    card.appendChild(avatar);
    card.appendChild(info);

    if (person.url && person.url.trim() !== "" && person.url !== "https://example.org") {
      const arrow = document.createElement("span");
      arrow.className = "person-link-icon";
      arrow.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
      card.appendChild(arrow);
    }

    return card;
  }

  function setupSliderControls(track, prevBtn, nextBtn) {
    if (!track || !prevBtn || !nextBtn) return;

    function updateBtnState() {
      prevBtn.disabled = track.scrollLeft <= 5;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    }

    prevBtn.addEventListener("click", () => {
      const scrollAmount = track.clientWidth * 0.75;
      track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      const scrollAmount = track.clientWidth * 0.75;
      track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    track.addEventListener("scroll", updateBtnState, { passive: true });
    // Initial check
    setTimeout(updateBtnState, 200);
  }

  /* -------------------------------------------------------------
     3. RENDERERS
  ------------------------------------------------------------- */

  // Research & About Sections — Scholarly Academic Presentation (Icon-Free)
  async function renderResearch() {
    const data = await fetchJSON("data/research.json");
    if (!data) return;

    // Hydrate About Section narrative from data/research.json
    const aboutLead = document.getElementById("about-lead");
    if (aboutLead && data.about && data.about.lead) {
      aboutLead.innerHTML = data.about.lead;
    }

    const aboutTech = document.getElementById("about-tech");
    if (aboutTech && data.about && data.about.technology) {
      aboutTech.innerHTML = data.about.technology;
    }

    const aboutCoalition = document.getElementById("about-coalition");
    if (aboutCoalition && data.about && data.about.coalition) {
      aboutCoalition.innerHTML = `<strong><span class="iren-name">ɪreːn</span></strong> ${data.about.coalition.replace(/^ɪreːn\s*/, "")}`;
    }

    // Render Research Domains (Scholarly Dossier Cards — Icon-Free)
    const themesContainer = document.getElementById("themes-container");
    if (themesContainer && data.themes) {
      themesContainer.replaceChildren();

      const sectionMarkers = ["§ 01", "§ 02", "§ 03", "§ 04"];
      const domainLabels = [
        "Computational NLP & LLMs",
        "Acoustic & Speech Science",
        "Corpora & Documentation",
        "Sociolinguistics & Code-Mixing"
      ];

      data.themes.forEach((t, idx) => {
        const article = document.createElement("article");
        article.className = "theme research-card";
        article.setAttribute("data-theme", t.id || `theme-${idx + 1}`);
        const tagsHtml = t.tags ? t.tags.map(tag => `<span class="research-tag">${tag}</span>`).join("") : "";
        article.innerHTML = `
          <div class="research-card-top">
            <span class="research-marker">${sectionMarkers[idx] || "§ 0" + (idx + 1)}</span>
            <span class="research-domain">${domainLabels[idx] || "Research Domain"}</span>
          </div>
          <div class="research-card-body">
            <h3 class="research-card-title">${t.title}</h3>
            <p class="research-card-desc">${t.description}</p>
          </div>
          <div class="research-card-bottom">
            <div class="research-tags-cluster">${tagsHtml}</div>
            <a href="#publications" class="research-explore-link" aria-label="Explore research publications on ${t.title}">
              <span>Publications</span>
              <svg class="research-link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        `;
        themesContainer.appendChild(article);
      });
    }
  }

  // People Section with Apple-First 2-Row Layout & Segmented Control
  async function renderPeople() {
    const people = await fetchJSON("data/people.json");
    const container = document.getElementById("people-container");
    if (!people || !container) return;

    container.replaceChildren();

    // 4 Curated Groups in Apple UI style
    const groups = [
      {
        id: "leadership",
        title: "Leadership & Faculty Advisors",
        members: people.filter(p => p.group === "Lead and Coordinator" || p.group === "Faculty Advisors"),
        canScroll: false
      },
      {
        id: "core-team",
        title: "Core Research Team",
        members: people.filter(p => p.group === "Research Team" && p.subgroup === "Core team"),
        canScroll: false
      },
      {
        id: "researchers",
        title: "Researchers",
        members: people.filter(p => p.group === "Research Team" && p.subgroup === "Researchers"),
        canScroll: true
      },
      {
        id: "alumni",
        title: "Alumni & Past Members",
        members: people.filter(p => p.group === "Past members"),
        canScroll: false
      }
    ];

    // 1. Apple-style Segmented Control Filter at top
    const segControl = document.createElement("div");
    segControl.className = "apple-segmented-control";
    segControl.innerHTML = `
      <button class="seg-btn active" data-target="all">All (${people.length})</button>
      <button class="seg-btn" data-target="leadership">Leadership & Advisors</button>
      <button class="seg-btn" data-target="core-team">Core Team</button>
      <button class="seg-btn" data-target="researchers">Researchers</button>
      <button class="seg-btn" data-target="alumni">Alumni</button>
    `;
    container.appendChild(segControl);

    const groupsWrapper = document.createElement("div");
    groupsWrapper.className = "people-groups-wrapper";
    container.appendChild(groupsWrapper);

    groups.forEach(g => {
      if (g.members.length === 0) return;

      const groupSection = document.createElement("div");
      groupSection.className = "apple-group-section";
      groupSection.id = `group-${g.id}`;
      groupSection.setAttribute("data-group", g.id);

      // Header row
      const header = document.createElement("div");
      header.className = "apple-group-header";

      const titleDiv = document.createElement("div");
      titleDiv.className = "apple-group-title";
      titleDiv.innerHTML = `<h3>${g.title}</h3><span class="apple-count-badge">${g.members.length}</span>`;
      header.appendChild(titleDiv);

      let arrowsDiv = null;
      if (g.canScroll || g.members.length > 6) {
        arrowsDiv = document.createElement("div");
        arrowsDiv.className = "apple-nav-arrows";
        arrowsDiv.innerHTML = `
          <button class="apple-arrow-btn prev" aria-label="Previous">‹</button>
          <button class="apple-arrow-btn next" aria-label="Next">›</button>
        `;
        header.appendChild(arrowsDiv);
      }

      groupSection.appendChild(header);

      // 2-row track
      const track = document.createElement("div");
      track.className = "people-track-2row";

      g.members.forEach(person => {
        track.appendChild(createPersonCard(person));
      });

      groupSection.appendChild(track);
      groupsWrapper.appendChild(groupSection);

      if (arrowsDiv) {
        setupSliderControls(track, arrowsDiv.querySelector(".prev"), arrowsDiv.querySelector(".next"));
      }
    });

    // Segmented control click handlers
    const segBtns = segControl.querySelectorAll(".seg-btn");
    const allGroupSections = groupsWrapper.querySelectorAll(".apple-group-section");

    segBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        segBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.getAttribute("data-target");

        allGroupSections.forEach(sec => {
          if (target === "all" || sec.getAttribute("data-group") === target) {
            sec.style.display = "block";
          } else {
            sec.style.display = "none";
          }
        });
      });
    });
  }

  // Publications Section with Glassmorphism, Dynamic Filtering, and 3-per-page Pagination
  async function renderPublications() {
    const pubs = await fetchJSON("data/publications.json");
    const container = document.getElementById("pubs-container");
    const filterContainer = document.getElementById("pub-filter-bar");
    const paginationWrapper = document.getElementById("pub-pagination-wrapper");
    if (!pubs || !container) return;

    let currentFilter = "all";
    let currentPage = 1;
    const ITEMS_PER_PAGE = 2; // User requested strictly 2 rows max per page

    // Filter counts
    const counts = {
      all: pubs.length,
      paper: pubs.filter(p => (p.kind || "paper") === "paper").length,
      software: pubs.filter(p => p.kind === "software").length,
      dataset: pubs.filter(p => p.kind === "dataset").length
    };

    // Build filter capsule bar
    if (filterContainer) {
      filterContainer.innerHTML = `
        <button type="button" class="pub-filter-btn active" data-filter="all">All (${counts.all})</button>
        <button type="button" class="pub-filter-btn" data-filter="paper">Papers (${counts.paper})</button>
        <button type="button" class="pub-filter-btn" data-filter="software">Software & Demos (${counts.software})</button>
        <button type="button" class="pub-filter-btn" data-filter="dataset">Datasets (${counts.dataset})</button>
      `;

      filterContainer.querySelectorAll(".pub-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          filterContainer.querySelectorAll(".pub-filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentFilter = btn.getAttribute("data-filter");
          currentPage = 1; // Reset to page 1 on filter switch
          updateView();
        });
      });
    }

    function createPubCard(pub) {
      const card = document.createElement("article");
      card.className = "pub-card";

      // Meta row: Year badge + Kind badge
      const kindLabel = pub.kind === "software" ? "Software & Demo" : (pub.kind === "dataset" ? "Dataset" : "Paper");
      const kindClass = `pub-kind-${pub.kind || "paper"}`;

      const metaRow = document.createElement("div");
      metaRow.className = "pub-meta-row";
      metaRow.innerHTML = `
        <span class="pub-year-badge">${pub.year}</span>
        <span class="pub-kind-badge ${kindClass}">${kindLabel}</span>
      `;

      // Title
      const title = document.createElement("h3");
      title.className = "pub-title";
      title.textContent = pub.title;

      // Authors
      const authors = document.createElement("div");
      authors.className = "pub-authors";
      authors.textContent = pub.authors;

      // Venue
      const venue = document.createElement("div");
      venue.className = "pub-venue";
      venue.innerHTML = `<em>${pub.venue}</em>`;

      card.appendChild(metaRow);
      card.appendChild(title);
      card.appendChild(authors);
      card.appendChild(venue);

      if (pub.note) {
        const note = document.createElement("div");
        note.className = "pub-note";
        note.textContent = pub.note;
        card.appendChild(note);
      }

      // Link Chips
      if (pub.links && pub.links.length > 0) {
        const linksDiv = document.createElement("div");
        linksDiv.className = "pub-links";
        pub.links.forEach(l => {
          const a = document.createElement("a");
          a.className = "pub-chip";
          a.href = l.url;
          if (l.url !== "#") {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
          }
          a.innerHTML = `<span>${l.label}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
          linksDiv.appendChild(a);
        });
        card.appendChild(linksDiv);
      }

      return card;
    }

    function renderPagination(totalItems, pageWrapper) {
      if (!pageWrapper) return;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

      if (totalPages <= 1) {
        pageWrapper.innerHTML = `
          <div class="pub-pagination-info">Showing all ${totalItems} publication${totalItems === 1 ? '' : 's'}</div>
        `;
        return;
      }

      const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
      const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

      let buttonsHtml = `
        <button class="pub-page-btn pub-page-nav-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">‹ Prev</button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button class="pub-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `;
      }

      buttonsHtml += `
        <button class="pub-page-btn pub-page-nav-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">Next ›</button>
      `;

      pageWrapper.innerHTML = `
        <div class="pub-pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} publications</div>
        <div class="pub-pagination-controls">${buttonsHtml}</div>
      `;

      // Event Listeners for Prev, Next and Page Numbers
      const prevBtn = pageWrapper.querySelector(".prev-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            updateView(true);
          }
        });
      }

      const nextBtn = pageWrapper.querySelector(".next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            updateView(true);
          }
        });
      }

      pageWrapper.querySelectorAll(".pub-page-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.getAttribute("data-page"), 10);
          updateView(true);
        });
      });
    }

    function updateView(shouldScroll = false) {
      const filtered = pubs.filter(p => {
        if (currentFilter === "all") return true;
        return (p.kind || "paper") === currentFilter;
      });

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      container.replaceChildren();

      if (pageItems.length === 0) {
        const empty = document.createElement("div");
        empty.className = "pub-empty";
        empty.style.cssText = "padding: 32px; text-align: center; color: var(--ink-soft);";
        empty.textContent = "No publications found in this category.";
        container.appendChild(empty);
      } else {
        pageItems.forEach(pub => {
          container.appendChild(createPubCard(pub));
        });
      }

      renderPagination(totalItems, paginationWrapper);

      if (shouldScroll) {
        const pubSection = document.getElementById("publications");
        if (pubSection) {
          pubSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    // Initial render
    updateView();
  }

  // Tools Section with Apple Glassmorphic Cards, Category Filtering, and 2-row Pagination
  async function renderTools() {
    const tools = await fetchJSON("data/tools.json");
    const container = document.getElementById("tools-container");
    const filterContainer = document.getElementById("tools-filter-bar");
    const paginationWrapper = document.getElementById("tools-pagination-wrapper");
    if (!tools || !container) return;

    let currentCategory = "all";
    let currentPage = 1;
    const TOOLS_PER_PAGE = 6; // Max 2 rows (3 columns × 2 rows = 6 items per page)

    // SVG icon mapping
    const icons = {
      sliders: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
      translate: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      mic: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
      chart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      code: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      waveform: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4"/></svg>`
    };

    // Calculate category counts
    const categories = ["all", "Platforms", "Models & APIs", "Annotation", "Evaluation"];
    const counts = { all: tools.length };
    tools.forEach(t => {
      const cat = t.category || "Platforms";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Build filter capsule bar
    if (filterContainer) {
      filterContainer.innerHTML = categories.map(cat => {
        const count = counts[cat] || 0;
        const label = cat === "all" ? "All" : cat;
        const isActive = cat === currentCategory ? "active" : "";
        return `<button type="button" class="tool-filter-btn ${isActive}" data-category="${cat}">${label} (${count})</button>`;
      }).join("");

      filterContainer.querySelectorAll(".tool-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          filterContainer.querySelectorAll(".tool-filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentCategory = btn.getAttribute("data-category");
          currentPage = 1;
          updateToolsView();
        });
      });
    }

    function createToolCard(tool) {
      const card = document.createElement("article");
      card.className = "tool-card";

      const iconSvg = icons[tool.icon] || icons.sliders;
      const statusBadge = tool.status ? `<span class="tool-status-badge">${tool.status}</span>` : "";

      const tagsHtml = tool.tags 
        ? `<ul class="tool-tags">${tool.tags.map(t => `<li>${t}</li>`).join("")}</ul>`
        : "";

      const actionsHtml = tool.links ? tool.links.map(l => {
        const isExt = l.url && l.url !== "#";
        const targetAttr = isExt ? `target="_blank" rel="noopener noreferrer"` : "";
        const iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
        if (l.primary) {
          return `<a class="tool-btn-primary" href="${l.url}" ${targetAttr}><span>${l.label}</span>${iconSvg}</a>`;
        }
        return `<a class="tool-btn-secondary" href="${l.url}" ${targetAttr}>${l.label}</a>`;
      }).join("") : "";

      card.innerHTML = `
        <div>
          <div class="tool-header-row">
            <div class="tool-icon-badge" aria-hidden="true">${iconSvg}</div>
            ${statusBadge}
          </div>
          <h3 class="tool-title">${tool.name}</h3>
          <div class="tool-tagline">${tool.tagline || ""}</div>
          <p>${tool.description}</p>
          ${tagsHtml}
        </div>
        <div class="tool-actions">${actionsHtml}</div>
      `;

      return card;
    }

    function renderToolsPagination(totalItems, pageWrapper) {
      if (!pageWrapper) return;
      const totalPages = Math.ceil(totalItems / TOOLS_PER_PAGE);

      if (totalPages <= 1) {
        if (totalItems > 0 && totalItems >= 6) {
          pageWrapper.innerHTML = `
            <div class="tools-pagination-info">Showing all ${totalItems} tools</div>
          `;
        } else {
          pageWrapper.replaceChildren();
        }
        return;
      }

      const startIdx = (currentPage - 1) * TOOLS_PER_PAGE + 1;
      const endIdx = Math.min(currentPage * TOOLS_PER_PAGE, totalItems);

      let buttonsHtml = `
        <button class="tool-page-btn tool-page-nav-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">‹ Prev</button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button class="tool-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `;
      }

      buttonsHtml += `
        <button class="tool-page-btn tool-page-nav-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">Next ›</button>
      `;

      pageWrapper.innerHTML = `
        <div class="tools-pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} tools</div>
        <div class="tools-pagination-controls">${buttonsHtml}</div>
      `;

      const prevBtn = pageWrapper.querySelector(".prev-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            updateToolsView(true);
          }
        });
      }

      const nextBtn = pageWrapper.querySelector(".next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            updateToolsView(true);
          }
        });
      }

      pageWrapper.querySelectorAll(".tool-page-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.getAttribute("data-page"), 10);
          updateToolsView(true);
        });
      });
    }

    function updateToolsView(shouldScroll = false) {
      const filtered = tools.filter(t => {
        if (currentCategory === "all") return true;
        return (t.category || "Platforms") === currentCategory;
      });

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / TOOLS_PER_PAGE);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
      const pageItems = filtered.slice(startIndex, startIndex + TOOLS_PER_PAGE);

      container.replaceChildren();

      if (pageItems.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "padding: 32px; text-align: center; color: var(--ink-soft); grid-column: 1 / -1;";
        empty.textContent = "No tools found in this category.";
        container.appendChild(empty);
      } else {
        pageItems.forEach(tool => {
          container.appendChild(createToolCard(tool));
        });
      }

      renderToolsPagination(totalItems, paginationWrapper);

      if (shouldScroll) {
        const toolSection = document.getElementById("tools");
        if (toolSection) {
          toolSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    // Initial render
    updateToolsView();
  }

  // News Section - 1-Column Feed with Max 5 Rows & Apple Glassmorphism
  async function renderNews() {
    const news = await fetchJSON("data/news.json");
    const container = document.getElementById("news-container");
    const paginationWrapper = document.getElementById("news-pagination-wrapper");
    if (!news || !container) return;

    let currentPage = 1;
    const NEWS_PER_PAGE = 5; // Max 5 rows news per page

    function createNewsRow(item) {
      const row = document.createElement("article");
      row.className = "news-row-card";

      const calIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      const arrowIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;

      let linkUrl = "#";
      let isExt = false;
      if (item.link && item.link.url) {
        linkUrl = item.link.url;
        isExt = linkUrl !== "#" && !linkUrl.startsWith("#");
      }
      const targetAttr = isExt ? `target="_blank" rel="noopener noreferrer"` : "";

      row.innerHTML = `
        <div class="news-row-date">
          <span class="news-date-pill">${calIcon}<span>${item.dateFormatted || item.date}</span></span>
        </div>
        <div class="news-row-body">
          <h3 class="news-row-title">${item.title}</h3>
          <p class="news-row-summary">${item.summary}</p>
        </div>
        <div class="news-row-action">
          <a class="news-readmore-btn" href="${linkUrl}" ${targetAttr}>
            <span>Read more</span>${arrowIcon}
          </a>
        </div>
      `;

      return row;
    }

    function renderNewsPagination(totalItems, pageWrapper) {
      if (!pageWrapper) return;
      const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);

      if (totalPages <= 1) {
        if (totalItems > 0) {
          pageWrapper.innerHTML = `
            <div class="news-pagination-info">Showing all ${totalItems} updates</div>
          `;
        } else {
          pageWrapper.replaceChildren();
        }
        return;
      }

      const startIdx = (currentPage - 1) * NEWS_PER_PAGE + 1;
      const endIdx = Math.min(currentPage * NEWS_PER_PAGE, totalItems);

      let buttonsHtml = `
        <button class="news-page-btn news-page-nav-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">‹ Prev</button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button class="news-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `;
      }

      buttonsHtml += `
        <button class="news-page-btn news-page-nav-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">Next ›</button>
      `;

      pageWrapper.innerHTML = `
        <div class="news-pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} updates</div>
        <div class="news-pagination-controls">${buttonsHtml}</div>
      `;

      const prevBtn = pageWrapper.querySelector(".prev-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            updateNewsView(true);
          }
        });
      }

      const nextBtn = pageWrapper.querySelector(".next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            updateNewsView(true);
          }
        });
      }

      pageWrapper.querySelectorAll(".news-page-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.getAttribute("data-page"), 10);
          updateNewsView(true);
        });
      });
    }

    function updateNewsView(shouldScroll = false) {
      const totalItems = news.length;
      const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
      const pageItems = news.slice(startIndex, startIndex + NEWS_PER_PAGE);

      container.replaceChildren();

      if (pageItems.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "padding: 32px; text-align: center; color: var(--ink-soft);";
        empty.textContent = "No news updates found.";
        container.appendChild(empty);
      } else {
        pageItems.forEach(item => {
          container.appendChild(createNewsRow(item));
        });
      }

      renderNewsPagination(totalItems, paginationWrapper);

      if (shouldScroll) {
        const newsSection = document.getElementById("news");
        if (newsSection) {
          newsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    // Initial render
    updateNewsView();
  }

  // Gallery Section with Apple Vision-OS Carousel & Interactive Lightbox Modal
  async function renderGallery() {
    const gallery = await fetchJSON("data/gallery.json");
    const track = document.getElementById("gallery-track");
    const prevBtn = document.getElementById("gallery-prev");
    const nextBtn = document.getElementById("gallery-next");
    if (!gallery || !track) return;

    track.replaceChildren();

    // Lightbox modal elements
    const lightbox = document.getElementById("gallery-lightbox");
    const backdrop = document.getElementById("lightbox-backdrop");
    const closeBtn = document.getElementById("lightbox-close");
    const prevModalBtn = document.getElementById("lightbox-prev");
    const nextModalBtn = document.getElementById("lightbox-next");
    const imgBgEl = document.getElementById("lightbox-img-bg");
    const imgEl = document.getElementById("lightbox-img");
    const titleEl = document.getElementById("lightbox-title");
    const captionEl = document.getElementById("lightbox-caption");
    const locationEl = document.getElementById("lightbox-location");
    const dateEl = document.getElementById("lightbox-date");
    const counterEl = document.getElementById("lightbox-counter");

    let activeIndex = 0;

    function updateLightboxContent(idx) {
      if (!gallery[idx]) return;
      const item = gallery[idx];

      if (imgBgEl) imgBgEl.style.opacity = "0";
      if (imgEl) imgEl.style.opacity = "0";

      setTimeout(() => {
        if (imgBgEl) {
          imgBgEl.src = item.src;
          imgBgEl.style.opacity = "1";
        }
        if (imgEl) {
          imgEl.src = item.src;
          imgEl.alt = item.alt || item.title || "";
          imgEl.style.opacity = "1";
        }
      }, 100);

      if (titleEl) titleEl.textContent = item.title || item.caption || "Gallery Photo";
      if (captionEl) captionEl.textContent = item.caption || "";
      if (locationEl) locationEl.textContent = item.location ? `📍 ${item.location}` : "📍 ɪreːn Collaboration";
      if (dateEl) dateEl.textContent = item.date || "";
      if (counterEl) counterEl.textContent = `${idx + 1} / ${gallery.length}`;
    }

    function openLightbox(idx) {
      if (!lightbox) return;
      activeIndex = idx;
      updateLightboxContent(activeIndex);
      lightbox.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.setAttribute("hidden", "");
      document.body.style.overflow = "";
    }

    function showPrevPhoto() {
      activeIndex = (activeIndex - 1 + gallery.length) % gallery.length;
      updateLightboxContent(activeIndex);
    }

    function showNextPhoto() {
      activeIndex = (activeIndex + 1) % gallery.length;
      updateLightboxContent(activeIndex);
    }

    // Modal listeners
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (backdrop) backdrop.addEventListener("click", closeLightbox);
    if (prevModalBtn) prevModalBtn.addEventListener("click", showPrevPhoto);
    if (nextModalBtn) nextModalBtn.addEventListener("click", showNextPhoto);

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!lightbox || lightbox.hasAttribute("hidden")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevPhoto();
      if (e.key === "ArrowRight") showNextPhoto();
    });

    // Populate gallery 2-row track: pure photo tiles (no text labels in carousel)
    gallery.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "gallery-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View photo: ${item.title || item.caption}`);

      const zoomIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;

      card.innerHTML = `
        <img class="gallery-img-thumb" src="${item.src}" alt="${item.alt || item.title || ''}" width="${item.width || 800}" height="${item.height || 600}" loading="lazy">
        <div class="gallery-zoom-badge" aria-hidden="true">${zoomIcon}</div>
      `;

      card.addEventListener("click", () => openLightbox(index));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });

      track.appendChild(card);
    });

    setupSliderControls(track, prevBtn, nextBtn);
  }

  // Site Configuration & Contact Info
  async function renderSiteConfig() {
    const site = await fetchJSON("data/site.json");
    if (!site) return;

    if (site.contact) {
      const emailLink = document.getElementById("contact-email");
      if (emailLink && site.contact.email) {
        emailLink.href = `mailto:${site.contact.email}`;
        emailLink.textContent = site.contact.email;
      }
      const addressEl = document.getElementById("contact-address");
      if (addressEl && site.contact.address) {
        addressEl.textContent = site.contact.address;
      }
      const githubLink = document.getElementById("contact-github");
      if (githubLink && site.contact.github) {
        githubLink.href = site.contact.github;
      }
    }
  }

  /* -------------------------------------------------------------
     4. INITIALIZATION
  ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initHeroAnimations();
    renderSiteConfig();
    renderResearch();
    renderPeople();
    renderPublications();
    renderTools();
    renderNews();
    renderGallery();
  });

})();
