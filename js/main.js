(() => {
  "use strict";

  const CONTACT_EMAIL = "mawebcontent@gmail.com";

  /* ---------- Cabeçalho: fica sólido ao rolar (só na home) ---------- */
  const header = document.querySelector(".site-header");
  if (header && header.classList.contains("site-header--overlay")) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu no celular ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  function setMenu(open) {
    if (!navToggle || !mainNav) return;
    mainNav.classList.toggle("is-open", open);
    header && header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => setMenu(!mainNav.classList.contains("is-open")));
    mainNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        setMenu(false);
        navToggle.focus();
      }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => e.matches && setMenu(false));
  }

  /* ---------- Filtros do portfólio ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryCards = document.querySelectorAll("#gallery .card");
  const galleryEmpty = document.getElementById("gallery-empty");
  function applyFilter(filter) {
    let visible = 0;
    galleryCards.forEach((card) => {
      const cats = (card.dataset.categories || "").split(" ");
      const match = filter === "todas" || cats.includes(filter);
      card.hidden = !match;
      if (match) visible++;
    });
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    if (galleryEmpty) galleryEmpty.hidden = visible > 0;
  }
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyFilter(btn.dataset.filter);
      history.replaceState(null, "", btn.dataset.filter === "todas" ? location.pathname : "#" + btn.dataset.filter);
    });
  });
  if (filterBtns.length) {
    const fromHash = location.hash.replace("#", "");
    if (fromHash && document.querySelector(`.filter-btn[data-filter="${CSS.escape(fromHash)}"]`)) applyFilter(fromHash);
  }

  /* ---------- Galeria do produto ---------- */
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const mainImg = gallery.querySelector(".product-main img");
    const mainSource = gallery.querySelector(".product-main source");
    gallery.querySelectorAll(".product-thumbs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (mainSource) mainSource.srcset = btn.dataset.fullWebp;
        mainImg.srcset = btn.dataset.full;
        mainImg.src = btn.dataset.full;
        mainImg.alt = btn.dataset.alt;
        gallery.querySelectorAll(".product-thumbs button").forEach((b) => b.setAttribute("aria-current", String(b === btn)));
      });
    });
  });

  /* ---------- Formulário de contato ---------- */
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const params = new URLSearchParams(location.search);
    const setSelect = (id, value) => {
      const el = document.getElementById(id);
      if (!el || !value) return;
      const has = Array.from(el.options).some((o) => o.value === value);
      if (has) el.value = value;
    };
    setSelect("assunto", params.get("assunto"));
    setSelect("obra", params.get("obra"));

    const formNote = document.getElementById("form-note");
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        formNote.textContent = "Preencha nome, e-mail, assunto e mensagem para enviar.";
        formNote.classList.add("is-error");
        return;
      }
      const data = new FormData(contactForm);
      const obra = data.get("obra");
      const subject = encodeURIComponent(`[Site] ${data.get("assunto")}${obra ? " — " + obra : ""}`);
      const body = encodeURIComponent(
        `Nome: ${data.get("nome")}\nE-mail: ${data.get("email")}\nAssunto: ${data.get("assunto")}\nObra ou produto: ${obra || "—"}\n\nMensagem:\n${data.get("mensagem")}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      formNote.textContent = "Abrindo o seu aplicativo de e-mail para concluir o envio.";
      formNote.classList.remove("is-error");
    });
  }

  /* ---------- Newsletter (ainda sem serviço de e-mail conectado) ---------- */
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // TODO: conectar a um serviço de e-mail (Mailchimp, Brevo, ConvertKit...)
      document.getElementById("newsletter-note").textContent = "Inscrição recebida. Obrigada!";
      newsletterForm.reset();
    });
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
