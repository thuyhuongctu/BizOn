/* Kế hoạch cảnh thử 10 giây cho bộ dựng video dọc 3D (đặc tả specs/004-video-ngan-3d, câu chuyện 1).
 * CEO và Lumina đất sét đứng bên bàn kiểm có trái sầu riêng; CEO đội nón lá; máy quay đẩy vào chầm chậm rồi lia sang.
 * (Không dùng cfo.glb: túi tiền trên tay bị kéo méo khi cử động. Không dùng tu-v3.glb khi cần đúng nhận diện thầy Tu Phan:
 *  mô hình này chưa có kính.)
 * Dùng trong test/video-3d-bo-dung.test.js. Đường dẫn tính từ gốc kho; thời lượng cảnh tính bằng giây. */
export default {
  ten: 'ke-hoach-thu',
  fps: 30,
  nhanVat: {
    ceo: 'assets/models/nhan-vat/ceo-v3.glb',
    lumina: 'assets/models/nhan-vat/lumina.glb',
  },
  canh: [
    {
      ten: 'ban-kiem', dai: 5, nen: 0xe7d6b4,
      nguoi: [
        { id: 'ceo', vi: [-0.45, 0], huong: 25, dong: 'Talk', non: true },
        { id: 'lumina', vi: [0.5, 0.05], huong: -20, dong: 'Talk', lech: 0.4 },
      ],
      dao: [
        { loai: 'ban-kiem', vi: [0, -0.7], tham: [1.2, 0.55, 0.72] },
        { loai: 'trai', vi: [0, -0.7], y: 0.75, tham: [0.11, 5] },
        { loai: 'thung-xop', vi: [-1.1, -1.0] },
      ],
      may: { tu: [0, 1.15, 4.4], den: [0, 1.05, 3.2], nhin: [0, 0.8, 0], nhinDen: [0, 0.85, 0], fov: 38 },
    },
    {
      ten: 'container', dai: 5, nen: 0xcfe0e6,
      nguoi: [
        { id: 'lumina', vi: [0.3, 0.6], huong: -10, dong: 'Wave' },
      ],
      dao: [
        { loai: 'container', vi: [-0.6, -1.4], tham: [0xc0503a] },
        { loai: 'container', vi: [-0.6, -1.4], y: 1.32, tham: [0x3a6e9a] },
        { loai: 'hang-rao', vi: [1.6, -0.6], huong: 90, tham: [2.5] },
      ],
      may: { tu: [2.0, 1.2, 4.4], den: [0.6, 1.1, 3.6], nhin: [0, 0.95, -0.6], nhinDen: [-0.2, 0.95, -0.4], fov: 40 },
    },
  ],
};
