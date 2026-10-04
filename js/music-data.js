/* ============================================================================
   BizOn — dữ liệu Kho Âm nhạc (song ngữ VI/EN).
   group  = [nameVi, art, descVi, tracks, descEn, nameEn?]  (nameEn mặc định = nameVi)
   track  = [titleVi, subVi, audioId, titleEn, subEn]
   album  = [nameVi, art, toneVi, href, files[], toneEn]    (name dùng chung)
   voice  = [labelVi, audioId, labelEn]
   Âm thanh: assets/audio/<audioId>.mp3 · Ảnh: assets/<art>
   ========================================================================== */
window.BZ_MUSIC = {
  groups: [
    ['«Hương on Return»', 'illustrations/turnaround-huong.webp', 'Bài hát chính của BizOn', [
      ['Bản gốc ⭐', 'Bản thu có lời', 'huong-on-return', 'Original ⭐', 'Vocal recording'],
      ['Bản remix (remastered)', 'Bản phối lại mới · hành trình Go Global gói trong một bài hát', 'huong-on-return-remix', 'Remix (remastered)', 'A fresh remix · the Go Global journey in one song']
    ], "BizOn's main song"],
    ['«Journey on the Golden Silt»', 'illustrations/globe-trade.webp', 'Global electro-pop đa ngôn ngữ Anh–Pháp–Việt · từ phù sa Mekong ra thế giới', [
      ['Bản gốc (4 phút)', 'Bản thu có lời chính thức', 'journey-golden-silt', 'Original (4 min)', 'Official vocal recording'],
      ['Bản đầy đủ «Golden Silt Journey» ⭐', 'Ba thứ tiếng Anh–Pháp–Việt · 4:18 · nhạc nền Bến Phù Sa', 'golden-silt-journey-ben-phu-sa', 'Full «Golden Silt Journey» ⭐', 'Trilingual EN–FR–VI · 4:18 · Bến Phù Sa soundtrack'],
      ['Bản remix', 'Bản phối lại mở rộng', 'journey-golden-silt-remix', 'Remix', 'Extended remix'],
      ['Bản remix «Mekong River»', 'Chủ đề dòng sông Mekong · 3:58', 'mekong-river-remix', '«Mekong River» remix', 'Mekong river theme · 3:58'],
      ['«Mekong River» – bản thu lại', 'Bản phối gọn hơn 3:38', 'mekong-river-v2', '«Mekong River» – re-recording', 'A tighter mix · 3:38']
    ], 'Multilingual global electro-pop (EN–FR–VI) · from Mekong silt to the world'],
    ["«Je m'appelle Hương sans frontières»", 'character/advisors/lumina-nghe-nhac-ngoi-cut.webp', 'Ca khúc BizOn Go Global (Hộ Chiếu Thương Hiệu) · International pop 118 BPM', [
      ['Bản gốc – tiếng Việt', 'Bản thu tiếng Việt', 'huong-and-the-world', 'Original – Vietnamese', 'Vietnamese recording'],
      ['Bản thu mới – bản 1', 'Bản dựng lại · 2:39', 'huong-sans-frontieres', 'New recording – take 1', 'Rebuilt · 2:39'],
      ['Bản thu mới – bản 2', 'Bản dựng thứ hai · 2:54', 'huong-sans-frontieres-2', 'New recording – take 2', 'Second build · 2:54'],
      ['English version', 'Song ngữ Anh–Việt cho phát hành quốc tế', 'huong-and-the-world-en', 'English version', 'EN–VI bilingual for international release'],
      ['Bản giọng nam', 'Lời tiếng Anh song ngữ', 'huong-and-the-world-male', 'Male vocal', 'Bilingual English lyrics'],
      ['French version – «Hương et le Monde»', 'Lời tiếng Pháp · tuyến Pháp ngữ', 'huong-et-le-monde', 'French version – «Hương et le Monde»', 'French lyrics · Francophone line'],
      ['«Vươn ra thế giới» – bản 1', 'Ca khúc mới cùng tuyến · 2:47', 'huong-vuon-ra-the-gioi', '«Vươn ra thế giới» – take 1', 'A new song on the same line · 2:47'],
      ['«Vươn ra thế giới» – bản 2', 'Hòa âm khác · 2:47', 'huong-vuon-ra-the-gioi-2', '«Vươn ra thế giới» – take 2', 'Alternate arrangement · 2:47']
    ], 'BizOn Go Global song · international pop 118 BPM'],
    ['«Đội Phù Sa»', 'illustrations/game/ben-phu-sa-cho-noi.webp', 'Anthem đội chơi game Bến Phù Sa · V-pop electronic 116 BPM', [
      ['Bản gốc', 'Golden silt, we rise!', 'doi-phu-sa', 'Original', 'Golden silt, we rise!'],
      ['Bản remix', 'Cùng lời, màu nhạc mới', 'doi-phu-sa-remix', 'Remix', 'Same lyrics, new colour'],
      ['Bản remix 2', '3:24 · nhịp dày hơn', 'doi-phu-sa-remix2', 'Remix 2', '3:24 · denser beat'],
      ['Bản remix 3', '4:15 · bản dài nhất', 'doi-phu-sa-remix3', 'Remix 3', '4:15 · the longest cut']
    ], 'Đội Phù Sa anthem · V-pop electronic 116 BPM'],
    ['«Hộ Chiếu Thương Hiệu»', 'illustrations/cast-sheet-brand-passport.webp', 'Nhạc chủ đề Hộ Chiếu Thương Hiệu · từ cửa sông Vàm Thịnh ra biển lớn', [
      ['«Brand Passport» – bản gốc', '2:52', 'brand-passport', '«Brand Passport» – original', '2:52'],
      ['«Brand Passport» – bản phối', '2:56', 'brand-passport-v2', '«Brand Passport» – arrangement', '2:56'],
      ['«Brand Passport» – bản remix', '3:48', 'brand-passport-remix', '«Brand Passport» – remix', '3:48'],
      ['«Brand Passport» – remix mở rộng', '5:01', 'brand-passport-remix-25', '«Brand Passport» – extended remix', '5:01'],
      ['«Stamps Beyond Borders» – bản gốc ⭐', 'Lời tiếng Anh · 3:03', 'stamps-beyond-borders', '«Stamps Beyond Borders» – original ⭐', 'English lyrics · 3:03'],
      ['«Stamps Beyond Borders» – bản thu lại', '3:03 · hòa âm mới', 'stamps-beyond-borders-v2', '«Stamps Beyond Borders» – re-recording', '3:03 · new arrangement'],
      ['«Stamps Beyond Borders» – mở rộng', '4:43', 'stamps-beyond-borders-extended', '«Stamps Beyond Borders» – extended', '4:43'],
      ['«Golden Silt Route»', 'Con đường phù sa vàng', 'golden-silt-route', '«Golden Silt Route»', 'The golden-silt road']
    ], 'Brand Passport theme · from the Vàm Thịnh estuary to the open sea'],
    ['«Hộ Chiếu Thương Hiệu» – tổ khúc ba phần', 'illustrations/thuyen-sen-khoi-hanh.webp', 'Hành trình từ bến sông quê ra thế giới', [
      ['Phần I – «Từ dòng Mekong»', '3:56', 'ho-chieu-p1-tu-dong-mekong', 'Part I – «From the Mekong»', '3:56'],
      ['Phần I – bản remix', '3:51', 'ho-chieu-p1-remix', 'Part I – remix', '3:51'],
      ['Phần I – bản remix 2', '4:07', 'ho-chieu-p1-remix2', 'Part I – remix 2', '4:07'],
      ['Phần I – bản remix 3', '4:18', 'ho-chieu-p1-remix3', 'Part I – remix 3', '4:18'],
      ['Phần II – «Qua Những Thị Trường»', '4:18', 'ho-chieu-p2-qua-nhung-thi-truong', 'Part II – «Across the Markets»', '4:18'],
      ['Phần II – bản remix', '4:04', 'ho-chieu-p2-remix', 'Part II – remix', '4:04'],
      ['Phần III – «Việt Nam ra thế giới»', '5:09', 'ho-chieu-p3-viet-nam-ra-the-gioi', 'Part III – «Vietnam to the World»', '5:09'],
      ['Phần III – bản remix', '5:22', 'ho-chieu-p3-remix', 'Part III – remix', '5:22'],
      ['Phần III – bản remix 2', '5:21', 'ho-chieu-p3-remix2', 'Part III – remix 2', '5:21'],
      ['Phần III – bản remix 3', '5:02', 'ho-chieu-p3-remix3', 'Part III – remix 3', '5:02'],
      ['Phần III – «Vietnam to the World»', 'Lời tiếng Anh · 5:20', 'ho-chieu-p3-vietnam-to-the-world-en', 'Part III – «Vietnam to the World»', 'English lyrics · 5:20'],
      ['Phần III tiếng Anh – bản remix', '4:42', 'ho-chieu-p3-en-remix', 'Part III (English) – remix', '4:42'],
      ['Phần III tiếng Anh – bản remix 2 ⭐', '5:33 · nhạc nền mặc định', 'ho-chieu-p3-en-remix2', 'Part III (English) – remix 2 ⭐', '5:33 · default soundtrack']
    ], 'A three-part journey from a home river wharf to the world', '«Brand Passport» – three-part suite'],
    ['«Bật Nghiệp»', 'illustrations/hero-vietnam-2026.webp', 'Ca khúc chủ đề game Việt Nam · V-pop electronic 112 BPM', [
      ['Bản thu có lời ⭐', '3:23 · nhạc nền mở đầu', 'bat-nghiep-co-loi', 'Vocal recording ⭐', '3:23 · opening theme'],
      ['Bản Rap Symphony', 'Rap kết hợp dàn dây · 3:48', 'bat-nghiep-rap-symphony', 'Rap Symphony', 'Rap with strings · 3:48'],
      ['Remix «Mekong Sunfire 2»', '3:23', 'bat-nghiep-mekong-sunfire-2', '«Mekong Sunfire 2» remix', '3:23'],
      ['Remix «Mekong Sunfire»', '3:18', 'bat-nghiep-mekong-sunfire', '«Mekong Sunfire» remix', '3:18'],
      ['Remix «Mekong Sunfire Rise»', '4:45', 'bat-nghiep-mekong-sunfire-rise', '«Mekong Sunfire Rise» remix', '4:45'],
      ['Bản instrumental', '1:20 · xen giữa các vòng', 'bat-nghiep', 'Instrumental', '1:20 · between rounds']
    ], 'Vietnam game theme song · V-pop electronic 112 BPM'],
    ['«Việt Nam Trong Tim»', 'character/bizon-duo-music.webp', 'Ca khúc tiếng Việt mới', [
      ['Bản gốc', '2:36', 'viet-nam-trong-tim', 'Original', '2:36']
    ], 'A new Vietnamese song'],
    ['«Vừa Đủ Để Bay Cao»', 'illustrations/event-vietnam-2026.webp', 'Về «đường cong ta học»', [
      ['Bản gốc (remastered)', 'Bản thu có lời', 'vua-du-de-bay-cao', 'Original (remastered)', 'Vocal recording']
    ], 'On the «learning curve»'],
    ['«And The World Say Hello!»', 'character/advisors/lumina-nghe-nhac-dung-cut.webp', "Hệ sinh thái Je m'appelle Hương", [
      ['Bản gốc', 'Bản thu có lời', 'and-the-world-say-hello', 'Original', 'Vocal recording']
    ], "Je m'appelle Hương ecosystem"],
    ['«Mekong Compass»', 'illustrations/arena-vietnam-map-v2.webp', 'Cảm hứng dòng Mekong', [
      ['Bản gốc', 'Bản thu có lời', 'mekong-compass', 'Original', 'Vocal recording']
    ], 'Inspired by the Mekong'],
    ['«BizOn Theme»', 'illustrations/bizon-music-studio.webp', 'Nhạc hiệu instrumental của hệ sinh thái', [
      ['Bản gốc – instrumental', 'Bản phối không lời', 'bizon-theme', 'Original – instrumental', 'Instrumental mix']
    ], "The ecosystem's instrumental signature"]
  ],
  collections: [
    ['Bật Nghiệp', 'illustrations/hero-vietnam-2026.webp', 'Màu Việt Nam', 'game.html', ['bat-nghiep-co-loi', 'bat-nghiep-rap-symphony', 'bat-nghiep-mekong-sunfire-2', 'bat-nghiep-mekong-sunfire', 'bat-nghiep-mekong-sunfire-rise', 'bat-nghiep', 'huong-vuon-ra-the-gioi', 'huong-vuon-ra-the-gioi-2', 'bizon-theme', 'huong-on-return', 'huong-on-return-remix', 'vua-du-de-bay-cao'], 'Vietnam palette'],
    ['Hộ Chiếu Thương Hiệu', 'illustrations/thuyen-sen-khoi-hanh.webp', 'Quốc tế hóa · BizOn Go Global', 'brand-passport.html', ['brand-passport', 'brand-passport-v2', 'brand-passport-remix', 'brand-passport-remix-25', 'stamps-beyond-borders', 'stamps-beyond-borders-v2', 'stamps-beyond-borders-extended', 'golden-silt-route', 'ho-chieu-p1-tu-dong-mekong', 'ho-chieu-p2-qua-nhung-thi-truong', 'ho-chieu-p3-viet-nam-ra-the-gioi', 'ho-chieu-p3-remix', 'ho-chieu-p3-remix2', 'ho-chieu-p3-vietnam-to-the-world-en', 'ho-chieu-p3-en-remix2', 'ho-chieu-p1-remix', 'ho-chieu-p1-remix2', 'ho-chieu-p1-remix3', 'ho-chieu-p2-remix', 'ho-chieu-p3-remix3', 'ho-chieu-p3-en-remix', 'journey-golden-silt', 'journey-golden-silt-remix', 'mekong-river-remix', 'mekong-river-v2', 'mekong-compass', 'huong-and-the-world', 'huong-and-the-world-en', 'huong-and-the-world-male', 'huong-et-le-monde', 'huong-sans-frontieres', 'huong-sans-frontieres-2', 'huong-vuon-ra-the-gioi', 'huong-vuon-ra-the-gioi-2'], 'Internationalization · BizOn Go Global'],
    ['Bến Phù Sa', 'illustrations/game/ben-phu-sa-cho-noi.webp', 'Chợ nổi Mekong · Gánh Hàng Khởi Nghiệp', 'ben-phu-sa.html', ['golden-silt-journey-ben-phu-sa', 'doi-phu-sa', 'doi-phu-sa-remix', 'doi-phu-sa-remix2', 'doi-phu-sa-remix3'], 'Mekong floating market · startup street-cart'],
    ['BizOn Arcade', 'illustrations/giai-dieu-bizon.webp', 'Nhịp nhanh', 'games.html', ['bizon-theme', 'and-the-world-say-hello', 'vua-du-de-bay-cao', 'bat-nghiep'], 'Fast tempo']
  ],
  voices: [
    ['Lời chào Hương', 'huong-intro', "Hương's greeting"],
    ['Cố vấn xin chào', 'lumina-advisor-hello', 'Advisor hello'],
    ['Kết quả vòng chơi', 'lumina-round-result', 'Round result'],
    ['Chúc mừng chiến thắng', 'lumina-victory', 'Victory cheer']
  ]
};
