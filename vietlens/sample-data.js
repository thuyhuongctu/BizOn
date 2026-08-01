window.VIETLENS_SAMPLE = Object.freeze({
  generatedAt: '2026-08-01T14:00:00+07:00',
  indicators: [
    { id:'fx', label:'USD/VND pressure', value:63, display:'Tăng nhẹ', delta:3.2, unit:'index', direction:'up', domain:'finance', confidence:.78, source:'SBV / market proxy', official:false, freshnessMinutes:45 },
    { id:'trade', label:'Xuất khẩu momentum', value:68, display:'+6.8%', delta:6.8, unit:'yoy', direction:'up', domain:'trade', confidence:.82, source:'NSO / MOIT periodic', official:true, freshnessMinutes:4320 },
    { id:'energy', label:'Áp lực năng lượng', value:57, display:'57/100', delta:4.1, unit:'index', direction:'up', domain:'energy', confidence:.73, source:'public market proxy', official:false, freshnessMinutes:90 },
    { id:'weather', label:'Rủi ro thời tiết', value:61, display:'61/100', delta:8.0, unit:'index', direction:'up', domain:'weather', confidence:.86, source:'NCHMF bulletin proxy', official:true, freshnessMinutes:120 },
    { id:'logistics', label:'Logistics pressure', value:54, display:'54/100', delta:-2.4, unit:'index', direction:'down', domain:'logistics', confidence:.69, source:'port/freight proxy', official:false, freshnessMinutes:240 },
    { id:'consumer', label:'Sức mua nội địa', value:59, display:'Ổn định', delta:.8, unit:'index', direction:'flat', domain:'economy', confidence:.72, source:'NSO periodic + news proxy', official:true, freshnessMinutes:10080 }
  ],
  regions: [
    { id:'north', name:'Bắc Bộ', x:52, y:14, risk:48, weather:55, trade:62, logistics:44 },
    { id:'hanoi', name:'Hà Nội', x:55, y:25, risk:52, weather:48, trade:70, logistics:50 },
    { id:'central', name:'Miền Trung', x:49, y:47, risk:66, weather:78, trade:50, logistics:61 },
    { id:'highlands', name:'Tây Nguyên', x:38, y:62, risk:58, weather:64, trade:42, logistics:57 },
    { id:'hcm', name:'TP.HCM', x:49, y:78, risk:55, weather:49, trade:82, logistics:67 },
    { id:'mekong', name:'ĐBSCL', x:37, y:90, risk:69, weather:74, trade:65, logistics:62 }
  ],
  signals: [
    { id:'s1', title:'Rủi ro mưa lớn và gián đoạn vận tải miền Trung', summary:'Tín hiệu thời tiết vượt baseline ngắn hạn; cần theo dõi đường bộ, cảng và lịch giao hàng.', severity:'high', domain:'weather', confidence:.86, sourceCount:3, freshnessMinutes:120 },
    { id:'s2', title:'Động lực xuất khẩu duy trì tích cực', summary:'Tín hiệu thương mại định kỳ và tin thị trường cùng cho thấy xu hướng mở rộng, nhưng độ trễ dữ liệu còn lớn.', severity:'medium', domain:'trade', confidence:.82, sourceCount:4, freshnessMinutes:4320 },
    { id:'s3', title:'Áp lực tỷ giá tăng nhẹ', summary:'Biến động chưa vượt ngưỡng cảnh báo cao nhưng có thể làm tăng chi phí nhập khẩu nguyên liệu.', severity:'medium', domain:'finance', confidence:.78, sourceCount:3, freshnessMinutes:45 },
    { id:'s4', title:'ĐBSCL cần theo dõi rủi ro thời tiết–nông nghiệp', summary:'Tổ hợp tín hiệu mưa, thủy văn và logistics tạo rủi ro trung–cao cho nông nghiệp và thủy sản.', severity:'high', domain:'mekong', confidence:.80, sourceCount:3, freshnessMinutes:180 },
    { id:'s5', title:'Chi phí logistics hạ nhẹ nhưng chưa bền vững', summary:'Một số proxy vận tải giảm, song mức độ xác nhận nguồn còn hạn chế.', severity:'low', domain:'logistics', confidence:.69, sourceCount:2, freshnessMinutes:240 }
  ],
  provenance: [
    { source:'National Statistics Office', domain:'economy/trade', type:'official periodic', status:'stale-by-design', lag:'3–30 days' },
    { source:'National Center for Hydro-Meteorological Forecasting', domain:'weather', type:'official bulletin', status:'available', lag:'1–6 hours' },
    { source:'State Bank / public FX proxies', domain:'finance', type:'official + market', status:'available', lag:'15–60 min' },
    { source:'MOIT market information', domain:'trade/policy', type:'official news', status:'available', lag:'hours–days' },
    { source:'Freight and port public proxies', domain:'logistics', type:'secondary', status:'partial', lag:'hours–days' }
  ]
});