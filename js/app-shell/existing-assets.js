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

  function createImage(key, className = '') {
    const image = document.createElement('img');
    image.src = assetUrl(key);
    image.alt = altFor(key);
    image.decoding = 'async';
    image.loading = 'lazy';
    image.className = className;
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
    huong.appendChild(createImage('huongLuminaClassroom'));
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
    tu.appendChild(createImage('tuPhanLectureHall'));
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
