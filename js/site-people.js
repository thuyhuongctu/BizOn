/* BizOn – Sổ hồ sơ người sáng lập (nguồn duy nhất)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Trước đây mã ORCID/OSF/Zenodo/GitHub và danh xưng được chép tay ở nhiều trang
 * (doi-ngu, gioi-thieu…), nên PR #316 phải sửa cùng một thông tin ở ba nơi – dễ
 * lệch. Gom về MỘT nơi ở đây; các trang chỉ khai báo một khối rỗng
 *   <div data-people-chips data-person="huong" data-variant="full"
 *        data-accent="primary" data-fields="orcid,osf,zenodo,github"></div>
 * và tệp này render các "chip" liên kết vào đó. Sửa một lần, mọi trang đổi theo.
 *
 * Danh xưng chuẩn (VI/EN) cũng lưu ở đây làm nguồn tham chiếu: NCS. Đỗ Thùy Hương
 * / PhD Candidate Do Thuy Huong. Hai bộ mã Zenodo CỐ Ý khác nhau (mỗi người một
 * bản ghi) – giữ nguyên, không gộp.
 */
(function () {
  'use strict';

  window.BIZON_PEOPLE = {
    huong: {
      name: 'Đỗ Thùy Hương', nameEn: 'Do Thuy Huong',
      prefix: { vi: 'NCS.', en: 'PhD Candidate' },
      role: { vi: 'Founder & Project Lead', en: 'Founder & Project Lead' },
      affiliation: {
        vi: 'Nghiên cứu sinh Tiến sĩ Quản trị kinh doanh · Đại học Cần Thơ',
        en: 'PhD Candidate in Business Administration · Can Tho University',
      },
      orcid: '0000-0002-7711-2487',
      osf: 'https://osf.io/m25qs/',
      zenodo: '10.5281/zenodo.21282517',
      github: 'thuyhuongctu',
    },
    tu: {
      name: 'Phan Anh Tú', nameEn: 'Phan Anh Tú',
      prefix: { vi: 'PGS.TS.', en: 'Assoc. Prof., Ph.D.' },
      role: { vi: 'Co-founder & Chief Academic Advisor', en: 'Co-founder & Chief Academic Advisor' },
      affiliation: {
        vi: 'Giảng viên · nhà nghiên cứu khởi nghiệp & đổi mới sáng tạo',
        en: 'Educator · entrepreneurship & innovation researcher',
      },
      orcid: '0000-0003-0667-3137',
      osf: 'https://osf.io/vqtkd/',
      zenodo: '10.5281/zenodo.21592241',
      // không có GitHub cá nhân
    },
  };

  // Dựng một "chip" liên kết đúng như markup vẫn dùng trên trang (full/mini).
  function chip(p, field, variant, accent) {
    var acc = accent || 'primary', url, label;
    if (field === 'orcid') { url = 'https://orcid.org/' + p.orcid; label = variant === 'mini' ? 'iD ORCID' : ('ORCID iD: ' + p.orcid); }
    else if (field === 'osf') { url = p.osf; label = '🌐 OSF'; }
    else if (field === 'zenodo') { url = 'https://doi.org/' + p.zenodo; label = '📦 Zenodo DOI'; }
    else if (field === 'github') { if (!p.github) return ''; url = 'https://github.com/' + p.github; label = variant === 'mini' ? '⭐ GitHub' : ('⭐ GitHub @' + p.github); }
    else return '';
    var cls = variant === 'mini'
      ? 'px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary/8 text-primary'
      : 'px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-white text-' + acc + ' border border-' + acc + '/25 hover:bg-' + acc + ' hover:text-white transition-colors';
    return '<a href="' + url + '" target="_blank" rel="noopener" class="' + cls + '">' + label + '</a>';
  }

  function render() {
    document.querySelectorAll('[data-people-chips]').forEach(function (el) {
      var p = window.BIZON_PEOPLE[el.getAttribute('data-person')];
      if (!p) return;
      var variant = el.getAttribute('data-variant') || 'full';
      var accent = el.getAttribute('data-accent') || 'primary';
      var fields = (el.getAttribute('data-fields') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      el.innerHTML = fields.map(function (f) { return chip(p, f, variant, accent); }).join('');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
