(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const nav = document.querySelector('.academia-nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 60);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealNodes = [...document.querySelectorAll('.reveal-academia')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -5% 0px' });
    revealNodes.forEach((node) => observer.observe(node));
  }

  const stage = document.querySelector('[data-academia-stage]');
  if (stage && finePointer && !reducedMotion) {
    const depthNodes = [...stage.querySelectorAll('[data-depth]')];
    let raf = 0;

    const render = (x, y) => {
      depthNodes.forEach((node) => {
        const depth = Number(node.dataset.depth || 1);
        const mx = x * depth * 4.2;
        const my = y * depth * 3.2;
        node.style.transform = `translate3d(${mx}px, ${my}px, ${depth * 8}px)`;
      });
    };

    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => render(x, y));
    });

    stage.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => render(0, 0));
    });
  }

  document.querySelectorAll('[data-tilt-card]').forEach((card) => {
    if (!finePointer || reducedMotion) return;
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${-py * 4}deg) rotateY(${px * 5}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  document.querySelectorAll('[data-passport-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (reducedMotion) return;
      const target = event.currentTarget;
      const href = target.getAttribute('href');
      if (!href) return;
      event.preventDefault();
      document.documentElement.classList.add('academia-leaving');
      window.setTimeout(() => { window.location.href = href; }, 420);
    });
  });
})();
