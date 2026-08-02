(() => {
  'use strict';

  if (window.BizonExistingAssets?.ready) return;

  const currentScript = document.currentScript || [...document.scripts]
    .find(script => script.src.includes('/js/app-shell/existing-assets.js'));
  const siteRoot = currentScript?.src
    ? new URL('../../', currentScript.src)
    : new URL('../../', window.location.href);

  const registry = Object.freeze({
    huongLuminaClassroom: {
      path: 'assets/illustrations/lumina-holo-classroom.webp',
      viAlt: 'Hương trong vai Lumina hướng dẫn lớp học mô phỏng kinh doanh',
      enAlt: 'Hương as Lumina guiding a business simulation classroom'
    },
    tuPhanLectureHall: {
      path: 'assets/illustrations/anh-tu-lecture-hall.webp',
      viAlt: 'Tú Phan trong không gian giảng dạy và cố vấn học thuật',
      enAlt: 'Tú Phan in an academic teaching and advisory setting'
    },
    luminaOfficePresent: {
      path: 'assets/character/lumina-office-present.webp',
      viAlt: 'Lumina trình bày gợi ý phản tư cho người học',
      enAlt: 'Lumina presenting reflective guidance to the learner'
    },
    luminaAoDai: {
      path: 'assets/character/lumina-ao-dai.webp',
      viAlt: 'Lumina trong trang phục áo dài trắng của hệ sinh thái BizOn',
      enAlt: 'Lumina in the white ao dai of the BizOn ecosystem'
    },
    bizonMusicStudio: {
      path: 'assets/illustrations/phong-thu-bizon.webp',
      viAlt: 'Không gian phòng thu âm nhạc BizOn',
      enAlt: 'BizOn music studio environment'
    },
    bizonMusicDuo: {
      path: 'assets/character/bizon-duo-phong-thu-cut.webp',
      viAlt: 'Đôi nhân vật BizOn biểu diễn trong phòng thu',
      enAlt: 'BizOn character duo performing in the studio'
    },
    vietnamJourneyMap: {
      path: 'assets/illustrations/arena-vietnam-map-v2.webp',
      viAlt: 'Bản đồ Việt Nam đất sét dùng cho hành trình mô phỏng BizOn',
      enAlt: 'Clay-style Vietnam map used for the BizOn simulation journey'
    },
    vietnamStartupHero: {
      path: 'assets/illustrations/hero-vietnam-2026.webp',
      viAlt: 'Không gian Bật Nghiệp 2026 với bản sắc Việt Nam',
      enAlt: 'BizOn Startup Lab 2026 scene with Vietnamese identity'
    },
    brandPassportCastSheet: {
      path: 'assets/illustrations/cast-sheet-brand-passport.webp',
      viAlt: 'Bộ nhân vật gốc của trò chơi Hộ Chiếu Thương Hiệu',
      enAlt: 'Original character cast of the Brand Passport simulation'
    },
    bizonMusicCover: {
      path: 'assets/illustrations/giai-dieu-bizon.webp',
      viAlt: 'Ảnh bìa Giai điệu BizOn trong thư viện sáng tạo',
      enAlt: 'BizOn Melodies cover artwork in the creative library'
    }
  });

  const assetUrl = key => new URL(registry[key].path, siteRoot).href;
  const lang = document.documentElement.lang?.toLowerCase().startsWith('en') ? 'en' : 'vi';
  const altFor = key => lang === 'en' ? registry[key].enAlt : registry[key].viAlt;

  function ensureStylesheet() {
    if (document.querySelector('link[data-bizon-existing-assets]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('css/bizon-existing-assets.css', siteRoot).href;
    link.dataset.bizonExistingAssets = 'true';
    document.head.appendChild(link);
  }

  function createImage(key, options = {}) {
    const image = document.createElement('img');
    image.src = assetUrl(key);
    image.alt = altFor(key);
    image.decoding = 'async';
    image.loading = options.loading || 'lazy';
    if (options.fetchPriority) image.fetchPriority = options.fetchPriority;
    image.className = options.className || '';
    image.dataset.existingAsset = key;
    return image;
  }

  function installLandingCast() {
    const hero = document.querySelector('body.bizon-landing .bz-hero');
    if (!hero || document.querySelector('[data-existing-cast]')) return;

    const section = document.createElement('section');
    section.className = 'bz-wrap bz-existing-cast';
    section.dataset.existingCast = 'true';
    section.setAttribute('aria-label', lang === 'en'
      ? 'BizOn learning and academic guidance'
      : 'Đội ngũ hướng dẫn học tập và học thuật BizOn');

    const huong = document.createElement('article');
    huong.className = 'bz-existing-person';
    huong.dataset.role = 'learning';
    huong.appendChild(createImage('huongLuminaClassroom', { loading: 'eager', fetchPriority: 'high' }));
    huong.insertAdjacentHTML('beforeend', `
      <div class="bz-existing-person-copy">
        <span class="bz-existing-badge">Hương · Lumina</span>
        <small>${lang === 'en' ? 'Learning guidance' : 'Hướng dẫn học tập'}</small>
        <h2>${lang === 'en' ? 'Learn through decisions and reflection' : 'Học qua quyết định và phản tư'}</h2>
        <p>${lang === 'en'
          ? 'Lumina helps learners question assumptions and interpret consequences. The deterministic engine remains the sole source of simulation outcomes.'
          : 'Lumina hỗ trợ người học đặt câu hỏi, xem lại giả định và giải thích hệ quả. Engine xác định vẫn là nguồn duy nhất tạo kết quả mô phỏng.'}</p>
      </div>`);

    const tu = document.createElement('article');
    tu.className = 'bz-existing-person';
    tu.dataset.role = 'academic';
    tu.appendChild(createImage('tuPhanLectureHall', { loading: 'eager', fetchPriority: 'high' }));
    tu.insertAdjacentHTML('beforeend', `
      <div class="bz-existing-person-copy">
        <span class="bz-existing-badge">Tú Phan</span>
        <small>${lang === 'en' ? 'Academic advisory' : 'Cố vấn học thuật'}</small>
        <h2>${lang === 'en' ? 'Connect gameplay with academic outcomes' : 'Kết nối trò chơi với chuẩn đầu ra học thuật'}</h2>
        <p>${lang === 'en'
          ? 'The academic layer links scenarios, model cards, classroom facilitation and evidence-based review without turning AI into an automatic grader.'
          : 'Lớp học thuật liên kết tình huống, Model Cards, điều phối lớp và phản biện dựa trên bằng chứng, không biến AI thành công cụ chấm điểm tự động.'}</p>
      </div>`);

    section.append(huong, tu);
    hero.insertAdjacentElement('afterend', section);
  }

  function createModuleCard(module) {
    const link = document.createElement('a');
    link.className = 'bz-existing-module';
    link.href = new URL(module.href, siteRoot).href;
    link.dataset.module = module.id;
    link.appendChild(createImage(module.asset));

    const copy = document.createElement('div');
    copy.className = 'bz-existing-module-copy';
    copy.innerHTML = `
      <span>${module.kicker[lang]}</span>
      <h3>${module.title[lang]}</h3>
      <p>${module.description[lang]}</p>
      <strong>${lang === 'en' ? 'Open module →' : 'Mở mô-đun →'}</strong>`;
    link.appendChild(copy);
    return link;
  }

  function installEcosystemLibrary() {
    const hero = document.querySelector('body.bizon-landing .bz-hero');
    if (!hero || document.querySelector('[data-existing-ecosystem]')) return;

    const modules = [
      {
        id: 'startup-lab',
        asset: 'vietnamStartupHero',
        href: 'game.html',
        kicker: { vi: 'MÔ PHỎNG KHỞI NGHIỆP', en: 'STARTUP SIMULATION' },
        title: { vi: 'Bật Nghiệp', en: 'Startup Lab' },
        description: {
          vi: 'Ra quyết định qua sáu vòng kinh doanh với dữ liệu, rủi ro và kết quả có thể truy vết.',
          en: 'Make decisions across six business rounds with traceable data, risk and outcomes.'
        }
      },
      {
        id: 'vietnam-journey',
        asset: 'vietnamJourneyMap',
        href: 'global.html',
        kicker: { vi: 'HÀNH TRÌNH VIỆT NAM', en: 'VIETNAM JOURNEY' },
        title: { vi: 'Từ Mekong ra thế giới', en: 'From the Mekong to the world' },
        description: {
          vi: 'Theo dõi tuyến phát triển từ thị trường nội địa đến lựa chọn quốc tế hóa.',
          en: 'Follow the path from domestic markets to internationalisation choices.'
        }
      },
      {
        id: 'brand-passport',
        asset: 'brandPassportCastSheet',
        href: 'app/brand-passport.html',
        kicker: { vi: 'THƯƠNG HIỆU QUỐC TẾ', en: 'INTERNATIONAL BRANDING' },
        title: { vi: 'Hộ Chiếu Thương Hiệu', en: 'Brand Passport' },
        description: {
          vi: 'Làm việc cùng bộ nhân vật gốc để lựa chọn thị trường, thích nghi và phương thức thâm nhập.',
          en: 'Work with the original cast to choose markets, adaptation and entry modes.'
        }
      },
      {
        id: 'bizon-music',
        asset: 'bizonMusicCover',
        href: 'am-nhac.html',
        kicker: { vi: 'THƯ VIỆN SÁNG TẠO', en: 'CREATIVE LIBRARY' },
        title: { vi: 'Giai điệu BizOn', en: 'BizOn Music' },
        description: {
          vi: 'Khám phá các tuyển tập âm nhạc được gắn với từng trò chơi và hành trình học tập.',
          en: 'Explore music collections linked to each simulation and learning journey.'
        }
      }
    ];

    const section = document.createElement('section');
    section.className = 'bz-wrap bz-existing-ecosystem';
    section.dataset.existingEcosystem = 'true';
    section.setAttribute('aria-label', lang === 'en' ? 'Explore the BizOn ecosystem' : 'Khám phá hệ sinh thái BizOn');
    section.innerHTML = `
      <header class="bz-existing-ecosystem-head">
        <div>
          <span class="bz-existing-badge">${lang === 'en' ? 'Original BizOn assets' : 'Tài sản gốc BizOn'}</span>
          <h2>${lang === 'en' ? 'Explore the connected simulation ecosystem' : 'Khám phá hệ sinh thái mô phỏng liên kết'}</h2>
        </div>
        <p>${lang === 'en'
          ? 'Each module uses preserved BizOn artwork and links to the current working experience.'
          : 'Mỗi mô-đun sử dụng hình ảnh BizOn đã được bảo tồn và dẫn tới trải nghiệm đang hoạt động.'}</p>
      </header>`;

    const grid = document.createElement('div');
    grid.className = 'bz-existing-ecosystem-grid';
    modules.forEach(module => grid.appendChild(createModuleCard(module)));
    section.appendChild(grid);

    const cast = document.querySelector('[data-existing-cast]');
    (cast || hero).insertAdjacentElement('afterend', section);
  }

  function installCommandCenterGuide() {
    const panel = document.querySelector('body.bizon-command .bz-ai-panel');
    if (!panel || panel.querySelector('[data-existing-guide]')) return;

    const figure = document.createElement('figure');
    figure.className = 'bz-existing-guide';
    figure.dataset.existingGuide = 'lumina';
    figure.appendChild(createImage('luminaOfficePresent'));
    const caption = document.createElement('figcaption');
    caption.innerHTML = `<strong>Lumina · ${lang === 'en' ? 'reflection coach' : 'cố vấn phản tư'}</strong>${lang === 'en'
      ? 'Uses the current simulation state to explain trade-offs. It does not modify scores, cash, profit or engine outputs.'
      : 'Dùng trạng thái mô phỏng hiện tại để giải thích đánh đổi. Lumina không sửa điểm, tiền mặt, lợi nhuận hoặc đầu ra engine.'}`;
    figure.appendChild(caption);
    panel.prepend(figure);
  }

  function installAibisGuide() {
    const panel = document.querySelector('.aibis-panel.lumina-workspace');
    if (!panel || panel.querySelector('[data-existing-guide]')) return;

    const figure = document.createElement('figure');
    figure.className = 'aibis-existing-guide';
    figure.dataset.existingGuide = 'lumina-aibis';
    figure.appendChild(createImage('luminaOfficePresent'));
    const copy = document.createElement('p');
    copy.innerHTML = `<strong>${lang === 'en' ? 'Lumina explains the comparison' : 'Lumina giải thích phép so sánh'}</strong>${lang === 'en'
      ? 'Recommendations are derived from the selected model criteria. Suitability scores are not probabilities of investment success.'
      : 'Khuyến nghị dựa trên các tiêu chí mô hình đã chọn. Điểm phù hợp không phải xác suất thành công của một khoản đầu tư.'}`;
    figure.appendChild(copy);

    const header = panel.querySelector('header');
    if (header) header.insertAdjacentElement('afterend', figure);
    else panel.prepend(figure);
  }

  function install() {
    ensureStylesheet();
    installLandingCast();
    installEcosystemLibrary();
    installCommandCenterGuide();
    installAibisGuide();
  }

  window.BizonExistingAssets = Object.freeze({
    ready: true,
    registry,
    assetUrl,
    install
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
