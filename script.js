// =============================================
//   InvitacionesWeb 2026 — script.js
// =============================================

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- Mobile menu toggle ----
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// ---- Intersection Observer for fade-in-up ----
const fadeEls = document.querySelectorAll('.fade-in-up');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

// Make hero elements visible on load after small delay
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-in-up').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);
});

// ---- Plan selector logic ----
const planBtns = document.querySelectorAll('.plan-btn');
const planInput = document.getElementById('planInput');
const priceValue = document.getElementById('priceValue');
const precioHidden = document.getElementById('precioHidden');
const premiumExtras = document.getElementById('premiumExtras');
const musicaGenero = document.getElementById('musicaGenero');
const specificSongGroup = document.getElementById('specificSongGroup');

const PLANS = {
  basico:  { label: 'Básico - $200 MXN',   price: '$200 MXN' },
  premium: { label: 'Premium - $300 MXN',  price: '$300 MXN' }
};

function selectPlan(plan) {
  // Update toggle UI
  planBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.plan === plan);
  });

  // Update hidden inputs and price
  planInput.value  = PLANS[plan].label;
  precioHidden.value = PLANS[plan].price;

  // Animate price
  priceValue.style.transform = 'scale(1.3)';
  priceValue.style.opacity   = '0';
  setTimeout(() => {
    priceValue.textContent     = PLANS[plan].price;
    priceValue.style.transform = 'scale(1)';
    priceValue.style.opacity   = '1';
    priceValue.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
  }, 180);

  // Show/hide premium extras
  if (plan === 'premium') {
    premiumExtras.style.display = 'block';
    // Required fields for premium
    musicaGenero.setAttribute('required', '');
  } else {
    premiumExtras.style.display = 'none';
    musicaGenero.removeAttribute('required');
  }
}

planBtns.forEach(btn => {
  btn.addEventListener('click', () => selectPlan(btn.dataset.plan));
});

// Music genre: show specific song input
if (musicaGenero) {
  musicaGenero.addEventListener('change', () => {
    if (musicaGenero.value === 'Canción específica') {
      specificSongGroup.style.display = 'block';
    } else {
      specificSongGroup.style.display = 'none';
    }
  });
}

// ---- Pre-select plan from "Elegir Plan" buttons on service cards ----
document.querySelectorAll('[data-plan-select]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const plan = btn.dataset.planSelect;
    // Select the plan in the form
    setTimeout(() => selectPlan(plan), 100);
  });
});

// ---- Form submission via Formspree (AJAX) ----
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Simple validation
    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(255, 100, 120, 0.7)';
        valid = false;
      }
    });

    if (!valid) {
      shakeForm();
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-submit-text').textContent = 'Enviando...';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Show success
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        formSuccess.style.animation = 'fadeSlideIn 0.5s ease forwards';
      } else {
        throw new Error('Error al enviar');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-submit-text').textContent = 'Enviar Solicitud';
      alert('Hubo un problema al enviar el formulario. Por favor intenta de nuevo o contáctanos directamente por WhatsApp.');
    }
  });
}

function shakeForm() {
  const wrapper = document.querySelector('.form-wrapper');
  wrapper.style.animation = 'none';
  wrapper.style.transform = 'translateX(0)';
  let i = 0;
  const shakeInterval = setInterval(() => {
    wrapper.style.transform = i % 2 === 0 ? 'translateX(-6px)' : 'translateX(6px)';
    i++;
    if (i > 5) {
      clearInterval(shakeInterval);
      wrapper.style.transform = 'translateX(0)';
    }
  }, 70);
}

// ---- Smooth scroll for nav links ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Carousel ----
(function() {
  const track   = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  let current = 0;
  let autoTimer = null;

  // How many slides visible at once
  function visibleCount() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, slides.length - visibleCount());
  }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getSlideWidth() {
    if (!slides[0]) return 0;
    const slideEl = slides[0];
    return slideEl.offsetWidth + 20; // 20 = gap
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
    updateDots();
  }

  prevBtn.addEventListener('click', () => { resetAuto(); goTo(current - 1); });
  nextBtn.addEventListener('click', () => { resetAuto(); goTo(current + 1); });

  // Auto-advance
  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 3800);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      resetAuto();
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  });

  // Init
  buildDots();
  goTo(0);
  startAuto();

  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, maxIndex()));
  });
})();


const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinksAll.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` 
      ? 'var(--white)' 
      : '';
  });
});
