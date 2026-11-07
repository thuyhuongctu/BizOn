/* Bộ câu hỏi kiến thức Bật Nghiệp – bản 2 (instrument «batnghiep2», soạn 11/2026).
 * Giữ 10 câu neo của bản 1 để so sánh được với đợt 10/2026; thay 5 câu có tỷ lệ đúng cao nhất (câu 2, 3, 10, 13, 15; 97–100 % đúng ở
 * phiếu trước, n = 67) bằng câu vận dụng phải tính từ số cho sẵn, lấy đúng tham số của engine (giá tham chiếu 150 nghìn, chi phí biến đổi
 * 45 nghìn, chi phí cố định 30 triệu, lương 1 triệu/người, 70 sản phẩm/người). Căn cứ và đáp án: docs/research/BO-CAU-HOI-KIEN-THUC-V2.md.
 * Dùng chung cho khao-sat-online.html (chấm tự động) và khao-sat.html (phiếu in, ?bo=batnghiep2). */
(function () {
  'use strict';
  window.BIZON_KS_BO2 = {
    id: 'batnghiep2',
    ten: 'Khởi nghiệp – bộ 2',
    // Câu thay thế theo số thứ tự trên phiếu (1–15); các câu còn lại lấy nguyên từ bộ 1
    thay: {
      2: { q: 'Một đội đang bán 2.000 sản phẩm mỗi vòng ở giá 150 nghìn ₫ (doanh thu 300 triệu ₫). Với khách của thị trường này, giá tăng 10% thì lượng bán giảm khoảng 20%. Nếu đội tăng giá lên 165 nghìn ₫, doanh thu vòng tới ước tính gần nhất với:',
        o: ['330 triệu ₫ – tăng đúng 10% theo giá', '300 triệu ₫ – giá tăng bù cho lượng giảm', '264 triệu ₫ – lượng giảm 20% lấn át mức tăng giá 10%', '240 triệu ₫ – giảm 20% theo lượng'], key: 'c' },
      3: { q: 'Một vòng chơi có chi phí cố định 30 triệu ₫ (mặt bằng, điện nước) và lương 45 công nhân × 1 triệu ₫. Giá bán 150 nghìn ₫, chi phí biến đổi 45 nghìn ₫ mỗi sản phẩm. Đội phải bán ít nhất bao nhiêu sản phẩm để hòa vốn?',
        o: ['Khoảng 715 sản phẩm', 'Khoảng 500 sản phẩm', 'Khoảng 290 sản phẩm', 'Khoảng 1.670 sản phẩm'], key: 'a' },
      10: { q: 'Đội có 40 công nhân, mỗi người làm tối đa 70 sản phẩm mỗi vòng; máy móc có công suất 3.500 sản phẩm. COO đặt kế hoạch sản xuất 3.200 sản phẩm. Sản lượng thực tế cao nhất có thể đạt là bao nhiêu, vì sao?',
        o: ['3.200 – máy vẫn còn dư công suất', '2.800 – nhân công chỉ đủ cho 40 × 70 sản phẩm', '3.500 – chạy hết công suất máy', '2.450 – nhân công bị trừ thêm 12% do quá tải'], key: 'b' },
      13: { q: 'Cuối vòng 4, đội còn 180 triệu ₫ tiền mặt; vòng tới cần khoảng 140 triệu ₫ cho sản xuất và lương trong nước. Ba cách vào thị trường Thái Lan: xuất khẩu qua nhà phân phối (bỏ ra 30 triệu ₫, biên lợi nhuận thấp, ít kiểm soát); liên doanh (góp 120 triệu ₫, chia lợi nhuận, cùng kiểm soát); tự lập chi nhánh (300 triệu ₫, toàn quyền). Nếu không vay thêm, lựa chọn hợp lý nhất cho vòng tới là:',
        o: ['Tự lập chi nhánh – kiểm soát cao nhất', 'Liên doanh – cân bằng kiểm soát và rủi ro', 'Làm đồng thời xuất khẩu và liên doanh', 'Xuất khẩu qua nhà phân phối – giữ đủ tiền cho vận hành'], key: 'd' },
      15: { q: 'Sản phẩm bán 150 nghìn ₫, chi phí biến đổi 45 nghìn ₫ (lãi gộp 105 nghìn ₫ mỗi sản phẩm). Đối thủ phá giá, CEO định giảm giá 20% xuống 120 nghìn ₫. Để tổng lãi gộp không giảm, lượng bán phải tăng ít nhất:',
        o: ['Khoảng 40%', 'Khoảng 20% – bằng mức giảm giá', 'Khoảng 25%', 'Không cần tăng – giá rẻ hơn tự bán nhiều hơn'], key: 'a' },
    },
    // Ghép bộ 2 từ bộ 1: qa1 là mảng 15 câu {q, o}, key1 là mảng 15 chữ cái
    ghep(qa1, key1) {
      const qa = qa1.map((it, i) => this.thay[i + 1] ? { q: this.thay[i + 1].q, o: this.thay[i + 1].o } : it);
      const key = key1.map((k, i) => this.thay[i + 1] ? this.thay[i + 1].key : k);
      return { qa, key };
    },
  };
})();
