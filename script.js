(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  Footer year                                                       */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ */
  /*  Contact form (static site: shows an inline confirmation instead   */
  /*  of actually sending, until connected to a form backend — see      */
  /*  README for hooking this up to Formspree/Getform).                 */
  /* ------------------------------------------------------------------ */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameField = contactForm.querySelector('[name="name"]');
      var name = nameField && nameField.value ? nameField.value.trim() : "";
      formNote.textContent = name
        ? "Thanks, " + name + " — we'll be in touch within one business day."
        : "Thanks — we'll be in touch within one business day.";
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  FAQ Chatbot                                                       */
  /*  Fully client-side, keyword-matched, no external API — so it       */
  /*  always works, with no network dependency to fail.                 */
  /* ------------------------------------------------------------------ */
  var toggle = document.getElementById("chatbotToggle");
  var panel = document.getElementById("chatbotPanel");
  var messagesEl = document.getElementById("chatbotMessages");
  var quickRepliesEl = document.getElementById("chatbotQuickReplies");
  var form = document.getElementById("chatbotForm");
  var input = document.getElementById("chatbotInput");

  if (!toggle || !panel || !messagesEl || !form || !input) {
    // Chatbot markup isn't present on the page — nothing to wire up.
    return;
  }

  var FAQS = [
    {
      id: "pricing",
      label: "Pricing",
      keywords: ["price", "prices", "pricing", "cost", "how much", "expensive", "quote"],
      answer:
        "Home solar systems typically run $12,000–$28,000 before incentives, depending on roof size and equipment. Dealers get tiered wholesale pricing on our full catalog. Want a specific quote? Use the contact form below and pick \"Homeowner\" or \"Dealer / Installer.\""
    },
    {
      id: "dealer",
      label: "Become a dealer",
      keywords: ["dealer", "distributor", "partner", "become a", "wholesale", "reseller", "installer network"],
      answer:
        "We onboard new dealers and installers on a rolling basis. You'll get access to our full catalog, co-op marketing support, and fulfillment from whichever hub is closest to you. Fill out the contact form and select \"Dealer / Installer\" to start the application."
    },
    {
      id: "financing",
      label: "Financing",
      keywords: ["finance", "financing", "loan", "payment plan", "lease", "afford", "monthly payment"],
      answer:
        "We work with several financing partners offering solar loans and lease-to-own plans, usually with $0 down. Your local installer will walk you through options that fit your roof and budget once you're matched."
    },
    {
      id: "coverage",
      label: "Coverage area",
      keywords: ["area", "coverage", "state", "region", "where do you", "location", "near me", "zip"],
      answer:
        "We currently serve 38 states from three regional hubs — West (Reno, NV), Central (Dallas, TX), and East (Columbus, OH). Send us your state or zip code through the contact form and we'll confirm coverage."
    },
    {
      id: "delivery",
      label: "Delivery time",
      keywords: ["delivery", "ship", "shipping", "how long", "turnaround", "fulfillment", "when will i get"],
      answer:
        "Average fulfillment is about 72 hours from order to shipment for in-stock items, with tracking provided door to door. Full installation timelines depend on your local installer's schedule."
    },
    {
      id: "warranty",
      label: "Warranty",
      keywords: ["warranty", "guarantee", "broken", "defective", "replace"],
      answer:
        "All equipment we distribute carries its manufacturer warranty (typically 12–25 years depending on the component), plus support from our team if you ever need help with a claim."
    },
    {
      id: "products",
      label: "Products",
      keywords: ["product", "panel", "inverter", "battery", "mount", "catalog", "equipment"],
      answer:
        "Our catalog includes monocrystalline panels, hybrid inverters, LFP batteries, and mounting hardware — see the \"Products\" section above for current models and specs."
    },
    {
      id: "human",
      label: "Talk to a person",
      keywords: ["human", "agent", "real person", "talk to someone", "representative", "call"],
      answer:
        "Happy to hand you off — reach our team directly at sales@meridiansolar.example or 1-800-555-0142, or leave your details in the contact form and someone will follow up."
    },
    {
      id: "greeting",
      label: null,
      keywords: ["hi", "hello", "hey", "good morning", "good afternoon"],
      answer: "Hi there! I can help with pricing, dealer applications, financing, coverage, delivery times, or warranties. What would you like to know?"
    },
    {
      id: "thanks",
      label: null,
      keywords: ["thank", "thanks", "cheers", "appreciate"],
      answer: "You're welcome! Anything else I can help with?"
    }
  ];

  var FALLBACK =
    "I don't have an answer for that yet. Try asking about pricing, dealers, financing, coverage, delivery, or warranties — or reach the team at sales@meridiansolar.example.";

  var QUICK_REPLY_IDS = ["pricing", "dealer", "coverage", "delivery"];

  var hasGreeted = false;

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, who) {
    var bubble = document.createElement("div");
    bubble.className = "msg " + (who === "user" ? "msg-user" : "msg-bot");
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function addTypingIndicator() {
    var wrap = document.createElement("div");
    wrap.className = "msg msg-bot msg-typing";
    wrap.id = "typingIndicator";
    wrap.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function removeTypingIndicator() {
    var el = document.getElementById("typingIndicator");
    if (el) el.remove();
  }

  function findAnswer(rawText) {
    var text = (rawText || "").toLowerCase();
    for (var i = 0; i < FAQS.length; i++) {
      var entry = FAQS[i];
      for (var j = 0; j < entry.keywords.length; j++) {
        if (text.indexOf(entry.keywords[j]) !== -1) {
          return entry.answer;
        }
      }
    }
    return FALLBACK;
  }

  function respondTo(text) {
    addMessage(text, "user");
    addTypingIndicator();
    var delay = 500 + Math.random() * 400;
    window.setTimeout(function () {
      removeTypingIndicator();
      addMessage(findAnswer(text), "bot");
    }, delay);
  }

  function renderQuickReplies() {
    quickRepliesEl.innerHTML = "";
    QUICK_REPLY_IDS.forEach(function (id) {
      var entry = FAQS.filter(function (f) { return f.id === id; })[0];
      if (!entry) return;
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = entry.label;
      chip.addEventListener("click", function () {
        respondTo(entry.label);
      });
      quickRepliesEl.appendChild(chip);
    });
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    if (!hasGreeted) {
      hasGreeted = true;
      renderQuickReplies();
      window.setTimeout(function () {
        addMessage(
          "Hi! I'm the Meridian Solar assistant. Ask me about pricing, dealers, financing, coverage, delivery, or warranties.",
          "bot"
        );
      }, 250);
    }
    window.setTimeout(function () { input.focus(); }, 50);
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    respondTo(text);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) {
      closePanel();
      toggle.focus();
    }
  });
})();
