#!/usr/bin/env python3
"""Sinh ba trang «Văn phòng của đội» cho Bến Phù Sa, Hộ Chiếu Thương Hiệu và Hộ Chiếu Sầu Riêng.

Trang của Bật Nghiệp (van-phong-doi.html) viết tay vì có thẻ số liệu riêng từng vai; ba trang này dùng chung một khuôn:
mở đầu bằng sa bàn 3D, mỗi người một mục cuộn, cuối trang là hàng «Gặp cả đội» và sa bàn toàn cảnh.

Nhân vật lấy từ chính ảnh mỗi game dùng, cắt sát người sang assets/character/van-phong/ (không ghi đè ảnh gốc).
Lời giới thiệu chỉ dùng điều game có thật; nguồn ghi ở chú thích cạnh từng nhân vật.

Chạy: python3 scripts/van-phong/tao-trang.py   (ghi đè ba tệp van-phong-*.html ở gốc kho)
"""
import html, json, os
from PIL import Image

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ANH = 'assets/character/van-phong/'
MAU = [(0xD9F0F2, 0x7FD3DC), (0xFFE6B8, 0xFDA127), (0xFDE1CE, 0xE8762D), (0xDDF1E4, 0xA9DCC4),
       (0xF4E1E6, 0xF4B6C2), (0xFFF3DA, 0xFFD58A), (0xE8E2F4, 0xB69CE0), (0xE6EFD8, 0x9CC27A), (0xF3E6CF, 0xC08A5A)]
GIUA = (0xF3E6CF, 0x7FD3DC)

e = html.escape


def nguoi(id_, anh, ten, vai, phong, do, tieu, doan, the, giua=False):
    """id_: neo mục; ten/vai/phong/tieu/doan: (vi, en); tieu có thể chứa <em>; the: (nhãn (vi,en), [dòng (vi,en)])."""
    return dict(id=id_, anh=anh, ten=ten, vai=vai, phong=phong, do=do, tieu=tieu, doan=doan, the=the, giua=giua)


GAME = {
    # ---------------- Bến Phù Sa ----------------
    # Nguồn: ben-phu-sa.html:384-396 (hai đội), ben-phu-sa-v8.html:544-556 (ưu thế từng vai),
    # «Ben Phu Sa Game v4 Nhom.dc.html» (TX.lead: CEO chốt bến, CFO giữ quỹ…), js/bps-voice.js:6-11 (hai cố vấn).
    'ben-phu-sa': dict(
        chu_de='song',
        tep='van-phong-ben-phu-sa.html', choi='ben-phu-sa.html', game=('Bến Phù Sa', 'Bến Phù Sa'),
        tieu=('Cả đội hàng rong, trên một bến sông.', 'The whole street-vendor team, on one river dock.'),
        lead=('Năm vai của Đội Rồng Xanh, nhà sáng lập Đội Phù Sa và hai cố vấn. Năm tuần buôn bán ở thị trấn sông nước: mỗi tuần chọn phương thức, món hàng và địa điểm. Cuộn xuống để xem ai lo việc gì.',
              "Five roles of the Blue Dragon team, the founder of the Phù Sa team and two advisors. Five weeks of trading in a river town: each week pick a mode, a product and a spot. Scroll down to see who handles what."),
        ds=[
            nguoi('lumina', 'bps-lumina', ('Lumina', 'Lumina'), ('Cố vấn học tập', 'Learning advisor'), ('Bến Lumina', 'Lumina dock'), 'vong',
                  ('Cố vấn <em>đi cùng mỗi tuần.</em>', 'An advisor <em>beside every week.</em>'),
                  ('Lumina là cố vấn học tập của Bến Phù Sa, chạy theo luật chứ không dùng AI. Lời Lumina hiện thành bong bóng chữ cạnh màn chơi, nhắc đội điều cần để ý; quyết định vẫn là của đội.',
                   "Lumina is Bến Phù Sa's learning advisor, rule-based rather than AI. Her lines appear as speech bubbles beside the game, pointing out what to watch; the decision stays with the team."),
                  (('Cố vấn học tập', 'Learning advisor'), [('Nhắc điều cần để ý', 'Points out what to watch'), ('Đội tự chọn', 'The team decides')]), giua=True),
            nguoi('ceo', 'bps-ceo', ('Minh Long', 'Minh Long'), ('CEO', 'CEO'), ('Bến chốt', 'Dock call'), 'ghe',
                  ('Tuần này <em>đậu bến nào.</em>', 'Which dock <em>this week.</em>'),
                  ('CEO chốt bến: tuần này ghe đậu ở đâu. Trong bản chơi nhóm, CEO mỗi tuần còn nghe thêm một tin vỉa hè, kể cả tuần chạy ghe.',
                   'The CEO picks the dock: where the boat moors this week. In team play the CEO also hears one extra street tip each week, even on boat weeks.'),
                  (('Ưu thế của CEO', 'CEO perk'), [('📣 Nghe thêm 1 tin vỉa hè mỗi tuần', '📣 One extra street tip each week')])),
            nguoi('cfo', 'bps-cfo', ('Thu Hà', 'Thu Hà'), ('CFO', 'CFO'), ('Két quỹ', 'Cash box'), 'ket',
                  ('Giữ quỹ, <em>tính từng chuyến ghe.</em>', 'Keep the cash, <em>count every boat trip.</em>'),
                  ('CFO giữ quỹ của đội. Có CFO trong đội thì phí ghe chỉ 1,1 triệu mỗi tuần thay vì 1,5 triệu.',
                   'The CFO keeps the team cash. With a CFO on the team, the boat costs only 1.1 million a week instead of 1.5.'),
                  (('Ưu thế của CFO', 'CFO perk'), [('💰 Phí ghe 1,1 triệu/tuần (thay vì 1,5)', '💰 Boat 1.1 mn/week (instead of 1.5)')])),
            nguoi('cmo', 'bps-cmo', ('Mạnh Chi', 'Mạnh Chi'), ('CMO', 'CMO'), ('Cây bẹo rao hàng', 'Bẹo pole stall'), 'bang',
                  ('Rao sao <em>cho khách ghé.</em>', 'Call out <em>so buyers stop by.</em>'),
                  ('CMO lo cách bán và quảng cáo. Có CMO thì lần bán đầu tiên được thêm 20% doanh thu.',
                   'The CMO handles how to sell and advertise. With a CMO, the first sale earns 20% more revenue.'),
                  (('Ưu thế của CMO', 'CMO perk'), [('✨ Lần bán đầu +20% doanh thu', '✨ First sale +20% revenue')])),
            nguoi('coo', 'bps-coo', ('Bảo Ngọc', 'Bảo Ngọc'), ('COO', 'COO'), ('Bếp nấu chè', 'Dessert kitchen'), 'noi',
                  ('Nấu món gì, <em>nấu bao nhiêu.</em>', 'What to cook, <em>and how much.</em>'),
                  ('COO chọn món và số lượng nấu. Có COO thì chè bưởi không bao giờ hao hụt.',
                   'The COO picks the dish and how much to cook. With a COO, the pomelo dessert never spoils.'),
                  (('Ưu thế của COO', 'COO perk'), [('🧊 Chè bưởi không hao hụt', '🧊 Pomelo dessert never spoils')])),
            nguoi('sec', 'bps-sec', ('Gia Hân', 'Gia Hân'), ('Thư ký', 'Secretary'), ('Chòi trinh sát', 'Scout hut'), 'ban',
                  ('Đi trước một bước, <em>trinh sát chợ.</em>', 'One step ahead, <em>scouting the market.</em>'),
                  ('Thư ký trinh sát cho cả đội. Có Thư ký thì khảo sát chợ được miễn phí.',
                   'The secretary scouts for the whole team. With a secretary, the market survey is free.'),
                  (('Ưu thế của Thư ký', 'Secretary perk'), [('📋 Khảo sát chợ miễn phí', '📋 Market survey is free')])),
            nguoi('huong', 'bps-huong-v2', ('Hương', 'Hương'), ('Nhà sáng lập · Đội Phù Sa', 'Founder · Phù Sa team'), ('Sạp Đội Phù Sa', 'Phù Sa team stall'), 'hang',
                  ('Người mở <em>Đội Phù Sa.</em>', 'The one who started <em>the Phù Sa team.</em>'),
                  ('Ngoài Đội Rồng Xanh, người chơi có thể chọn Đội Phù Sa. Hương là nhà sáng lập: gánh hàng rong của đội biết chắc khu nào đông nhất tuần sau.',
                   'Besides the Blue Dragon team, players can pick the Phù Sa team. Hương is its founder: the team’s street cart knows for sure the busiest spot next week.'),
                  (('Ưu thế của nhà sáng lập', 'Founder perk'), [('🧺 Biết chắc khu đông nhất tuần sau', '🧺 Knows the busiest spot next week')])),
            nguoi('thaytu', 'bps-tu', ('Thầy Tu Phan', 'Thầy Tu Phan'), ('Cố vấn học thuật', 'Academic advisor'), ('Chòi cố vấn học thuật', 'Academic advisor hut'), 'bang-trang',
                  ('Mở đầu <em>mỗi tuần buôn bán.</em>', 'Opening <em>every trading week.</em>'),
                  ('PGS.TS. Phan Anh Tú là cố vấn học thuật. Đầu mỗi tuần trong năm tuần, thầy mở màn bằng một lời dẫn gợi mở cho tuần ấy.',
                   'Assoc. Prof. Phan Anh Tú is the academic advisor. At the start of each of the five weeks, he opens with a prompting line for that week.'),
                  (('Cố vấn học thuật', 'Academic advisor'), [('Lời dẫn đầu tuần 1 → 5', 'Opening line, weeks 1 → 5')])),
        ]),
    # ---------------- Hộ Chiếu Thương Hiệu ----------------
    # Nguồn: brand-passport.html:457-462 (bốn doanh nghiệp), :713-720 (CAST – Ban cố vấn),
    # «Ho Chieu Thuong Hieu 3D.html»:998 (thầy Tu Phan · Giảng viên · Quốc tế hóa), js/bp-signature.js:154 (hỏi thầy Tu Phan 1 lần/ván).
    'hc-thuong-hieu': dict(
        chu_de='bien',
        tep='van-phong-hc-thuong-hieu.html', choi='brand-passport.html', game=('Hộ Chiếu Thương Hiệu', 'Brand Passport'),
        tieu=('Bốn doanh nghiệp, một ban cố vấn.', 'Four firms, one advisory board.'),
        lead=('Chọn một trong bốn doanh nghiệp, đưa thương hiệu Việt từ Vàm Thịnh ra bảy thị trường trong sáu quý. Ban cố vấn sáu người đi cùng mỗi quyết định.',
              'Pick one of four firms and take a Vietnamese brand from Vàm Thịnh to seven markets over six quarters. A six-person advisory board stands behind every decision.'),
        ds=[
            nguoi('lumina', 'hcth-lumina', ('Lumina', 'Lumina'), ('Cố vấn chiến lược', 'Strategy advisor'), ('Trạm Lumina', 'Lumina hub'), 'vong',
                  ('Cố vấn chiến lược, <em>«Je m’appelle Hương».</em>', 'Strategy advisor, <em>“Je m’appelle Hương”.</em>'),
                  ('Lumina ngồi trong ban cố vấn với vai cố vấn chiến lược, hoá thân của «Je m’appelle Hương». Cô dẫn người chơi qua các màn hướng dẫn của game.',
                   'Lumina sits on the advisory board as strategy advisor, the persona of “Je m’appelle Hương”. She guides players through the game’s tutorial screens.'),
                  (('Ban cố vấn', 'Advisory board'), [('Cố vấn chiến lược', 'Strategy advisor')]), giua=True),
            nguoi('moc-nhien', 'hcth-moc-nhien', ('Mộc Nhiên', 'Mộc Nhiên'), ('Mỹ phẩm thảo mộc', 'Herbal cosmetics'), ('Mộc Nhiên', 'Mộc Nhiên'), 'hang',
                  ('Mộc Nhiên, <em>mỹ phẩm thảo mộc.</em>', 'Mộc Nhiên, <em>herbal cosmetics.</em>'),
                  ('Một trong bốn doanh nghiệp người chơi có thể chọn: mỹ phẩm thảo mộc đi ra thị trường quốc tế.',
                   'One of the four firms a player can pick: herbal cosmetics heading for international markets.'),
                  (('Doanh nghiệp', 'Firm'), [('🧴 Mỹ phẩm thảo mộc', '🧴 Herbal cosmetics')])),
            nguoi('phu-sa-foods', 'hcth-phu-sa-foods', ('Phù Sa Foods', 'Phù Sa Foods'), ('Thực phẩm chế biến', 'Processed food'), ('Phù Sa Foods', 'Phù Sa Foods'), 'hang',
                  ('Phù Sa Foods, <em>thực phẩm chế biến.</em>', 'Phù Sa Foods, <em>processed food.</em>'),
                  ('Doanh nghiệp thực phẩm chế biến, một trong bốn lựa chọn mở đầu của game.',
                   'A processed-food firm, one of the game’s four starting choices.'),
                  (('Doanh nghiệp', 'Firm'), [('🥫 Thực phẩm chế biến', '🥫 Processed food')])),
            nguoi('lam-viet', 'hcth-lam-viet', ('Lam Việt', 'Lam Việt'), ('Thời trang bền vững', 'Sustainable fashion'), ('Lam Việt', 'Lam Việt'), 'hang',
                  ('Lam Việt, <em>thời trang bền vững.</em>', 'Lam Việt, <em>sustainable fashion.</em>'),
                  ('Doanh nghiệp thời trang bền vững, một trong bốn lựa chọn mở đầu của Hộ Chiếu Thương Hiệu.',
                   'A sustainable-fashion firm, one of the four starting choices in Brand Passport.'),
                  (('Doanh nghiệp', 'Firm'), [('👗 Thời trang bền vững', '👗 Sustainable fashion')])),
            nguoi('mekong-digital', 'hcth-mekong-digital', ('Mekong Digital', 'Mekong Digital'), ('Phần mềm quản trị', 'Management software'), ('Mekong Digital', 'Mekong Digital'), 'ban',
                  ('Mekong Digital, <em>phần mềm quản trị.</em>', 'Mekong Digital, <em>management software.</em>'),
                  ('Doanh nghiệp phần mềm quản trị: thương hiệu Việt không bán hàng hoá mà bán dịch vụ số.',
                   'A management-software firm: a Vietnamese brand selling a digital service rather than goods.'),
                  (('Doanh nghiệp', 'Firm'), [('💻 Phần mềm quản trị', '💻 Management software')])),
            nguoi('ba-sau-lanh', 'hcth-ba-sau-lanh', ('Bà Sáu Lành', 'Bà Sáu Lành'), ('Nhà sáng lập', 'Founder'), ('Phòng di sản', 'Heritage room'), 'ban-tron',
                  ('Nhà sáng lập, <em>chuyên gia di sản.</em>', 'Founder, <em>heritage expert.</em>'),
                  ('Bà Sáu Lành ngồi ghế nhà sáng lập trong ban cố vấn, người giữ gốc rễ di sản của thương hiệu.',
                   'Bà Sáu Lành holds the founder’s seat on the advisory board, keeper of the brand’s heritage roots.'),
                  (('Ban cố vấn', 'Advisory board'), [('Nhà sáng lập & chuyên gia di sản', 'Founder & heritage expert')])),
            nguoi('minh-khang', 'hcth-minh-khang', ('Minh Khang', 'Minh Khang'), ('CFO', 'CFO'), ('Két tài chính', 'Finance vault'), 'ket',
                  ('Dòng tiền trước, <em>rủi ro trong tầm tay.</em>', 'Cash flow first, <em>risk in hand.</em>'),
                  ('Minh Khang là CFO trong ban cố vấn: ưu tiên dòng tiền và kiểm soát rủi ro khi thương hiệu bước ra thị trường mới.',
                   'Minh Khang is the board’s CFO: putting cash flow first and keeping risk under control as the brand enters new markets.'),
                  (('Ban cố vấn', 'Advisory board'), [('Ưu tiên dòng tiền', 'Cash flow first'), ('Kiểm soát rủi ro', 'Risk control')])),
            nguoi('an-nhien', 'hcth-an-nhien', ('An Nhiên', 'An Nhiên'), ('Chiến lược & Đổi mới', 'Strategy & Innovation'), ('Phòng đổi mới', 'Innovation room'), 'bang',
                  ('Chiến lược <em>và đổi mới.</em>', 'Strategy <em>and innovation.</em>'),
                  ('An Nhiên phụ trách chiến lược và đổi mới trong ban cố vấn.',
                   'An Nhiên covers strategy and innovation on the advisory board.'),
                  (('Ban cố vấn', 'Advisory board'), [('Chiến lược & đổi mới', 'Strategy & innovation')])),
            nguoi('lina-park', 'hcth-lina-park', ('Lina Park', 'Lina Park'), ('Phân phối', 'Distribution'), ('Cảng phân phối', 'Distribution dock'), 'bang-chuyen',
                  ('Hàng đi tới đâu, <em>bằng kênh nào.</em>', 'Where goods go, <em>through which channel.</em>'),
                  ('Lina Park lo phân phối trong ban cố vấn, và có chân dung riêng ở màn nhiệm vụ của game.',
                   'Lina Park handles distribution on the advisory board, and has her own portrait on the game’s mission screen.'),
                  (('Ban cố vấn', 'Advisory board'), [('Phân phối', 'Distribution')])),
            nguoi('thaytu', 'hcth-tu', ('Thầy Tu Phan', 'Thầy Tu Phan'), ('Cố vấn học thuật · Quốc tế hóa', 'Academic advisor · Internationalisation'), ('Phòng quốc tế hóa', 'Internationalisation room'), 'bang-trang',
                  ('Hỏi thầy Tu Phan, <em>một lần mỗi ván.</em>', 'Ask thầy Tu Phan, <em>once a game.</em>'),
                  ('Trong bản 3D, thầy Tu Phan ngồi ghế quốc tế hóa của ban cố vấn. Mỗi ván người chơi được hỏi thầy một lần, nên phải để dành câu hỏi cho lúc thật cần.',
                   'In the 3D edition thầy Tu Phan holds the internationalisation seat on the board. Each game the player may ask him once, so the question is saved for when it matters.'),
                  (('Ban cố vấn', 'Advisory board'), [('Hỏi thầy Tu Phan: 1 lần/ván', 'Ask thầy Tu Phan: once a game')])),
        ]),
    # ---------------- Hộ Chiếu Sầu Riêng ----------------
    # Nguồn: lab/ho-chieu-sau-rieng-data.js:347-357 (đội 5 vai, nguyên văn), :411 + html:301 (hỏi Lumina tối đa 3),
    # lab/ho-chieu-sau-rieng-3d.html:401 (NPC Bà Sáu Lành «Nhà vườn · cố vấn»; NPC thầy Tu Phan: câu hỏi debrief trước khi CEO chốt,
    # giải đáp «phương thức thâm nhập ngay trong nước», «kênh của đội thuộc phương thức nào», debrief cuối sáu vụ).
    'hc-sau-rieng': dict(
        chu_de='vuon',
        tep='van-phong-hc-sau-rieng.html', choi='lab/ho-chieu-sau-rieng.html', game=('Hộ Chiếu Sầu Riêng', 'Durian Passport'),
        tieu=('Một đội, một chuỗi xuất khẩu sầu riêng.', 'One team, one durian export chain.'),
        lead=('Đội 5 vai điều hành một mắt xích trong chuỗi xuất khẩu sầu riêng qua sáu vụ, từ ngày Trung Quốc mở chính ngạch năm 2022. Ba cố vấn đi cùng: Lumina, Bà Sáu Lành và thầy Tu Phan.',
              'A team of 5 roles runs one link of the durian export chain over six seasons, from the day China opened official trade in 2022. Three advisors come along: Lumina, Bà Sáu Lành and thầy Tu Phan.'),
        ds=[
            nguoi('lumina', 'sr-lumina', ('Lumina', 'Lumina'), ('Cố vấn học tập', 'Learning advisor'), ('Trạm Lumina', 'Lumina hub'), 'vong',
                  ('Hỏi tối đa ba lần, <em>Lumina hỏi ngược lại.</em>', 'Ask up to three times; <em>Lumina asks back.</em>'),
                  ('Mỗi vụ đội được hỏi Lumina tối đa ba câu. Lumina giải thích và hỏi ngược, không đưa đáp án.',
                   'Each season the team may ask Lumina up to three questions. She explains and asks back; she never hands over the answer.'),
                  (('Hỏi Lumina', 'Ask Lumina'), [('Tối đa 3 câu mỗi vụ', 'Up to 3 per season'), ('Giải thích và hỏi ngược', 'Explains and asks back')]), giua=True),
            nguoi('ceo', 'sr-ceo', ('Minh Long', 'Minh Long'), ('CEO', 'CEO'), ('Phòng điều phối', 'Coordination room'), 'ban-tron',
                  ('Điều phối, <em>chạy «Nếu – Thì», chốt vụ.</em>', 'Coordinate, <em>run what-ifs, commit.</em>'),
                  ('CEO điều phối cả đội, chạy mô phỏng «Nếu – Thì» (tối đa hai lần mỗi vụ) và chốt vụ. Chốt rồi không sửa được.',
                   'The CEO coordinates the team, runs what-if simulations (up to two per season) and commits the season. Commits are final.'),
                  (('CEO', 'CEO'), [('«Nếu – Thì»: tối đa 2 lần/vụ', 'What-if: up to 2 per season'), ('Chốt rồi không sửa', 'Commits are final')])),
            nguoi('cmo', 'sr-cmo', ('Mạnh Chi', 'Mạnh Chi'), ('CMO', 'CMO'), ('Sàn tin giá', 'Price desk'), 'bang',
                  ('Mua tin, đọc giá, <em>chia kênh bán.</em>', 'Buy information, read prices, <em>split channels.</em>'),
                  ('CMO mua tin thị trường (tối đa hai nguồn mỗi vụ), đọc giá và chia sầu riêng vào các kênh bán.',
                   'The CMO buys market information (up to two sources a season), reads prices and splits the durian across sales channels.'),
                  (('CMO', 'CMO'), [('Tối đa 2 nguồn tin/vụ', 'Up to 2 information sources'), ('Chia kênh bán', 'Split sales channels')])),
            nguoi('coo', 'sr-coo', ('Bảo Ngọc', 'Bảo Ngọc'), ('COO', 'COO'), ('Vườn & kho', 'Orchard & store'), 'cay',
                  ('Vùng trồng có mã, <em>hao hụt, nghịch vụ.</em>', 'Coded orchards, <em>losses, off-season.</em>'),
                  ('COO lo nguồn hàng: vùng trồng có mã số, hao hụt sau thu hoạch và sầu riêng nghịch vụ.',
                   'The COO handles sourcing: orchards with planting-area codes, post-harvest losses and off-season durian.'),
                  (('COO', 'COO'), [('Vùng trồng có mã', 'Coded planting areas'), ('Hao hụt · nghịch vụ', 'Losses · off-season')])),
            nguoi('cfo', 'sr-cfo-v2', ('Thu Hà', 'Thu Hà'), ('CFO', 'CFO'), ('Két tiền mặt', 'Cash vault'), 'ket',
                  ('Tiền mặt, <em>chi phí tuân thủ.</em>', 'Cash, <em>compliance costs.</em>'),
                  ('CFO giữ tiền mặt, xếp thứ tự ưu tiên đầu tư và tính chi phí tuân thủ.',
                   'The CFO keeps cash, ranks investment priorities and counts compliance costs.'),
                  (('CFO', 'CFO'), [('Ưu tiên đầu tư', 'Investment priority'), ('Chi phí tuân thủ', 'Compliance costs')])),
            nguoi('sec', 'sr-sec', ('Gia Hân', 'Gia Hân'), ('SEC', 'SEC'), ('Bàn biến cố & nhật ký', 'Events & journal desk'), 'tu',
                  ('Đọc biến cố, <em>ghi phiếu quyết định.</em>', 'Read events, <em>keep the decision sheet.</em>'),
                  ('SEC đọc biến cố của vụ, ghi phiếu quyết định và nhật ký đội; giảng viên xuất được dữ liệu ấy về máy.',
                   'The SEC reads the season’s events and keeps the decision sheet and team journal; the instructor can export that data.'),
                  (('SEC', 'SEC'), [('Phiếu quyết định', 'Decision sheet'), ('Nhật ký đội', 'Team journal')])),
            nguoi('ba-sau-lanh', 'sr-ba-sau-lanh', ('Bà Sáu Lành', 'Bà Sáu Lành'), ('Nhà vườn · cố vấn', 'Grower · advisor'), ('Vườn sầu riêng', 'Durian orchard'), 'cay',
                  ('Nhà vườn, <em>đầu chuỗi xuất khẩu.</em>', 'A grower, <em>where the export chain begins.</em>'),
                  ('Bà Sáu Lành là nhà vườn và cố vấn của đội trong bản 3D: người ở ngay đầu chuỗi, nơi trái sầu riêng được trồng.',
                   'Bà Sáu Lành is a grower and the team’s advisor in the 3D edition: right at the start of the chain, where the durian is grown.'),
                  (('Cố vấn', 'Advisor'), [('Nhà vườn sầu riêng', 'Durian grower')])),
            nguoi('thaytu', 'bps-tu', ('Thầy Tu Phan', 'Thầy Tu Phan'), ('Cố vấn học thuật', 'Academic advisor'), ('Phòng debrief', 'Debrief room'), 'bang-trang',
                  ('Câu hỏi debrief <em>trước khi chốt vụ.</em>', 'Debrief questions <em>before the season is committed.</em>'),
                  ('Trong bản 3D, thầy Tu Phan là giảng viên Trường Kinh tế, Đại học Cần Thơ. Mỗi vụ, trước khi CEO chốt, thầy hỏi đội mấy câu debrief; đội hỏi lại thì thầy giải thích lý thuyết, như kênh bán của đội thuộc phương thức thâm nhập nào. Hết sáu vụ, thầy dẫn buổi debrief: đội đã học được gì về kinh doanh quốc tế.',
                   'In the 3D edition thầy Tu Phan is a lecturer at the CTU School of Economics. Each season, before the CEO commits, he asks the team a few debrief questions; asked back, he explains the theory, such as which entry mode each sales channel is. After six seasons he leads the debrief: what the team learned about international business.'),
                  (('Thầy Tu Phan', 'Thầy Tu Phan'), [('Câu hỏi debrief mỗi vụ', 'Debrief questions each season'), ('Kênh bán ↔ phương thức thâm nhập', 'Channel ↔ entry mode')])),
        ]),
}


def co(anh):
    return Image.open(os.path.join(GOC, ANH + anh + '.webp')).size


def muc(i, p, game):
    w, h = co(p['anh'])
    m, n = (GIUA if p['giua'] else MAU[i % len(MAU)])
    dong = ''.join(f'<li><span data-en="{e(en)}">{e(vi)}</span></li>' for vi, en in p['the'][1])
    return f'''  <section class="canh" id="{p['id']}" style="--m:#{n:06X};--nen:#{m:06X}" aria-labelledby="h-{p['id']}">
    <div class="chu">
      <span class="so">{i + 1:02d} · <span data-en="{e(p['vai'][1])}">{e(p['vai'][0])}</span></span>
      <h2 id="h-{p['id']}" data-en-html="{e(p['tieu'][1])}">{p['tieu'][0]}</h2>
      <p data-en="{e(p['doan'][1])}">{e(p['doan'][0])}</p>
      <div class="ai"><i></i><span>{e(p['ten'][0])} · <span data-en="{e(p['vai'][1])}">{e(p['vai'][0])}</span></span></div>
    </div>
    <div class="san">
      <img class="nv" src="{ANH}{p['anh']}.webp" alt="{e(p['ten'][0])} – {e(p['vai'][0])}" data-en-aria="{e(p['ten'][1])} – {e(p['vai'][1])}" width="{w}" height="{h}" loading="lazy">
      <div class="the"><b data-en="{e(p['the'][0][1])}">{e(p['the'][0][0])}</b><ul class="viec vp-the">{dong}</ul></div>
    </div>
  </section>
'''


def trang(key, g):
    ds = g['ds']
    phong = []
    for i, p in enumerate(ds):
        w, h = co(p['anh'])
        m, n = (GIUA if p['giua'] else MAU[i % len(MAU)])
        phong.append(dict(id=p['id'], giua=p['giua'], do=p['do'], anh=ANH + p['anh'] + '.webp', tl=round(w / h, 4), mau=m, sang=n,
                          ten=dict(vi=p['phong'][0], en=p['phong'][1]), vai=dict(vi=p['ten'][0] + ' · ' + p['vai'][0], en=p['ten'][1] + ' · ' + p['vai'][1])))
    url = 'https://bizonland.com/' + g['tep']
    gv, ge = g['game']
    hang = ''.join(f'''      <figure><a href="#{p['id']}"><img src="{ANH}{p['anh']}.webp" alt="{e(p['ten'][0])}" width="{co(p['anh'])[0]}" height="{co(p['anh'])[1]}" loading="lazy"></a><figcaption>{e(p['ten'][0])}<span data-en="{e(p['vai'][1])}">{e(p['vai'][0])}</span></figcaption></figure>
''' for p in ds)
    so_nguoi = len(ds)
    return f'''<!DOCTYPE html>
<!-- BizOn – © Đỗ Thùy Hương & PGS.TS. Phan Anh Tú. Bảo lưu mọi quyền. -->
<!-- Văn phòng của đội · {gv}. Tệp SINH TỰ ĐỘNG bởi scripts/van-phong/tao-trang.py: sửa ở đó rồi chạy lại, đừng sửa tay. -->
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://bizonland.com/assets/og/og-cover.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="vi_VN"><meta property="og:locale:alternate" content="en_US">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#006687">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<script src="js/bizon-lang.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title data-en="{e(ge)} · the team office · BizOn">{e(gv)} · Văn phòng của đội · BizOn</title>
<meta name="description" data-en-content="{e(g['lead'][1])}" content="{e(g['lead'][0])}">
<meta name="copyright" content="© 2026 Đỗ Thùy Hương & PGS.TS. Phan Anh Tú">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="vi" href="{url}?lang=vi">
<link rel="alternate" hreflang="en" href="{url}?lang=en">
<link rel="alternate" hreflang="x-default" href="{url}">
<link rel="icon" type="image/png" href="assets/icons/icon-192.png">
<script src="js/bizon-boot.js"></script>
<link rel="stylesheet" href="css/bizon-clay-fonts.css">
<link rel="stylesheet" href="css/bizon-clay.css">
<link rel="stylesheet" href="css/van-phong.css">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(gv)} · Văn phòng của đội">
<meta property="og:description" content="{e(g['tieu'][0])}">
<meta name="twitter:card" content="summary_large_image">
<script src="js/capture-guard.js"></script>
</head>
<body class="clay vp-{g['chu_de']}">

<main class="clay-main dn">
  <section class="dn-mo" aria-labelledby="dn-h1">
    <span class="dn-eyebrow" data-en="{e(ge)} · the team office">{e(gv)} · Văn phòng của đội</span>
    <h1 id="dn-h1" data-en="{e(g['tieu'][1])}">{e(g['tieu'][0])}</h1>
    <p class="lead" data-en="{e(g['lead'][1])}">{e(g['lead'][0])}</p>
    <div class="acts">
      <a class="clay-btn clay-btn-pill clay-btn-orange" href="{g['choi']}" data-en="Play {e(ge)} →">Vào chơi {e(gv)} →</a>
      <a class="clay-btn clay-btn-pill" href="#{ds[1]['id']}" data-en="Meet them one by one">Gặp từng người</a>
    </div>
    <div class="dn-sa" id="sa-dau">
      <canvas aria-label="Sa bàn văn phòng 3D: {so_nguoi} phòng nối về trạm giữa. Bấm vào một phòng để đến phần giới thiệu người ấy." data-en-aria="3D office model: {so_nguoi} rooms linked to the central hub. Click a room to jump to that person."></canvas>
      <p class="goi" data-en="Drag to turn · click a room to meet who works there">Kéo để xoay · bấm vào một phòng để gặp người làm ở đó</p>
      <p class="du" data-en="This browser can't show the 3D office. Everyone is introduced below.">Trình duyệt này chưa hiện được văn phòng 3D. Mọi người được giới thiệu ngay bên dưới.</p>
    </div>
  </section>

{''.join(muc(i, p, g) for i, p in enumerate(ds))}
  <section class="ket" aria-labelledby="h-doi">
    <span class="dn-eyebrow" data-en="Everyone">Cả đội</span>
    <h2 id="h-doi" data-en="Meet everyone.">Gặp cả đội.</h2>
    <div class="doi-hinh">
{hang}    </div>
    <div class="dn-sa" id="sa-cuoi" style="margin-top:40px">
      <canvas aria-label="Sa bàn văn phòng 3D, toàn cảnh" data-en-aria="3D office model, full view"></canvas>
      <p class="goi" data-en="The whole office · drag to turn">Toàn cảnh văn phòng · kéo để xoay</p>
      <p class="du" data-en="This browser can't show the 3D office.">Trình duyệt này chưa hiện được văn phòng 3D.</p>
    </div>
    <div class="acts">
      <a class="clay-btn clay-btn-pill clay-btn-orange" href="{g['choi']}" data-en="Play {e(ge)} →">Vào chơi {e(gv)} →</a>
      <a class="clay-btn clay-btn-pill" href="van-phong-doi.html" data-en="Bật Nghiệp team office">Văn phòng đội Bật Nghiệp</a>
    </div>
  </section>
</main>

<script>window.VP_PHONG = {json.dumps(phong, ensure_ascii=False)}; window.VP_CHUDE = '{g['chu_de']}';</script>
<script src="js/vendor/three.min.js" defer></script>
<script src="js/van-phong-doi-3d.js" defer></script>
<script src="js/van-phong-trang.js"></script>
<script src="js/bizon-clay-i18n.js" defer></script>
<script src="js/bizon-clay-nav.js" defer></script>
<script src="js/bizon-clay-footer.js" defer></script>
</body>
</html>
'''


if __name__ == '__main__':
    for k, g in GAME.items():
        with open(os.path.join(GOC, g['tep']), 'w', encoding='utf-8') as f:
            f.write(trang(k, g))
        print('ghi', g['tep'], len(g['ds']), 'người')
