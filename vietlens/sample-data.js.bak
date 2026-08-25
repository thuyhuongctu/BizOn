/* VietLens — Lớp dữ liệu (Nấc 1)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Định vị (theo tài liệu "VietLens như một sản phẩm độc lập"): giá trị của VietLens
 * là CHIỀU SÂU và XUẤT XỨ, KHÔNG phải vận tốc. Vì vậy mỗi chỉ tiêu ở đây bắt buộc
 * kèm bốn trường xuất xứ: `period` (mốc thời gian, nhịp quý/năm), `source` (nguồn),
 * `method` (phương pháp thu thập) và `limitation` (ghi chú giới hạn).
 *
 * QUY TẮC MỘT DÒNG: không có xuất xứ thì không lên bảng. Một chỉ tiêu không nguồn
 * làm hỏng uy tín của cả trăm chỉ tiêu có nguồn — app.js lọc bỏ mọi mục thiếu
 * `source` trước khi hiển thị.
 *
 * Đây là DỮ LIỆU MẪU/PROXY minh họa để kiểm tra kiến trúc & trải nghiệm (datasetStatus
 * = 'sample-proxy'); giá trị số chưa phải số liệu thật đã hiệu chỉnh. Cấu trúc xuất xứ
 * thì đã đúng khuôn dữ liệu thật sẽ đổ vào sau. Phạm vi bám kỷ luật của tài liệu:
 * chỉ tiêu kinh tế cấp tỉnh/vùng theo quý, chuỗi giá trị nông sản chủ lực, thương mại
 * theo mặt hàng/thị trường, FDI theo tỉnh/ngành, môi trường thể chế cấp tỉnh.
 */
window.VIETLENS_SAMPLE = Object.freeze({
  generatedAt: '2026-07-15T09:00:00+07:00',
  datasetStatus: 'sample-proxy',
  period: 'Quý II/2026',
  cadence: 'Cập nhật theo quý; một số chỉ tiêu theo năm',
  // Mỗi chỉ tiêu: value/display là số minh họa; period/source/method/limitation là XUẤT XỨ.
  // Giữ các id engine cần (trade, fx, weather, logistics, energy, consumer); thêm chỉ tiêu chiều sâu.
  indicators: [
    { id: 'trade', label: 'Xuất khẩu ĐBSCL theo mặt hàng', value: 68, display: '+6,8% n/n', delta: 6.8, unit: 'yoy', direction: 'up', domain: 'trade', confidence: 0.82,
      official: true, period: 'Quý II/2026', source: 'Tổng cục Hải quan · số liệu tờ khai',
      method: 'Tổng hợp kim ngạch theo mã HS và thị trường, so cùng kỳ năm trước',
      limitation: 'Số sơ bộ; điều chỉnh khi có báo cáo chính thức cuối quý' },
    { id: 'rice', label: 'Chuỗi giá trị lúa gạo ĐBSCL', value: 71, display: 'Giá 9.850 đ/kg', delta: 4.2, unit: 'qoq', direction: 'up', domain: 'agri', confidence: 0.80,
      official: true, period: 'Quý II/2026', source: 'Bộ NN&PTNT · bản tin giá nông sản',
      method: 'Giá lúa tại kho bình quân quý, đối chiếu kim ngạch gạo xuất khẩu',
      limitation: 'Giá vùng, chưa tách theo giống lúa; biến động vụ Hè–Thu' },
    { id: 'shrimp', label: 'Chuỗi tôm nước lợ', value: 58, display: '−3,1% n/n', delta: -3.1, unit: 'yoy', direction: 'down', domain: 'agri', confidence: 0.74,
      official: true, period: 'Quý II/2026', source: 'VASEP · thống kê ngành thủy sản',
      method: 'Kim ngạch tôm theo thị trường, giá nguyên liệu bình quân quý',
      limitation: 'Phụ thuộc rào cản kỹ thuật thị trường nhập; độ trễ báo cáo ~1 tháng' },
    { id: 'consumer', label: 'Sức mua nội địa (bán lẻ)', value: 59, display: 'Ổn định', delta: 0.8, unit: 'qoq', direction: 'flat', domain: 'economy', confidence: 0.72,
      official: true, period: 'Quý II/2026', source: 'Tổng cục Thống kê · tổng mức bán lẻ',
      method: 'Tổng mức bán lẻ hàng hóa & dịch vụ, loại trừ yếu tố giá',
      limitation: 'Cấp vùng; chưa bóc tách theo nhóm hàng chi tiết' },
    { id: 'fdi', label: 'FDI đăng ký theo tỉnh & ngành', value: 63, display: 'Lũy kế +5,4%', delta: 5.4, unit: 'ytd', direction: 'up', domain: 'economy', confidence: 0.79,
      official: true, period: '6 tháng đầu 2026', source: 'Bộ KH&ĐT (Cục ĐTNN)',
      method: 'Vốn đăng ký cấp mới & tăng thêm, phân theo tỉnh và ngành cấp 1',
      limitation: 'Vốn đăng ký ≠ vốn thực hiện; một dự án lớn có thể lệch số vùng' },
    { id: 'institution', label: 'Môi trường thể chế cấp tỉnh (PCI)', value: 64, display: '64/100', delta: 1.6, unit: 'index', direction: 'up', domain: 'institution', confidence: 0.83,
      official: true, period: 'Năm 2025 (công bố 2026)', source: 'VCCI · Chỉ số PCI',
      method: 'Chỉ số năng lực cạnh tranh cấp tỉnh, khảo sát doanh nghiệp',
      limitation: 'Nhịp năm, không phải quý; phản ánh cảm nhận doanh nghiệp' },
    { id: 'fx', label: 'Tỷ giá USD/VND (bình quân quý)', value: 63, display: '≈ 25.400', delta: 1.9, unit: 'qoq', direction: 'up', domain: 'finance', confidence: 0.76,
      official: true, period: 'Quý II/2026', source: 'Ngân hàng Nhà nước · tỷ giá trung tâm',
      method: 'Bình quân tỷ giá trung tâm theo quý (không phải giá thời gian thực)',
      limitation: 'Là bình quân quý cho mục đích cơ cấu, không dùng cho giao dịch' },
    { id: 'logistics', label: 'Chi phí logistics/cước (chỉ số quý)', value: 54, display: '54/100', delta: -2.4, unit: 'index', direction: 'down', domain: 'logistics', confidence: 0.69,
      official: false, period: 'Quý II/2026', source: 'Hiệp hội & báo cáo cảng (thứ cấp)',
      method: 'Chỉ số tổng hợp cước đường bộ/đường thủy & thời gian thông quan',
      limitation: 'Nguồn thứ cấp, độ phủ chưa đầy đủ; đánh dấu proxy công khai' },
    { id: 'energy', label: 'Chi phí năng lượng sản xuất (quý)', value: 57, display: '57/100', delta: 4.1, unit: 'index', direction: 'up', domain: 'energy', confidence: 0.71,
      official: false, period: 'Quý II/2026', source: 'Biểu giá EVN + proxy công khai',
      method: 'Chỉ số chi phí điện sản xuất bình quân quý theo biểu giá công bố',
      limitation: 'Ước lượng theo cơ cấu ngành; proxy công khai, chưa kiểm định' },
    { id: 'weather', label: 'Rủi ro mùa vụ & thủy văn ĐBSCL', value: 61, display: '61/100', delta: 8.0, unit: 'index', direction: 'up', domain: 'weather', confidence: 0.78,
      official: true, period: 'Nhận định mùa Q3/2026', source: 'NCHMF · bản tin nhận định mùa',
      method: 'Tổng hợp nhận định mùa (mưa, xâm nhập mặn, thủy văn) theo quý',
      limitation: 'Là nhận định xu thế mùa, không phải dự báo thời điểm cụ thể' }
  ],
  regions: [
    { id: 'north', name: 'Bắc Bộ', x: 52, y: 14, risk: 48, weather: 55, trade: 62, logistics: 44 },
    { id: 'hanoi', name: 'Hà Nội', x: 55, y: 25, risk: 52, weather: 48, trade: 70, logistics: 50 },
    { id: 'central', name: 'Miền Trung', x: 49, y: 47, risk: 66, weather: 78, trade: 50, logistics: 61 },
    { id: 'highlands', name: 'Tây Nguyên', x: 38, y: 62, risk: 58, weather: 64, trade: 42, logistics: 57 },
    { id: 'hcm', name: 'TP.HCM', x: 49, y: 78, risk: 55, weather: 49, trade: 82, logistics: 67 },
    { id: 'mekong', name: 'ĐBSCL', x: 37, y: 90, risk: 69, weather: 74, trade: 65, logistics: 62 }
  ],
  // "Tín hiệu" ở đây là ĐỌC CÓ XUẤT XỨ theo quý (không phải cảnh báo thời gian thực).
  signals: [
    { id: 's1', title: 'Xuất khẩu gạo giữ đà, giá tại kho tăng theo vụ', summary: 'Kim ngạch gạo và giá lúa cùng nhích lên trong quý; cần đọc kèm chi phí logistics và biến động vụ Hè–Thu.', severity: 'medium', domain: 'agri', confidence: 0.80, sourceCount: 2, period: 'Quý II/2026' },
    { id: 's2', title: 'Tôm chịu áp lực rào cản kỹ thuật thị trường nhập', summary: 'Kim ngạch tôm giảm so cùng kỳ; nguyên nhân chủ yếu từ yêu cầu kỹ thuật và giá nguyên liệu, không phải cầu nội địa.', severity: 'high', domain: 'agri', confidence: 0.74, sourceCount: 2, period: 'Quý II/2026' },
    { id: 's3', title: 'FDI đăng ký cải thiện, lệch theo vài tỉnh trọng điểm', summary: 'Vốn đăng ký lũy kế tăng nhưng tập trung ở số ít tỉnh/ngành; cần phân biệt vốn đăng ký với vốn thực hiện.', severity: 'medium', domain: 'economy', confidence: 0.79, sourceCount: 1, period: '6 tháng đầu 2026' },
    { id: 's4', title: 'Nhận định mùa Q3 lưu ý xâm nhập mặn & thủy văn ĐBSCL', summary: 'Bản tin nhận định mùa cho thấy rủi ro mùa vụ tăng; đọc như xu thế quý, không phải dự báo thời điểm.', severity: 'high', domain: 'weather', confidence: 0.78, sourceCount: 1, period: 'Nhận định mùa Q3/2026' },
    { id: 's5', title: 'Thể chế cấp tỉnh (PCI 2025) nhích nhẹ', summary: 'Điểm PCI vùng tăng nhẹ so với năm trước; chỉ số nhịp năm, phản ánh cảm nhận doanh nghiệp.', severity: 'low', domain: 'institution', confidence: 0.83, sourceCount: 1, period: 'Năm 2025' }
  ],
  // Sổ nguồn: mỗi nguồn kèm phương pháp, giới hạn và QUYỀN TÁI PHÂN PHỐI (rủi ro lớn nhất
  // theo tài liệu — phải rà điều khoản từng nguồn TRƯỚC khi đưa vào, nhất là khi phát hành
  // qua API hoặc bán thu tiền).
  provenance: [
    { source: 'Tổng cục Thống kê (GSO)', domain: 'kinh tế/bán lẻ', type: 'chính thức, định kỳ', status: 'available', lag: 'theo quý', redistribution: 'cần rà điều khoản trước khi phát hành qua API' },
    { source: 'Tổng cục Hải quan', domain: 'thương mại theo mặt hàng', type: 'chính thức', status: 'available', lag: 'sơ bộ theo tháng/quý', redistribution: 'cần rà điều khoản tái phân phối' },
    { source: 'Bộ KH&ĐT — Cục ĐTNN', domain: 'FDI theo tỉnh/ngành', type: 'chính thức', status: 'available', lag: '6 tháng/năm', redistribution: 'cần rà điều khoản' },
    { source: 'VCCI — Chỉ số PCI', domain: 'thể chế cấp tỉnh', type: 'khảo sát công bố', type_note: 'nhịp năm', status: 'available', lag: 'theo năm', redistribution: 'ghi công bắt buộc; rà điều khoản' },
    { source: 'Bộ NN&PTNT / VASEP', domain: 'chuỗi nông sản', type: 'chính thức + hiệp hội', status: 'partial', lag: 'theo tháng/quý', redistribution: 'nguồn hiệp hội cần xin phép tái phân phối' },
    { source: 'NCHMF (khí tượng thủy văn)', domain: 'mùa vụ/thủy văn', type: 'bản tin nhận định mùa', status: 'available', lag: 'theo mùa/quý', redistribution: 'trích dẫn có ghi nguồn' },
    { source: 'Proxy công khai (cảng, cước, EVN)', domain: 'logistics/năng lượng', type: 'thứ cấp', status: 'partial', lag: 'theo quý', redistribution: 'đánh dấu proxy; không phát hành như số chính thức' }
  ]
});
