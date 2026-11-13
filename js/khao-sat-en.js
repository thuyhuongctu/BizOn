/* Bản tiếng Anh của phiếu khảo sát trước–sau (khao-sat-online.html), soạn 11/2026 cho lớp sinh viên quốc tế.
 * Chỉ dùng khi link giảng viên gửi có «lang=en»; link không có tham số ấy vẫn ra bản tiếng Việt như cũ,
 * nên các lớp đang thu số liệu bằng bản tiếng Việt không bị đổi công cụ đo.
 * Mỗi câu giữ NGUYÊN thứ tự câu và thứ tự lựa chọn của bản tiếng Việt: đáp án và cụm chuẩn đầu ra dùng chung,
 * điểm chấm tự động không đổi. Sửa câu chữ ở bản tiếng Việt thì sửa câu tương ứng ở đây. */
(function () {
  'use strict';
  window.BIZON_KS_EN = {
    // Bộ Khởi nghiệp (Bật Nghiệp) – 15 câu
    qa: [
      { q: 'The "break-even point" of a business is the output level at which:', o: ['Revenue equals total costs', 'Profit is at its highest', 'Revenue equals marketing costs', 'Inventory is zero'] },
      { q: 'When the selling price rises (all else unchanged), the quantity customers buy will usually:', o: ['Rise as well', 'Fall', 'Stay the same', 'Be impossible to predict'] },
      { q: 'Which of the following is a variable cost?', o: ['Monthly workshop rent', 'Clay raw material, in proportion to the number of products made', 'Machinery depreciation', 'Trademark registration fee'] },
      { q: 'When a competitor suddenly cuts prices very deeply, which response is usually the riskiest for a small business?', o: ['Hold the price and raise quality and brand', 'Race to undercut the competitor at any cost', 'Focus on loyal customers', 'Slightly increase marketing to maintain reach'] },
      { q: 'The quick ratio shows:', o: ['How much profit the business makes per product', 'Its ability to pay short-term debts', 'Its market share relative to competitors', 'Its revenue growth rate'] },
      { q: 'Producing far more than can be sold will directly lead to:', o: ['An immediate rise in market share', 'Higher inventory and tied-up capital', 'Lower fixed costs', 'An automatic rise in the selling price'] },
      { q: '"Increasing the marketing budget always increases profit." This statement is:', o: ['True in every case', 'False – beyond a certain point, extra spending may not be recovered by the extra revenue', 'True if competitors do no marketing', 'False because marketing does not affect revenue'] },
      { q: 'The foreign market entry mode that usually needs the least initial investment is:', o: ['Building a new factory abroad (FDI)', 'A joint venture with a local partner', 'Exporting through a distributor', 'Acquiring a local company'] },
      { q: 'What conditions make a market segment worth targeting?', o: ['The more people the better, regardless of behaviour', 'It is measurable, large enough, reachable, and the business is able to serve it', 'It only needs prices lower than competitors\'', 'It is whatever the founder feels is right'] },
      { q: 'What does the OEE indicator measure in production?', o: ['Employee satisfaction', 'Overall equipment effectiveness: machines are available, run at full speed and produce few defects', 'Revenue per machine', 'Number of shifts per week'] },
      { q: 'If the production plan exceeds the capacity of the current workforce, what happens first?', o: ['Actual output is lower than planned', 'The selling price rises automatically', 'Market share rises immediately', 'Wage costs fall'] },
      { q: 'The CAGE framework measures the "distance" between two countries along which dimensions?', o: ['Cultural – Administrative – Geographic – Economic', 'Price – Quality – Speed – Quantity', 'Capital – Labour – Land – Technology', 'Language – Religion – Cuisine – Climate'] },
      { q: 'When is a joint venture with a local partner especially useful?', o: ['When you want full control of operations', 'When you need local knowledge and relationships, and have a way to manage conflicts with the partner', 'When the business has surplus capital', 'When the market has no competitors'] },
      { q: 'Porter\'s three generic competitive strategies are:', o: ['Cost leadership – Differentiation – Focus', 'Advertising – Promotion – Sales', 'Domestic – Export – FDI', 'Online – Offline – Omnichannel'] },
      { q: 'Why should an important business decision be examined from several perspectives (strategy, finance, marketing, operations, legal)?', o: ['To look more professional', 'Each perspective reveals a different kind of impact and risk of the same decision', 'Because the law requires it', 'To make the meeting last longer'] },
    ],
    // Bộ Khởi nghiệp 2 – năm câu vận dụng thay cho câu 2, 3, 10, 13, 15 (js/khao-sat-bo2.js); tiền giữ đơn vị đồng (VND) như trong game
    thay: {
      2: { q: 'A team sells 2,000 products per round at a price of 150 thousand VND (revenue 300 million VND). For customers in this market, a 10% price increase reduces the quantity sold by about 20%. If the team raises the price to 165 thousand VND, next round\'s revenue will be closest to:',
        o: ['330 million VND – up exactly 10%, in line with the price', '300 million VND – the higher price offsets the lower quantity', '264 million VND – the 20% fall in quantity outweighs the 10% price increase', '240 million VND – down 20%, in line with the quantity'] },
      3: { q: 'One round has fixed costs of 30 million VND (premises, electricity and water) and wages for 45 workers × 1 million VND. The selling price is 150 thousand VND and the variable cost is 45 thousand VND per product. How many products must the team sell, at a minimum, to break even?',
        o: ['About 715 products', 'About 500 products', 'About 290 products', 'About 1,670 products'] },
      10: { q: 'The team has 40 workers, each able to make at most 70 products per round; the machinery has a capacity of 3,500 products. The COO sets a production plan of 3,200 products. What is the highest actual output achievable, and why?',
        o: ['3,200 – the machines still have spare capacity', '2,800 – the workforce is only enough for 40 × 70 products', '3,500 – running the machines at full capacity', '2,450 – the workforce loses a further 12% due to overload'] },
      13: { q: 'At the end of round 4 the team has 180 million VND in cash; next round it needs about 140 million VND for domestic production and wages. Three ways to enter the Thai market: exporting through a distributor (outlay 30 million VND, low profit margin, little control); a joint venture (contribute 120 million VND, shared profit, shared control); setting up its own branch (300 million VND, full control). Without further borrowing, the most sensible choice for next round is:',
        o: ['Setting up its own branch – the highest control', 'A joint venture – balancing control and risk', 'Doing both exporting and a joint venture', 'Exporting through a distributor – keeping enough cash for operations'] },
      15: { q: 'A product sells for 150 thousand VND with a variable cost of 45 thousand VND (gross margin 105 thousand VND per product). A competitor slashes prices, and the CEO plans to cut the price by 20% to 120 thousand VND. For total gross margin not to fall, sales volume must rise by at least:',
        o: ['About 40%', 'About 20% – equal to the price cut', 'About 25%', 'No increase needed – a lower price sells more by itself'] },
    },
    // Bộ Kinh doanh quốc tế (Hộ Chiếu Thương Hiệu) – 15 câu
    qaIb: [
      { q: 'For a small business with limited resources, the most important criterion when choosing its FIRST international market is:', o: ['The market with the largest size in the world', 'The fit between the product and the market\'s needs, and the business\'s current capacity to serve it', 'The place with the most competitors to learn from', 'The place geographically closest to Vietnam'] },
      { q: 'The "institutional distance" between two countries shows most clearly in:', o: ['Time-zone differences', 'Differences in regulations, standards, certifications and legal procedures', 'Currency differences', 'Flight distance'] },
      { q: 'A fast-growing market whose trends change constantly best suits a business that:', o: ['Is slow to change its products', 'Adapts quickly, with short product life cycles', 'Has very high fixed costs', 'Sells only one unchanging product'] },
      { q: 'Rank the entry modes by INCREASING level of resource commitment:', o: ['Direct investment < exporting < digital platform', 'Digital platform < direct exporting < joint venture / direct investment', 'Exporting < digital platform < licensing', 'All modes involve the same commitment'] },
      { q: 'The main advantage of entering through a local distribution partner is:', o: ['Full control over every activity', 'Leveraging the partner\'s local network and knowledge', 'Eliminating risk completely', 'Always having the highest profit margin'] },
      { q: 'Choosing a high level of commitment (such as setting up your own business unit abroad) usually gives, in exchange:', o: ['More control and higher potential profit, along with higher risk', 'Lower risk than any other mode', 'No need for initial capital', 'Exemption from all host-country regulations'] },
      { q: 'Data on "interest on social media" must be read with caution because:', o: ['This type of data is always wrong', 'Interest is not the same as purchasing power and real paying behaviour', 'Collecting it is illegal', 'Only young people use social media'] },
      { q: 'Market information supplied by a partner who wants to sell you distribution services carries the risk of being:', o: ['Biased towards their own interests', 'Absolutely accurate because they are local', 'Completely worthless', 'Trustworthy because it is free'] },
      { q: 'The most reliable way to estimate real demand BEFORE a large investment is:', o: ['Asking friends and acquaintances for their opinion', 'Test selling on a small scale and measuring real data', 'Looking at competitors\' advertising', 'Trusting the founder\'s intuition'] },
      { q: 'The "standardisation – adaptation" trade-off in internationalisation weighs:', o: ['Cost savings from scale against the fit with each local market', 'Selling price against quality', 'Online against offline sales', 'The domestic market against exports'] },
      { q: 'When the target market requires a mandatory certification, ignoring it usually leads to:', o: ['No effect at all', 'Revenue being severely limited or sales being blocked', 'Tax incentives', 'An automatic rise in reputation'] },
      { q: 'Keeping the core formula but changing the packaging and communication message for each market is a strategy of:', o: ['Partial adaptation (selective adaptation)', 'Full standardisation', 'Market withdrawal', 'Franchising'] },
      { q: 'An exporting business can hedge exchange-rate risk by:', o: ['Using forward contracts / locking in the exchange rate in advance', 'Doing nothing and hoping', 'Stopping exports completely', 'Raising selling prices continuously in line with the exchange rate'] },
      { q: '"Bottleneck growth" occurs when:', o: ['Sales grow faster than production, delivery and quality-control capacity', 'There are no customers at all', 'The selling price is too high compared with competitors', 'Import duties rise'] },
      { q: 'Why should the success of internationalisation NOT be judged by revenue alone?', o: ['Because revenue is a meaningless number', 'Because overheated growth can drain capital, damage reputation, lose partners and be unsustainable', 'Because international accounting is too complex', 'Because investors do not care about revenue'] },
    ],
    // Phần B – mức độ tự tin (8 câu mỗi bộ)
    likertB: [
      'I am confident setting a price for a new product.',
      'I am confident setting a marketing budget that fits the objectives.',
      'I can read and understand a basic profit-and-loss statement and cash flow.',
      'I am confident making decisions when information is incomplete.',
      'I work effectively with the other roles in a business team.',
      'I can estimate the break-even point for a simple business plan.',
      'I can compare the advantages and disadvantages of foreign market entry modes.',
      'I can draw lessons from the results of one business round to adjust decisions in the next.',
    ],
    likertBIb: [
      'I am confident comparing and choosing a suitable international market for a small business.',
      'I am confident choosing an entry mode that matches the resources available.',
      'I can assess the reliability and bias of a source of market information.',
      'I am confident negotiating basic terms with a distribution partner.',
      'I understand the role of certification, standards and compliance when entering a demanding market.',
      'I can identify the main international risks (exchange rate, supply chain, institutions).',
      'I can weigh global standardisation against local adaptation for a product.',
      'I can make decisions based on several criteria (profit, reputation, sustainability) rather than revenue alone.',
    ],
    // Phần C – trải nghiệm với BizOn (5 câu, chỉ ở phiếu sau)
    likertC: [
      'A class session with BizOn engages me more than an ordinary session.',
      '"Learning by doing" helps me understand business concepts more easily than listening to a lecture.',
      'The team meeting and the AI advisor\'s suggestions help me know what to do.',
      'The "Why?" explanation after each round helps me draw lessons.',
      'I want to keep using BizOn in future class sessions.',
    ],
    // Ghép bộ 2 tiếng Anh: 10 câu neo của bộ 1 + 5 câu vận dụng
    ghep2() { return this.qa.map((it, i) => this.thay[i + 1] || it); },
  };
})();
