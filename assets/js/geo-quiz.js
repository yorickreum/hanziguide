(function() {
  'use strict';

  var pageLang = document.documentElement.getAttribute('lang') || 'en';
  var uiLocales = {
    en: {
      progress: 'Question {current} of {total}',
      next: 'Next',
      showMap: 'Show Map',
      lowConfidence: 'Low confidence',
      mediumConfidence: 'Medium confidence',
      highConfidence: 'High confidence',
      coreLike: 'core-like',
      marginal: 'marginal',
      weak: 'weak',
      trace: 'trace',
      relativeMatch: '{percent}% relative match · {band}',
      mapFallback: 'OpenStreetMap could not load. The ranked list still shows your regional matches.',
      legendTitle: 'How to read the map',
      legendColor: 'Color = atlas region group',
      legendGroups: 'Different colors mean different groups',
      legendStrength: 'Darker/larger = stronger match',
      legendRings: 'Rings = closest local signal',
      legendDots: 'Dots = atlas localities',
      loadingLocalities: 'Loading Linguistic Atlas of Chinese Dialects localities...',
      noLocalities: 'No atlas locality match is available for this answer pattern.',
      localityScore: '{percent}% locality score',
      moreSpecific: 'More specific: {label}',
      noLocalReport: 'No local report is available yet.',
      strongestSignal: 'Your strongest broad signal is <strong>{label}</strong>.',
      specificSignal: ' The local map signal points more specifically toward <strong>{label}</strong>',
      nearLocalities: ', near atlas localities such as {localities}',
      noNarrowLabel: ' The answers do not yet support a reliable narrower regional label.',
      closestLocalitySignals: 'Closest locality signals: {localities}.',
      noMapSignal: 'No strong geographic signal yet.',
      mapInsightIntro: 'The map zooms to the strongest local cluster when the atlas locality scores are strong enough. Weak background signals are muted so the closest local signal stands out.',
      topRegionCurrent: '<strong>{label}</strong> is currently {band} for your answer pattern.',
      closestLocalSignal: 'The closest local signal is <strong>{label}</strong>, based on nearby atlas localities such as {localities}.',
      overlapPattern: 'Your top two regions are close, so this should be read as an overlap pattern rather than a precise location.',
      dialectGeographyNote: 'This follows the idea that Chinese dialect geography has stronger centers, softer margins, and transition zones.',
      resultShared: 'Result shared.',
      creatingShareImage: 'Creating share image...',
      shareImageFailed: 'Could not create share image.',
      shareCardSent: 'Share card sent.',
      shareImageDownloaded: 'Share image downloaded.',
      shareTextCopied: 'Share text copied to clipboard.',
      copyFailed: 'Copy failed. Select and copy the page URL instead.',
      shareCardTitle: 'Your Chinese variety mix',
      closestLocalSignalCanvas: 'Closest local signal: {label}',
      closestAtlasLocalities: 'Closest atlas localities',
      tryYours: 'Try yours: hanziguide.com{path}',
      shareTitle: 'Where is your Chinese from?',
      shareText: 'I\'m {blend} on the Hanzi Guide Chinese variety quiz ({confidence}, {count} questions).',
      shareMoreSpecific: ' More specific: {label}.',
      shareNextClosest: ' Next closest: {label}.',
      askActualLocation: 'Tell us the actual location so we can improve the model.',
      enterActualLocation: 'Please enter the actual location before sending feedback.',
      feedbackSent: 'Feedback sent. Thank you.',
      feedbackUnavailable: 'Feedback recorded on this page, but Matomo was not available.',
      feedbackDefault: 'Feedback sends your quiz answers and result to us so we can improve the model.'
    },
    'zh-Hans': {
      progress: '第 {current} / {total} 题',
      next: '下一题',
      showMap: '显示地图',
      lowConfidence: '低可信度',
      mediumConfidence: '中等可信度',
      highConfidence: '高可信度',
      coreLike: '核心区相似',
      marginal: '边缘区',
      weak: '较弱',
      trace: '微弱',
      relativeMatch: '{percent}% 相对匹配 · {band}',
      mapFallback: 'OpenStreetMap 无法加载。区域排名仍会显示你的匹配结果。',
      legendTitle: '如何读图',
      legendColor: '颜色 = 地图集区域组',
      legendGroups: '不同颜色表示不同区域组',
      legendStrength: '更深/更大 = 匹配更强',
      legendRings: '圆环 = 最接近的本地信号',
      legendDots: '圆点 = 地图集地点',
      loadingLocalities: '正在加载《汉语方言地图集》地点...',
      noLocalities: '这个答案模式暂无可用的地图集地点匹配。',
      localityScore: '{percent}% 地点分数',
      moreSpecific: '更具体：{label}',
      noLocalReport: '目前还没有本地报告。',
      strongestSignal: '你最强的宽泛信号是 <strong>{label}</strong>。',
      specificSignal: ' 本地地图信号更具体地指向 <strong>{label}</strong>',
      nearLocalities: '，接近 {localities} 等地图集地点',
      noNarrowLabel: ' 这些答案还不足以支持可靠的更细区域标签。',
      closestLocalitySignals: '最接近的地点信号：{localities}。',
      noMapSignal: '目前没有强地理信号。',
      mapInsightIntro: '当地图集地点分数足够强时，地图会缩放到最强的本地聚类。较弱的背景信号会淡化，让最接近的本地信号更突出。',
      topRegionCurrent: '<strong>{label}</strong> 目前对你的答案模式是 {band}。',
      closestLocalSignal: '最接近的本地信号是 <strong>{label}</strong>，依据附近的地图集地点，例如 {localities}。',
      overlapPattern: '你的前两个区域很接近，因此应理解为重叠模式，而不是精确地点。',
      dialectGeographyNote: '这遵循中文方言地理有较强中心、较软边缘和过渡区的观点。',
      resultShared: '结果已分享。',
      creatingShareImage: '正在生成分享图...',
      shareImageFailed: '无法生成分享图。',
      shareCardSent: '结果图已分享。',
      shareImageDownloaded: '分享图已下载。',
      shareTextCopied: '分享文字已复制到剪贴板。',
      copyFailed: '复制失败。请手动复制页面网址。',
      shareCardTitle: '你的中文地域混合',
      closestLocalSignalCanvas: '最接近的本地信号：{label}',
      closestAtlasLocalities: '最接近的地图集地点',
      tryYours: '试试你的结果：hanziguide.com{path}',
      shareTitle: '你的中文来自哪里？',
      shareText: '我在 Hanzi Guide 中文地域测验上的结果是 {blend}（{confidence}，{count} 题）。',
      shareMoreSpecific: ' 更具体：{label}。',
      shareNextClosest: ' 下一个接近区域：{label}。',
      askActualLocation: '告诉我们实际地点，帮助改进模型。',
      enterActualLocation: '请先输入实际地点再发送反馈。',
      feedbackSent: '反馈已发送，谢谢。',
      feedbackUnavailable: '反馈已记录在本页，但 Matomo 当前不可用。',
      feedbackDefault: '反馈会发送你的测验答案和结果，帮助我们改进模型。'
    },
    'zh-Hant': {
      progress: '第 {current} / {total} 題',
      next: '下一題',
      showMap: '顯示地圖',
      lowConfidence: '低可信度',
      mediumConfidence: '中等可信度',
      highConfidence: '高可信度',
      coreLike: '核心區相似',
      marginal: '邊緣區',
      weak: '較弱',
      trace: '微弱',
      relativeMatch: '{percent}% 相對匹配 · {band}',
      mapFallback: 'OpenStreetMap 無法載入。區域排名仍會顯示你的匹配結果。',
      legendTitle: '如何讀圖',
      legendColor: '顏色 = 地圖集區域組',
      legendGroups: '不同顏色表示不同區域組',
      legendStrength: '更深/更大 = 匹配更強',
      legendRings: '圓環 = 最接近的本地信號',
      legendDots: '圓點 = 地圖集地點',
      loadingLocalities: '正在載入《漢語方言地圖集》地點...',
      noLocalities: '這個答案模式暫無可用的地圖集地點匹配。',
      localityScore: '{percent}% 地點分數',
      moreSpecific: '更具體：{label}',
      noLocalReport: '目前還沒有本地報告。',
      strongestSignal: '你最強的寬泛信號是 <strong>{label}</strong>。',
      specificSignal: ' 本地地圖信號更具體地指向 <strong>{label}</strong>',
      nearLocalities: '，接近 {localities} 等地圖集地點',
      noNarrowLabel: ' 這些答案還不足以支持可靠的更細區域標籤。',
      closestLocalitySignals: '最接近的地點信號：{localities}。',
      noMapSignal: '目前沒有強地理信號。',
      mapInsightIntro: '當地圖集地點分數足夠強時，地圖會縮放到最強的本地聚類。較弱的背景信號會淡化，讓最接近的本地信號更突出。',
      topRegionCurrent: '<strong>{label}</strong> 目前對你的答案模式是 {band}。',
      closestLocalSignal: '最接近的本地信號是 <strong>{label}</strong>，依據附近的地圖集地點，例如 {localities}。',
      overlapPattern: '你的前兩個區域很接近，因此應理解為重疊模式，而不是精確地點。',
      dialectGeographyNote: '這遵循中文方言地理有較強中心、較軟邊緣和過渡區的觀點。',
      resultShared: '結果已分享。',
      creatingShareImage: '正在產生分享圖...',
      shareImageFailed: '無法產生分享圖。',
      shareCardSent: '結果圖已分享。',
      shareImageDownloaded: '分享圖已下載。',
      shareTextCopied: '分享文字已複製到剪貼簿。',
      copyFailed: '複製失敗。請手動複製頁面網址。',
      shareCardTitle: '你的中文地域混合',
      closestLocalSignalCanvas: '最接近的本地信號：{label}',
      closestAtlasLocalities: '最接近的地圖集地點',
      tryYours: '試試你的結果：hanziguide.com{path}',
      shareTitle: '你的中文來自哪裡？',
      shareText: '我在 Hanzi Guide 中文地域測驗上的結果是 {blend}（{confidence}，{count} 題）。',
      shareMoreSpecific: ' 更具體：{label}。',
      shareNextClosest: ' 下一個接近區域：{label}。',
      askActualLocation: '告訴我們實際地點，幫助改進模型。',
      enterActualLocation: '請先輸入實際地點再送出回饋。',
      feedbackSent: '回饋已送出，謝謝。',
      feedbackUnavailable: '回饋已記錄在本頁，但 Matomo 目前不可用。',
      feedbackDefault: '回饋會送出你的測驗答案和結果，幫助我們改進模型。'
    }
  };
  var ui = uiLocales[pageLang] || uiLocales.en;

  function uiText(key, values) {
    var text = ui[key] || uiLocales.en[key] || key;
    Object.keys(values || {}).forEach(function(name) {
      text = text.replace(new RegExp('\\{' + name + '\\}', 'g'), values[name]);
    });
    return text;
  }

  var categories = {
    hk_cantonese: {
      label: 'Hong Kong Cantonese',
      variety: 'Yue / Cantonese',
      macroRegion: 'Southern branch: Yue',
      mapColor: '#d65873',
      region: 'Hong Kong / Macau',
      center: [22.3193, 114.1694],
      radius: 52000,
      summary: 'Your answers most closely match Hong Kong-style Cantonese speech and casual written Cantonese.'
    },
    guangdong_cantonese: {
      label: 'Guangdong Cantonese',
      variety: 'Yue / Cantonese',
      macroRegion: 'Southern branch: Yue',
      mapColor: '#d65873',
      region: 'Guangdong',
      center: [23.1291, 113.2644],
      radius: 135000,
      summary: 'Your answers point toward Cantonese or Yue patterns associated with Guangdong.'
    },
    mainland_mandarin: {
      label: 'Northern / Standard Mainland Mandarin',
      variety: 'Mandarin',
      macroRegion: 'North Mandarin',
      mapColor: '#376fb7',
      region: 'North China / Standard Mandarin',
      center: [36.6, 114.7],
      radius: 620000,
      summary: 'Your answers mostly follow standard Mainland Mandarin vocabulary, characters, and phrasing.'
    },
    taiwan_mandarin: {
      label: 'Taiwanese Mandarin',
      variety: 'Mandarin',
      macroRegion: 'Taiwan Mandarin with Min/Hakka contact',
      mapColor: '#50a37b',
      region: 'Taiwan',
      center: [23.6978, 120.9605],
      radius: 170000,
      summary: 'Your answers are closest to Taiwan Mandarin norms, especially written forms and everyday wording.'
    },
    sichuan_mandarin: {
      label: 'Southwestern Mandarin',
      variety: 'Southwestern Mandarin',
      macroRegion: 'South Mandarin',
      mapColor: '#56a6d6',
      region: 'Sichuan / Chongqing',
      center: [30.5728, 104.0668],
      radius: 330000,
      summary: 'Your answers show some Southwestern Mandarin clues associated with Sichuan and Chongqing.'
    },
    northeast_mandarin: {
      label: 'Northeastern Mandarin',
      variety: 'Northeastern Mandarin',
      macroRegion: 'North Mandarin innovation zone',
      mapColor: '#214f9a',
      region: 'Northeast China',
      center: [43.8171, 125.3235],
      radius: 430000,
      summary: 'Your answers include clues often associated with Northeastern Mandarin.'
    },
    wu_shanghai: {
      label: 'Wu / Shanghainese-influenced Chinese',
      variety: 'Wu',
      macroRegion: 'Yangtze / Wu area',
      mapColor: '#95a843',
      region: 'Shanghai / Wu area',
      center: [31.2304, 121.4737],
      radius: 190000,
      summary: 'Your answers show Wu or Shanghainese-influenced patterns.'
    },
    min_hokkien: {
      label: 'Min / Hokkien-influenced Chinese',
      variety: 'Min Nan / Hokkien',
      macroRegion: 'Southern branch: Min',
      mapColor: '#d85b32',
      region: 'Fujian / Southern Min area',
      center: [24.4798, 118.0894],
      radius: 210000,
      summary: 'Your answers include Southern Min or Hokkien-like clues.'
    },
    central_china: {
      label: 'Central transition-zone Chinese',
      variety: 'Xiang / Gan / Hui-influenced transition zone',
      macroRegion: 'Central transition region',
      mapColor: '#9a6fc2',
      region: 'Hunan / Hubei / Jiangxi / southern Anhui',
      center: [28.4, 113.3],
      radius: 360000,
      summary: 'Your answers combine signals associated with the central transition zone where several Chinese varieties overlap.'
    },
    mixed: {
      label: 'Mixed / learner profile',
      variety: 'Mixed Chinese background',
      macroRegion: 'Mixed or uncertain',
      mapColor: '#6f7b83',
      region: 'Mixed',
      center: [29.0, 112.0],
      radius: 500000,
      summary: 'Your answers combine signals from multiple regions or learning contexts.'
    }
  };

  var categoryLocales = {
    'zh-Hans': {
      hk_cantonese: ['香港粤语', '粤语', '南方分支：粤语', '香港 / 澳门', '你的答案最接近香港式粤语和日常书面粤语。'],
      guangdong_cantonese: ['广东粤语', '粤语', '南方分支：粤语', '广东', '你的答案指向广东相关的粤语或粤方言模式。'],
      mainland_mandarin: ['北方 / 标准大陆普通话', '普通话', '北方官话', '华北 / 标准普通话', '你的答案大多符合大陆标准普通话的词汇、用字和表达。'],
      taiwan_mandarin: ['台湾国语', '国语', '受闽语/客语接触影响的台湾国语', '台湾', '你的答案最接近台湾国语习惯，尤其是书写形式和日常用词。'],
      sichuan_mandarin: ['西南官话', '西南官话', '南方官话', '四川 / 重庆', '你的答案显示出一些与四川和重庆相关的西南官话线索。'],
      northeast_mandarin: ['东北官话', '东北官话', '北方官话创新区', '中国东北', '你的答案包含一些常见于东北官话的线索。'],
      wu_shanghai: ['吴语 / 上海话影响的中文', '吴语', '长江下游 / 吴语区', '上海 / 吴语区', '你的答案显示出吴语或上海话影响的模式。'],
      min_hokkien: ['闽语 / 福建话影响的中文', '闽南语 / 福建话', '南方分支：闽语', '福建 / 闽南语区', '你的答案包含闽南语或福建话一类的线索。'],
      central_china: ['中部过渡区中文', '湘语 / 赣语 / 徽语影响的过渡区', '中部过渡区域', '湖南 / 湖北 / 江西 / 皖南', '你的答案结合了中部过渡区的信号，这里多种中文变体相互重叠。'],
      mixed: ['混合 / 学习者画像', '混合中文背景', '混合或不确定', '混合', '你的答案结合了多个地区或学习背景的信号。']
    },
    'zh-Hant': {
      hk_cantonese: ['香港粵語', '粵語', '南方分支：粵語', '香港 / 澳門', '你的答案最接近香港式粵語和日常書面粵語。'],
      guangdong_cantonese: ['廣東粵語', '粵語', '南方分支：粵語', '廣東', '你的答案指向廣東相關的粵語或粵方言模式。'],
      mainland_mandarin: ['北方 / 標準大陸普通話', '普通話', '北方官話', '華北 / 標準普通話', '你的答案大多符合大陸標準普通話的詞彙、用字和表達。'],
      taiwan_mandarin: ['台灣國語', '國語', '受閩語/客語接觸影響的台灣國語', '台灣', '你的答案最接近台灣國語習慣，尤其是書寫形式和日常用詞。'],
      sichuan_mandarin: ['西南官話', '西南官話', '南方官話', '四川 / 重慶', '你的答案顯示出一些與四川和重慶相關的西南官話線索。'],
      northeast_mandarin: ['東北官話', '東北官話', '北方官話創新區', '中國東北', '你的答案包含一些常見於東北官話的線索。'],
      wu_shanghai: ['吳語 / 上海話影響的中文', '吳語', '長江下游 / 吳語區', '上海 / 吳語區', '你的答案顯示出吳語或上海話影響的模式。'],
      min_hokkien: ['閩語 / 福建話影響的中文', '閩南語 / 福建話', '南方分支：閩語', '福建 / 閩南語區', '你的答案包含閩南語或福建話一類的線索。'],
      central_china: ['中部過渡區中文', '湘語 / 贛語 / 徽語影響的過渡區', '中部過渡區域', '湖南 / 湖北 / 江西 / 皖南', '你的答案結合了中部過渡區的信號，這裡多種中文變體相互重疊。'],
      mixed: ['混合 / 學習者輪廓', '混合中文背景', '混合或不確定', '混合', '你的答案結合了多個地區或學習背景的信號。']
    }
  };

  function applyCategoryLocales() {
    var localized = categoryLocales[pageLang];
    if (!localized) return;
    Object.keys(localized).forEach(function(key) {
      if (!categories[key]) return;
      categories[key].label = localized[key][0];
      categories[key].variety = localized[key][1];
      categories[key].macroRegion = localized[key][2];
      categories[key].region = localized[key][3];
      categories[key].summary = localized[key][4];
    });
  }

  applyCategoryLocales();

  var questions = [
    {
      type: 'Word choice',
      prompt: 'A kid runs past you in the street. What word pops into your head?',
      note: 'Go with the word you would actually say, not the one that feels most formal.',
      icon: icon('fa-child', 'people'),
      answers: [
        answer('小孩', { mainland_mandarin: 4, taiwan_mandarin: 2 }, 'You chose 小孩 for “child,” a common Mandarin form.'),
        answer('小朋友', { hk_cantonese: 3, guangdong_cantonese: 3, taiwan_mandarin: 2 }, 'You chose 小朋友, which is common in Cantonese contexts and also familiar in Taiwan Mandarin.'),
        answer('細路', { hk_cantonese: 5, guangdong_cantonese: 4 }, 'You chose 細路, a strong Cantonese clue.'),
        answer('囡仔', { min_hokkien: 5, taiwan_mandarin: 1 }, 'You chose 囡仔, which points toward Southern Min or Hokkien exposure.'),
        answer('娃娃', { sichuan_mandarin: 3, northeast_mandarin: 1, mainland_mandarin: 1 }, 'You chose 娃娃, which can be a regional Mandarin clue.')
      ]
    },
    {
      type: 'Written usage',
      prompt: 'Your friend asks if you have any. What would you text back for “no / none”?',
      note: 'Pick the form you would actually type in a casual message.',
      answers: [
        answer('没有', { mainland_mandarin: 4, sichuan_mandarin: 2, northeast_mandarin: 2 }, 'You actively use 没有, matching standard simplified Mandarin writing.'),
        answer('沒有', { taiwan_mandarin: 4, mainland_mandarin: 1 }, 'You actively use 沒有, matching traditional-character Mandarin writing.'),
        answer('冇', { hk_cantonese: 6, guangdong_cantonese: 5 }, 'You actively use 冇, a strong written Cantonese clue.'),
        answer('無', { taiwan_mandarin: 2, min_hokkien: 2, hk_cantonese: 1 }, 'You use 無, which gives a traditional-script or southern written-form signal.'),
        answer('I would not write this in Chinese', { mixed: 3 }, 'You would avoid writing this in Chinese, which may indicate a learner or mixed profile.')
      ]
    },
    {
      type: 'Sentence completion',
      prompt: 'Someone asks you something and you genuinely have no clue. What do you say?',
      note: 'Choose the answer that sounds like your first reaction.',
      answers: [
        answer('我不知道', { mainland_mandarin: 4, taiwan_mandarin: 2, northeast_mandarin: 1 }, 'You chose 我不知道, a standard Mandarin phrase.'),
        answer('我不晓得', { sichuan_mandarin: 4, central_china: 2, mainland_mandarin: 1 }, 'You chose 我不晓得, a useful Southwestern/Central Mandarin clue.'),
        answer('我唔知', { hk_cantonese: 6, guangdong_cantonese: 5 }, 'You chose 我唔知, a strong Cantonese clue.'),
        answer('我毋知', { min_hokkien: 5 }, 'You chose 我毋知, pointing toward Min/Hokkien-like negation.'),
        answer('我弗晓得', { wu_shanghai: 5, central_china: 1 }, 'You chose 我弗晓得, a Wu/Shanghainese-influenced clue.')
      ]
    },
    {
      type: 'Pronunciation',
      prompt: 'If you read 生 out loud, which sound is closest?',
      note: 'No need to know romanization rules; just pick the closest sound.',
      answers: [
        answer('sheng', { mainland_mandarin: 4, taiwan_mandarin: 3, northeast_mandarin: 2, sichuan_mandarin: 1 }, 'You chose a sheng-like reading.'),
        answer('saang', { hk_cantonese: 5, guangdong_cantonese: 5 }, 'You chose a long aa-like reading.'),
        answer('senn / sen', { wu_shanghai: 4, min_hokkien: 1 }, 'You chose a sen-like reading.'),
        answer('seh (with a nasal ending)', { min_hokkien: 5 }, 'You chose a nasal-ending reading.'),
        answer('sang', { guangdong_cantonese: 2, hk_cantonese: 2, mixed: 1 }, 'You chose a sang-like reading.')
      ]
    },
    {
      type: 'Casual written form',
      prompt: 'You are texting “what are you doing?” Which message looks like you?',
      note: 'Choose the one you would actually send to a friend.',
      answers: [
        answer('你在做什么？', { mainland_mandarin: 5, sichuan_mandarin: 1, northeast_mandarin: 1 }, 'You chose 你在做什么, matching standard Mainland Mandarin.'),
        answer('你在做什麼？', { taiwan_mandarin: 5 }, 'You chose 你在做什麼, matching traditional-character Mandarin usage.'),
        answer('你喺度做咩？', { hk_cantonese: 6, guangdong_cantonese: 4 }, 'You chose 你喺度做咩, a strong Hong Kong Cantonese writing clue.'),
        answer('你做紧乜？', { guangdong_cantonese: 4, hk_cantonese: 3 }, 'You chose 你做紧乜, a Cantonese-influenced casual sentence.'),
        answer('None of these', { mixed: 2 }, 'None of the examples felt natural, which keeps the result more open.')
      ]
    },
    {
      type: 'Word choice',
      prompt: 'You are telling someone “I am going to eat.” Which word feels natural?',
      note: 'Think of an everyday meal, not a dictionary definition.',
      icon: icon('fa-utensils', 'food'),
      answers: [
        answer('吃饭', { mainland_mandarin: 5, sichuan_mandarin: 2, northeast_mandarin: 2 }, 'You chose 吃饭, a standard simplified Mandarin form.'),
        answer('吃飯', { taiwan_mandarin: 4, mainland_mandarin: 1 }, 'You chose 吃飯, a traditional-character Mandarin form.'),
        answer('食飯', { hk_cantonese: 5, guangdong_cantonese: 5 }, 'You chose 食飯, a strong Cantonese clue.'),
        answer('喫', { taiwan_mandarin: 1, wu_shanghai: 2, central_china: 1 }, 'You chose 喫, a less common written form with regional/literary associations.'),
        answer('呷', { min_hokkien: 5 }, 'You chose 呷, a strong Southern Min/Hokkien clue.')
      ]
    },
    {
      type: 'Word choice',
      prompt: 'You are heading home. What word would you naturally use for home or house?',
      note: 'Choose the everyday word that feels most like yours.',
      icon: icon('fa-house', 'home'),
      answers: [
        answer('家', { mainland_mandarin: 3, taiwan_mandarin: 3, northeast_mandarin: 1 }, 'You chose 家, a broad Mandarin-compatible home word.'),
        answer('屋', { guangdong_cantonese: 2, central_china: 2, wu_shanghai: 1 }, 'You chose 屋, which gives a southern or central lexical signal.'),
        answer('屋企', { hk_cantonese: 6, guangdong_cantonese: 5 }, 'You chose 屋企, a strong Cantonese clue.'),
        answer('厝', { min_hokkien: 6, taiwan_mandarin: 1 }, 'You chose 厝, a strong Southern Min/Hokkien clue.'),
        answer('房子', { mainland_mandarin: 3, sichuan_mandarin: 2, northeast_mandarin: 1 }, 'You chose 房子, a Mandarin-compatible everyday word.')
      ]
    },
    {
      type: 'Word choice',
      prompt: 'It is bright outside and someone points at the sun. What would you call it?',
      note: 'Pick your everyday word.',
      icon: icon('fa-sun', 'sun'),
      answers: [
        answer('太阳', { mainland_mandarin: 4, sichuan_mandarin: 2, northeast_mandarin: 2 }, 'You chose 太阳, a simplified Mandarin clue.'),
        answer('太陽', { taiwan_mandarin: 4 }, 'You chose 太陽, a traditional Mandarin clue.'),
        answer('日头', { sichuan_mandarin: 2, central_china: 2, wu_shanghai: 1 }, 'You chose 日头, a regional lexical clue.'),
        answer('日頭', { hk_cantonese: 2, guangdong_cantonese: 2, min_hokkien: 2, taiwan_mandarin: 1 }, 'You chose 日頭, a southern/traditional lexical clue.'),
        answer('太阳公 / 日头公', { min_hokkien: 3, guangdong_cantonese: 2, hk_cantonese: 1 }, 'You chose a personified sun form, a southern lexical clue.')
      ]
    },
    {
      type: 'Weather',
      prompt: 'You look outside and it just started raining. What do you text?',
      note: 'Choose the phrase that feels natural in the moment.',
      icon: icon('fa-cloud-rain', 'rain'),
      answers: [
        answer('下雨', { mainland_mandarin: 5, taiwan_mandarin: 3, northeast_mandarin: 2, sichuan_mandarin: 1 }, 'You chose 下雨, a broad Mandarin expression.'),
        answer('落雨', { hk_cantonese: 5, guangdong_cantonese: 5, central_china: 1 }, 'You chose 落雨, a strong Cantonese-compatible clue.'),
        answer('落水', { min_hokkien: 4, central_china: 1 }, 'You chose 落水, a southern regional clue.'),
        answer('落雨水', { min_hokkien: 4, guangdong_cantonese: 2 }, 'You chose 落雨水, a southern lexical clue.'),
        answer('落雨仔', { hk_cantonese: 3, guangdong_cantonese: 2 }, 'You chose 落雨仔, a Cantonese-compatible clue.')
      ]
    },
    {
      type: 'Weather',
      prompt: 'It is uncomfortably hot outside. Which word would you use?',
      note: 'Pick the heat word that feels natural in speech or texting.',
      icon: icon('fa-temperature-high', 'hot'),
      answers: [
        answer('热', { mainland_mandarin: 4, sichuan_mandarin: 2, northeast_mandarin: 2 }, 'You chose 热, a simplified Mandarin clue.'),
        answer('熱', { taiwan_mandarin: 3, hk_cantonese: 1, guangdong_cantonese: 1 }, 'You chose 熱, a traditional-script clue.'),
        answer('焗', { hk_cantonese: 5, guangdong_cantonese: 4 }, 'You chose 焗, a strong Cantonese weather clue.'),
        answer('烫 / 烘', { sichuan_mandarin: 2, central_china: 2 }, 'You chose a heat word with central/southwestern signal.'),
        answer('暑 / 烧', { min_hokkien: 3, central_china: 1 }, 'You chose a southern regional heat word.')
      ]
    },
    {
      type: 'Weather',
      prompt: 'You step outside and it is cold. What word comes out first?',
      note: 'Pick the cold-weather word that sounds like you.',
      icon: icon('fa-temperature-low', 'cold'),
      answers: [
        answer('冷', { mainland_mandarin: 4, taiwan_mandarin: 3, sichuan_mandarin: 2, northeast_mandarin: 1 }, 'You chose 冷, a broad Mandarin-compatible clue.'),
        answer('凍', { hk_cantonese: 4, guangdong_cantonese: 4, taiwan_mandarin: 1 }, 'You chose 凍, a Cantonese/traditional-script clue.'),
        answer('寒', { min_hokkien: 4, central_china: 1 }, 'You chose 寒, a southern regional clue.'),
        answer('凉', { sichuan_mandarin: 2, central_china: 2, mainland_mandarin: 1 }, 'You chose 凉, a central/southwestern-compatible clue.'),
        answer('冰', { hk_cantonese: 2, guangdong_cantonese: 1, min_hokkien: 1 }, 'You chose 冰, a weaker southern clue.')
      ]
    },
    {
      type: 'Kinship',
      prompt: 'You are calling your father from another room. What do you call him?',
      note: 'Choose the everyday family term, not the formal one unless that is really yours.',
      answers: [
        answer('爸爸', { mainland_mandarin: 3, taiwan_mandarin: 3, northeast_mandarin: 1 }, 'You chose 爸爸, a broad modern Mandarin-compatible form.'),
        answer('爹', { northeast_mandarin: 3, sichuan_mandarin: 2, central_china: 1 }, 'You chose 爹, a northern/central/southwestern kinship clue.'),
        answer('阿爸', { min_hokkien: 4, taiwan_mandarin: 1, guangdong_cantonese: 1 }, 'You chose 阿爸, a southern kinship clue.'),
        answer('老豆', { hk_cantonese: 6, guangdong_cantonese: 5 }, 'You chose 老豆, a strong Cantonese clue.'),
        answer('父亲 / 父親', { mainland_mandarin: 1, taiwan_mandarin: 1, mixed: 1 }, 'You chose a formal written form, which is weaker as a regional clue.')
      ]
    },
    {
      type: 'Kinship',
      prompt: 'You are calling your mother from another room. What do you call her?',
      note: 'Choose the everyday family term, not the formal one unless that is really yours.',
      answers: [
        answer('妈妈', { mainland_mandarin: 3, taiwan_mandarin: 3, northeast_mandarin: 1 }, 'You chose 妈妈, a broad modern Mandarin-compatible form.'),
        answer('娘', { sichuan_mandarin: 2, central_china: 2, northeast_mandarin: 1 }, 'You chose 娘, a regional kinship clue.'),
        answer('阿母', { min_hokkien: 5, taiwan_mandarin: 1 }, 'You chose 阿母, a Southern Min/Hokkien clue.'),
        answer('老母 / 媽咪', { hk_cantonese: 5, guangdong_cantonese: 4 }, 'You chose a Cantonese-compatible mother term.'),
        answer('母亲 / 母親', { mainland_mandarin: 1, taiwan_mandarin: 1, mixed: 1 }, 'You chose a formal written form, which is weaker as a regional clue.')
      ]
    },
    {
      type: 'Recognition',
      prompt: 'Which little cluster of written Chinese feels most familiar at a glance?',
      note: 'This is weaker than what you actively use, but still useful.',
      answers: [
        answer('冇、嘅、佢、咗、唔、啲', { hk_cantonese: 4, guangdong_cantonese: 3 }, 'You recognize several written Cantonese characters.'),
        answer('裏、著、麼、個', { taiwan_mandarin: 3 }, 'You are comfortable with traditional Mandarin written forms.'),
        answer('里、着、么、个', { mainland_mandarin: 3 }, 'You are comfortable with simplified Mainland Mandarin forms.'),
        answer('儂、勿、啥、阿拉', { wu_shanghai: 4, central_china: 1 }, 'You recognize Wu/Shanghainese-associated forms.'),
        answer('None of these', { mixed: 2 }, 'No set felt familiar, which points toward an uncertain or learner profile.')
      ]
    },
    {
      type: 'Regional phrase',
      prompt: 'The food is excellent. What would you say first?',
      note: 'Pick the praise that would come out naturally.',
      answers: [
        answer('很好', { mainland_mandarin: 4, taiwan_mandarin: 3 }, 'You chose 很好, a broad standard Mandarin form.'),
        answer('好好', { hk_cantonese: 3, guangdong_cantonese: 3, taiwan_mandarin: 1 }, 'You chose 好好, giving a southern or Cantonese-compatible signal.'),
        answer('巴适', { sichuan_mandarin: 5 }, 'You chose 巴适, a strong Sichuan/Chongqing clue.'),
        answer('老好了', { northeast_mandarin: 5 }, 'You chose 老好了, a strong Northeastern Mandarin clue.'),
        answer('老灵额', { wu_shanghai: 5 }, 'You chose 老灵额, a Shanghainese/Wu clue.'),
        answer('蛮好', { central_china: 4, wu_shanghai: 1, sichuan_mandarin: 1 }, 'You chose 蛮好, a broad southern and central Chinese clue.')
      ]
    },
    {
      type: 'Question word',
      prompt: 'You missed what someone said. How do you ask “what?”',
      note: 'Choose the shortest natural reaction.',
      answers: [
        answer('什么', { mainland_mandarin: 4, sichuan_mandarin: 2, northeast_mandarin: 2 }, 'You chose 什么, matching simplified standard Mandarin.'),
        answer('什麼', { taiwan_mandarin: 4 }, 'You chose 什麼, matching traditional Mandarin writing.'),
        answer('咩', { hk_cantonese: 5, guangdong_cantonese: 4 }, 'You chose 咩, a strong Cantonese clue.'),
        answer('乜', { guangdong_cantonese: 4, hk_cantonese: 4 }, 'You chose 乜, a Cantonese/Yue clue.'),
        answer('啥', { northeast_mandarin: 3, wu_shanghai: 2, central_china: 1, mainland_mandarin: 1 }, 'You chose 啥, which can be regional Mandarin or Wu-influenced depending on context.')
      ]
    },
    {
      type: 'Question word',
      prompt: 'You are asking where something is. Which word feels natural?',
      note: 'Choose what you would actually say or type.',
      icon: icon('fa-location-dot', 'location'),
      answers: [
        answer('哪里', { mainland_mandarin: 4, sichuan_mandarin: 2, taiwan_mandarin: 1 }, 'You chose 哪里, a broad Mandarin-compatible form.'),
        answer('哪儿', { mainland_mandarin: 3, northeast_mandarin: 3 }, 'You chose 哪儿, a northern Mandarin-compatible clue.'),
        answer('邊度', { hk_cantonese: 6, guangdong_cantonese: 5 }, 'You chose 邊度, a strong Cantonese clue.'),
        answer('佗位 / 佗落', { min_hokkien: 4 }, 'You chose a Southern Min/Hokkien-like where form.'),
        answer('啥地方', { sichuan_mandarin: 2, northeast_mandarin: 2, central_china: 1 }, 'You chose 啥地方, a regional Mandarin clue.')
      ]
    },
    {
      type: 'Character preference',
      prompt: 'Your phone keyboard is open. Which Chinese writing setup feels most natural?',
      note: 'Think about everyday messages, not school exercises.',
      answers: [
        answer('Simplified characters', { mainland_mandarin: 4, sichuan_mandarin: 2, northeast_mandarin: 2, guangdong_cantonese: 1 }, 'You prefer simplified characters.'),
        answer('Traditional characters', { taiwan_mandarin: 4, hk_cantonese: 3, min_hokkien: 2 }, 'You prefer traditional characters.'),
        answer('Traditional plus Cantonese-specific characters', { hk_cantonese: 6, guangdong_cantonese: 3 }, 'You prefer traditional characters with Cantonese-specific forms.'),
        answer('Both simplified and traditional', { mixed: 3, mainland_mandarin: 1, taiwan_mandarin: 1 }, 'You are comfortable across scripts, which may indicate a mixed or learned profile.'),
        answer('I am not sure', { mixed: 2 }, 'You are unsure about script preference, so this clue stays weak.')
      ]
    },
    {
      type: 'Pronoun',
      prompt: 'You are pointing at yourself in a casual sentence. How do you say “I”?',
      note: 'Choose the everyday spoken form that feels closest.',
      answers: [
        answer('我', { mainland_mandarin: 4, taiwan_mandarin: 4, northeast_mandarin: 2, sichuan_mandarin: 2 }, 'You chose 我, a broad Mandarin-compatible pronoun.'),
        answer('俺', { northeast_mandarin: 4, mainland_mandarin: 1 }, 'You chose 俺, a northern Mandarin clue.'),
        answer('吾 / 𠊎', { min_hokkien: 3, central_china: 2, wu_shanghai: 1 }, 'You chose 吾/𠊎, a southern or central non-standard pronoun clue.'),
        answer('我哋 / 我', { hk_cantonese: 4, guangdong_cantonese: 4 }, 'You chose a Cantonese-compatible first-person pattern.'),
        answer('阿拉 / 我', { wu_shanghai: 5, central_china: 1 }, 'You chose 阿拉/我, a Wu/Shanghainese-compatible clue.')
      ]
    },
    {
      type: 'Pronoun',
      prompt: 'You are talking directly to a friend. How do you say “you”?',
      note: 'Choose the everyday form, not the classroom answer.',
      answers: [
        answer('你', { mainland_mandarin: 4, taiwan_mandarin: 4, sichuan_mandarin: 2, northeast_mandarin: 2 }, 'You chose 你, a broad Mandarin-compatible pronoun.'),
        answer('侬', { wu_shanghai: 5, central_china: 1 }, 'You chose 侬, a strong Wu/Shanghainese clue.'),
        answer('汝 / 你', { min_hokkien: 4 }, 'You chose 汝/你, a Southern Min/Hokkien-compatible clue.'),
        answer('你哋 / 你', { hk_cantonese: 4, guangdong_cantonese: 4 }, 'You chose a Cantonese-compatible second-person pattern.'),
        answer('恁', { central_china: 3, sichuan_mandarin: 1 }, 'You chose 恁, a central/southern regional clue.')
      ]
    },
    {
      type: 'Pronoun',
      prompt: 'You mean “we” or “us” in a casual sentence. Which sounds like you?',
      note: 'Pick the form you would actually use.',
      answers: [
        answer('我们', { mainland_mandarin: 4, sichuan_mandarin: 2, northeast_mandarin: 2 }, 'You chose 我们, a simplified Mandarin clue.'),
        answer('我們', { taiwan_mandarin: 4 }, 'You chose 我們, a traditional Mandarin clue.'),
        answer('咱们', { northeast_mandarin: 4, mainland_mandarin: 1 }, 'You chose 咱们, a northern Mandarin clue.'),
        answer('我哋', { hk_cantonese: 6, guangdong_cantonese: 5 }, 'You chose 我哋, a strong Cantonese clue.'),
        answer('阮 / 咱', { min_hokkien: 5, taiwan_mandarin: 1 }, 'You chose 阮/咱, a Southern Min/Hokkien clue.'),
        answer('阿拉', { wu_shanghai: 5 }, 'You chose 阿拉, a strong Wu/Shanghainese clue.')
      ]
    },
    {
      type: 'Aspect',
      prompt: 'Someone asks what you are doing right now: “I am eating.” Which sounds natural?',
      note: 'Choose the version you would say without overthinking.',
      answers: [
        answer('我在吃饭', { mainland_mandarin: 4, taiwan_mandarin: 2, sichuan_mandarin: 1 }, 'You chose 我在吃饭, a broad Mandarin pattern.'),
        answer('我正在吃饭', { mainland_mandarin: 3, taiwan_mandarin: 2 }, 'You chose 我正在吃饭, a standard Mandarin pattern.'),
        answer('我食緊飯', { hk_cantonese: 5, guangdong_cantonese: 4 }, 'You chose 我食緊飯, a Cantonese progressive pattern.'),
        answer('我喺度食飯', { hk_cantonese: 6, guangdong_cantonese: 4 }, 'You chose 我喺度食飯, a strong Cantonese clue.'),
        answer('我勒吃饭 / 我在吃饭', { wu_shanghai: 3, central_china: 2 }, 'You chose a Wu/central-compatible progressive pattern.')
      ]
    },
    {
      type: 'Completed action',
      prompt: 'Someone offers food, but you already ate. What sounds natural?',
      note: 'Pick your “already ate” sentence.',
      answers: [
        answer('我吃了', { mainland_mandarin: 4, taiwan_mandarin: 3, northeast_mandarin: 1 }, 'You chose 我吃了, a broad Mandarin pattern.'),
        answer('我吃过了', { mainland_mandarin: 3, sichuan_mandarin: 1 }, 'You chose 我吃过了, a Mandarin completed-action pattern.'),
        answer('我食咗', { hk_cantonese: 6, guangdong_cantonese: 5 }, 'You chose 我食咗, a strong Cantonese clue.'),
        answer('我食矣 / 食了', { min_hokkien: 4, taiwan_mandarin: 1 }, 'You chose 食矣/食了, a Southern Min/Hokkien-compatible clue.'),
        answer('我吃脱了 / 吃仔', { wu_shanghai: 3, central_china: 2 }, 'You chose a Wu/central-compatible completed-action pattern.')
      ]
    },
    {
      type: 'Question particle',
      prompt: 'You are asking a friend if they are going. Which message sounds like you?',
      note: 'Choose the casual question you would send.',
      answers: [
        answer('你去吗？', { mainland_mandarin: 4, taiwan_mandarin: 3 }, 'You chose 你去吗, a standard Mandarin question pattern.'),
        answer('你去不去？', { mainland_mandarin: 3, sichuan_mandarin: 2, northeast_mandarin: 1 }, 'You chose an A-not-A Mandarin question pattern.'),
        answer('你去咩？', { hk_cantonese: 5, guangdong_cantonese: 4 }, 'You chose 你去咩, a Cantonese question-particle clue.'),
        answer('你去未？', { hk_cantonese: 4, guangdong_cantonese: 4, min_hokkien: 1 }, 'You chose 你去未, a southern question-particle clue.'),
        answer('你去伐？', { wu_shanghai: 5 }, 'You chose 你去伐, a strong Wu/Shanghainese clue.')
      ]
    },
    {
      type: 'Pronunciation',
      prompt: 'If you read 人 out loud, which sound is closest?',
      note: 'No need to know romanization rules; just pick the closest sound.',
      answers: [
        answer('ren', { mainland_mandarin: 4, taiwan_mandarin: 3, northeast_mandarin: 2, sichuan_mandarin: 1 }, 'You chose a ren-like reading.'),
        answer('yan / jan', { hk_cantonese: 5, guangdong_cantonese: 5 }, 'You chose a yan/jan-like reading.'),
        answer('lang', { min_hokkien: 5 }, 'You chose a lang-like reading.'),
        answer('nyin / gnin', { wu_shanghai: 4, central_china: 1 }, 'You chose a nyin/gnin-like reading.'),
        answer('nin / yin', { central_china: 2, sichuan_mandarin: 1, mixed: 1 }, 'You chose a regional or mixed non-standard reading.')
      ]
    }
  ];

  var localizedQuestions = {
    'zh-Hans': [
      ['词汇选择', '街上有个小孩从你身边跑过。你脑中自然会冒出哪个词？', '选你真的会说的词，不要选最正式的说法。'],
      ['书写用法', '朋友问你有没有。你会怎么回“没有”？', '选你在日常聊天里真的会打出来的形式。'],
      ['句子补全', '有人问你一件事，而你真的不知道。你会怎么说？', '选最像你第一反应的答案。'],
      ['读音', '如果你读“生”，哪个声音最接近？', '不用懂罗马字规则，选最接近的声音即可。'],
      ['日常书写', '你要发“你在做什么？”。哪条信息最像你会发的？', '选你真的会发给朋友的那一种。'],
      ['词汇选择', '你想说“我要去吃饭”。哪个词最自然？', '想日常吃饭场景，不要想字典定义。'],
      ['词汇选择', '你要回家。你自然会用哪个词表示家或房子？', '选最像你日常用法的词。'],
      ['词汇选择', '外面很亮，有人指着太阳。你会叫它什么？', '选你的日常说法。'],
      ['天气', '你看外面，刚开始下雨。你会怎么发消息？', '选当下最自然的说法。'],
      ['天气', '外面热得难受。你会用哪个词？', '选你说话或发消息时自然会用的热字。'],
      ['天气', '你走到外面，觉得很冷。第一个会冒出的词是什么？', '选最像你的冷天气说法。'],
      ['亲属称呼', '你在另一个房间叫爸爸。你会怎么叫？', '选日常家庭称呼，除非你真的会用正式说法。'],
      ['亲属称呼', '你在另一个房间叫妈妈。你会怎么叫？', '选日常家庭称呼，除非你真的会用正式说法。'],
      ['识别', '哪一组中文字一眼看起来最熟悉？', '这比主动使用弱一些，但仍然有参考价值。'],
      ['区域说法', '食物很好吃。你第一句会怎么夸？', '选最自然会脱口而出的夸法。'],
      ['疑问词', '你没听清别人说什么。你会怎么问“什么”？', '选最短、最自然的反应。'],
      ['疑问词', '你要问东西在哪里。哪个词最自然？', '选你真的会说或打出来的形式。'],
      ['用字偏好', '你打开手机键盘。哪种中文输入和用字习惯最自然？', '想日常聊天，不要想课堂练习。'],
      ['代词', '你在一句日常话里指自己。你会怎么说“我”？', '选最接近日常口语的形式。'],
      ['代词', '你直接跟朋友说话。你会怎么说“你”？', '选日常形式，不要选课堂答案。'],
      ['代词', '你想说“我们”。哪个听起来像你？', '选你真的会用的形式。'],
      ['体貌', '别人问你现在在做什么：“我正在吃饭。”哪个自然？', '选不用多想就会说的版本。'],
      ['完成动作', '有人请你吃东西，但你已经吃过了。哪个自然？', '选你的“已经吃了”句子。'],
      ['疑问语气', '你问朋友去不去。哪条信息听起来像你？', '选你会发出的日常问句。'],
      ['读音', '如果你读“人”，哪个声音最接近？', '不用懂罗马字规则，选最接近的声音即可。']
    ],
    'zh-Hant': [
      ['詞彙選擇', '街上有個小孩從你身邊跑過。你腦中自然會冒出哪個詞？', '選你真的會說的詞，不要選最正式的說法。'],
      ['書寫用法', '朋友問你有沒有。你會怎麼回「沒有」？', '選你在日常聊天裡真的會打出來的形式。'],
      ['句子補全', '有人問你一件事，而你真的不知道。你會怎麼說？', '選最像你第一反應的答案。'],
      ['讀音', '如果你讀「生」，哪個聲音最接近？', '不用懂羅馬字規則，選最接近的聲音即可。'],
      ['日常書寫', '你要發「你在做什麼？」。哪條訊息最像你會發的？', '選你真的會發給朋友的那一種。'],
      ['詞彙選擇', '你想說「我要去吃飯」。哪個詞最自然？', '想日常吃飯場景，不要想字典定義。'],
      ['詞彙選擇', '你要回家。你自然會用哪個詞表示家或房子？', '選最像你日常用法的詞。'],
      ['詞彙選擇', '外面很亮，有人指著太陽。你會叫它什麼？', '選你的日常說法。'],
      ['天氣', '你看外面，剛開始下雨。你會怎麼發訊息？', '選當下最自然的說法。'],
      ['天氣', '外面熱得難受。你會用哪個詞？', '選你說話或發訊息時自然會用的熱字。'],
      ['天氣', '你走到外面，覺得很冷。第一個會冒出的詞是什麼？', '選最像你的冷天氣說法。'],
      ['親屬稱呼', '你在另一個房間叫爸爸。你會怎麼叫？', '選日常家庭稱呼，除非你真的會用正式說法。'],
      ['親屬稱呼', '你在另一個房間叫媽媽。你會怎麼叫？', '選日常家庭稱呼，除非你真的會用正式說法。'],
      ['識別', '哪一組中文字一眼看起來最熟悉？', '這比主動使用弱一些，但仍然有參考價值。'],
      ['區域說法', '食物很好吃。你第一句會怎麼誇？', '選最自然會脫口而出的誇法。'],
      ['疑問詞', '你沒聽清別人說什麼。你會怎麼問「什麼」？', '選最短、最自然的反應。'],
      ['疑問詞', '你要問東西在哪裡。哪個詞最自然？', '選你真的會說或打出來的形式。'],
      ['用字偏好', '你打開手機鍵盤。哪種中文輸入和用字習慣最自然？', '想日常聊天，不要想課堂練習。'],
      ['代詞', '你在一句日常話裡指自己。你會怎麼說「我」？', '選最接近日常口語的形式。'],
      ['代詞', '你直接跟朋友說話。你會怎麼說「你」？', '選日常形式，不要選課堂答案。'],
      ['代詞', '你想說「我們」。哪個聽起來像你？', '選你真的會用的形式。'],
      ['體貌', '別人問你現在在做什麼：「我正在吃飯。」哪個自然？', '選不用多想就會說的版本。'],
      ['完成動作', '有人請你吃東西，但你已經吃過了。哪個自然？', '選你的「已經吃了」句子。'],
      ['疑問語氣', '你問朋友去不去。哪條訊息聽起來像你？', '選你會發出的日常問句。'],
      ['讀音', '如果你讀「人」，哪個聲音最接近？', '不用懂羅馬字規則，選最接近的聲音即可。']
    ]
  };

  var localizedAnswerText = {
    'zh-Hans': {
      '1.4': '我不会用中文写这个',
      '4.4': '这些都不像',
      '13.4': '这些都不熟悉',
      '17.0': '简体字',
      '17.1': '繁体字',
      '17.2': '繁体字加粤语专用字',
      '17.3': '简体和繁体都会',
      '17.4': '我不确定'
    },
    'zh-Hant': {
      '1.4': '我不會用中文寫這個',
      '4.4': '這些都不像',
      '13.4': '這些都不熟悉',
      '17.0': '簡體字',
      '17.1': '繁體字',
      '17.2': '繁體字加粵語專用字',
      '17.3': '簡體和繁體都會',
      '17.4': '我不確定'
    }
  };

  function applyLocalizedQuestions() {
    var localized = localizedQuestions[pageLang];
    if (localized) {
      localized.forEach(function(copy, index) {
        if (!questions[index]) return;
        questions[index].type = copy[0];
        questions[index].prompt = copy[1];
        questions[index].note = copy[2];
      });
    }

    var answerText = localizedAnswerText[pageLang];
    if (!answerText) return;
    Object.keys(answerText).forEach(function(key) {
      var parts = key.split('.');
      var question = questions[Number(parts[0])];
      var answerItem = question && question.answers[Number(parts[1])];
      if (answerItem) {
        answerItem.text = answerText[key];
      }
    });
  }

  applyLocalizedQuestions();

  var state = {
    index: 0,
    answers: [],
    questionCount: 18,
    completed: false
  };

  var els = {};
  var map = null;
  var overlays = [];
  var heatLayer = null;
  var lacdLayer = null;
  var focusLayer = null;
  var lacdData = null;
  var pendingMapRanked = null;
  var legendControl = null;
  var storageKey = 'hanziGuideGeoQuizSession';
  var lacdDataUrl = '/assets/data/geo-quiz-lacd-points.json';
  var quizLengths = [12, 18, 25];
  var lacdClusterLabels = {
    'Cluster 1': 'Yue / Cantonese',
    'Cluster 2': 'Northwest Mandarin / Jin-related Mandarin',
    'Cluster 3': 'South Wu / southeast transition',
    'Cluster 4': 'Hakka / western Fujian',
    'Cluster 5': 'Min',
    'Cluster 6': 'Northeast Mandarin / North China Plain',
    'Cluster 7': 'North Wu / Taihu Wu',
    'Cluster 8': 'South Mandarin / Central north branch',
    'Cluster 9': 'Central south branch',
    'Cluster 10': 'Central transition region'
  };
  var lacdClusterCategoryKeys = {
    'Cluster 1': ['hk_cantonese', 'guangdong_cantonese'],
    'Cluster 2': ['mainland_mandarin'],
    'Cluster 3': ['wu_shanghai', 'central_china'],
    'Cluster 4': ['min_hokkien', 'central_china'],
    'Cluster 5': ['min_hokkien'],
    'Cluster 6': ['northeast_mandarin', 'mainland_mandarin'],
    'Cluster 7': ['wu_shanghai'],
    'Cluster 8': ['sichuan_mandarin', 'central_china'],
    'Cluster 9': ['central_china', 'wu_shanghai'],
    'Cluster 10': ['central_china', 'sichuan_mandarin']
  };
  var lacdGeoBoosts = [
    { key: 'hk_cantonese', bounds: [21.95, 113.35, 22.55, 114.45], weight: 1 },
    { key: 'guangdong_cantonese', bounds: [21.8, 111.5, 24.2, 115.5], weight: 0.92 },
    { key: 'taiwan_mandarin', bounds: [21.7, 119.8, 25.5, 122.1], weight: 1 },
    { key: 'sichuan_mandarin', bounds: [27.4, 101.0, 32.8, 109.8], weight: 0.9 },
    { key: 'northeast_mandarin', bounds: [39.0, 118.0, 53.7, 135.2], weight: 0.88 },
    { key: 'wu_shanghai', bounds: [27.2, 118.0, 32.5, 122.8], weight: 0.9 },
    { key: 'min_hokkien', bounds: [22.0, 117.0, 26.8, 121.9], weight: 0.9 },
    { key: 'central_china', bounds: [25.0, 108.0, 32.2, 118.2], weight: 0.86 },
    { key: 'mainland_mandarin', bounds: [32.0, 106.0, 42.5, 122.5], weight: 0.72 }
  ];
  var subregions = [
    { label: 'Hong Kong / Macau Cantonese', categoryKeys: ['hk_cantonese'], bounds: [21.95, 113.35, 22.55, 114.45] },
    { label: 'Pearl River Delta Cantonese', categoryKeys: ['guangdong_cantonese', 'hk_cantonese'], bounds: [22.45, 112.55, 23.85, 114.7] },
    { label: 'Western Guangdong / Guangxi Yue', categoryKeys: ['guangdong_cantonese', 'hk_cantonese'], bounds: [21.3, 108.2, 24.4, 112.8] },
    { label: 'Taiwan Mandarin / Taiwan contact region', categoryKeys: ['taiwan_mandarin', 'min_hokkien'], bounds: [21.7, 119.8, 25.5, 122.1] },
    { label: 'Southern Fujian / Hokkien region', categoryKeys: ['min_hokkien'], bounds: [23.3, 117.2, 25.5, 119.3] },
    { label: 'Eastern Fujian / coastal Min region', categoryKeys: ['min_hokkien'], bounds: [25.5, 118.5, 27.7, 120.8] },
    { label: 'Shanghai / Taihu Wu region', categoryKeys: ['wu_shanghai'], bounds: [30.3, 119.6, 32.4, 122.2] },
    { label: 'Southern Zhejiang / Wu transition region', categoryKeys: ['wu_shanghai'], bounds: [27.0, 118.6, 30.3, 121.8] },
    { label: 'Sichuan / Chongqing Mandarin', categoryKeys: ['sichuan_mandarin'], bounds: [27.4, 101.0, 32.8, 109.8] },
    { label: 'Northeastern Mandarin', categoryKeys: ['northeast_mandarin'], bounds: [39.0, 118.0, 53.7, 135.2] },
    { label: 'North China / Standard Mandarin region', categoryKeys: ['mainland_mandarin', 'northeast_mandarin'], bounds: [32.0, 106.0, 42.5, 122.5] },
    { label: 'Hunan / Xiang transition region', categoryKeys: ['central_china', 'sichuan_mandarin'], bounds: [24.6, 109.5, 30.2, 114.4] },
    { label: 'Jiangxi / Gan transition region', categoryKeys: ['central_china', 'wu_shanghai'], bounds: [24.4, 113.5, 30.2, 118.8] },
    { label: 'Hubei / middle Yangtze transition region', categoryKeys: ['central_china', 'sichuan_mandarin', 'mainland_mandarin'], bounds: [29.0, 108.0, 32.8, 116.5] },
    { label: 'Southern Anhui / Hui transition region', categoryKeys: ['central_china', 'wu_shanghai'], bounds: [29.0, 116.0, 31.5, 119.5] }
  ];

  var subregionLocales = {
    'zh-Hans': [
      '香港 / 澳门粤语',
      '珠江三角洲粤语',
      '粤西 / 广西粤语',
      '台湾国语 / 台湾接触区',
      '闽南 / 福建话区域',
      '闽东 / 沿海闽语区域',
      '上海 / 太湖吴语区域',
      '浙南 / 吴语过渡区',
      '四川 / 重庆官话',
      '东北官话',
      '华北 / 标准普通话区域',
      '湖南 / 湘语过渡区',
      '江西 / 赣语过渡区',
      '湖北 / 长江中游过渡区',
      '皖南 / 徽语过渡区'
    ],
    'zh-Hant': [
      '香港 / 澳門粵語',
      '珠江三角洲粵語',
      '粵西 / 廣西粵語',
      '台灣國語 / 台灣接觸區',
      '閩南 / 福建話區域',
      '閩東 / 沿海閩語區域',
      '上海 / 太湖吳語區域',
      '浙南 / 吳語過渡區',
      '四川 / 重慶官話',
      '東北官話',
      '華北 / 標準普通話區域',
      '湖南 / 湘語過渡區',
      '江西 / 贛語過渡區',
      '湖北 / 長江中游過渡區',
      '皖南 / 徽語過渡區'
    ]
  };

  function applySubregionLocales() {
    var localized = subregionLocales[pageLang];
    if (!localized) return;
    localized.forEach(function(label, index) {
      if (subregions[index]) {
        subregions[index].label = label;
      }
    });
  }

  applySubregionLocales();

  function answer(text, scores, clue) {
    return {
      text: text,
      scores: scores,
      clue: clue
    };
  }

  function icon(name, tone) {
    return {
      name: name,
      tone: tone || 'default'
    };
  }

  function getQuestionCount() {
    return Math.min(state.questionCount || 18, questions.length);
  }

  function getActiveQuestions() {
    return questions.slice(0, getQuestionCount());
  }

  function setQuestionCount(count) {
    if (quizLengths.indexOf(count) === -1) return;

    state.questionCount = Math.min(count, questions.length);
    state.index = Math.min(state.index, getQuestionCount() - 1);
    state.completed = hasCompleteAnswers();
    clearMap();
    saveState();
    if (state.completed) {
      renderResults();
    } else {
      renderQuestion();
    }
  }

  function renderModeButtons() {
    if (!els.modeButtons) return;

    els.modeButtons.forEach(function(button) {
      var isSelected = Number(button.getAttribute('data-question-count')) === getQuestionCount();
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  function init() {
    els.app = document.getElementById('geo-quiz-app');
    els.progressText = document.getElementById('geo-quiz-progress-text');
    els.progressBar = document.getElementById('geo-quiz-progress-bar');
    els.promptType = document.getElementById('geo-quiz-prompt-type');
    els.title = document.getElementById('geo-quiz-question-title');
    els.note = document.getElementById('geo-quiz-question-note');
    els.visual = document.getElementById('geo-quiz-visual');
    els.options = document.getElementById('geo-quiz-options');
    els.back = document.getElementById('geo-quiz-back');
    els.next = document.getElementById('geo-quiz-next');
    els.results = document.getElementById('geo-quiz-results');
    els.bestMatch = document.getElementById('geo-quiz-best-match');
    els.resultCopy = document.getElementById('geo-quiz-result-copy');
    els.confidence = document.getElementById('geo-quiz-confidence');
    els.variety = document.getElementById('geo-quiz-variety');
    els.specificRegion = document.getElementById('geo-quiz-specific-region');
    els.topMatches = document.getElementById('geo-quiz-top-matches');
    els.localMatches = document.getElementById('geo-quiz-local-matches');
    els.localReport = document.getElementById('geo-quiz-local-report');
    els.mapInsight = document.getElementById('geo-quiz-map-insight');
    els.clues = document.getElementById('geo-quiz-clues');
    els.resetButtons = document.querySelectorAll('.geo-quiz-reset');
    els.review = document.getElementById('geo-quiz-review');
    els.share = document.getElementById('geo-quiz-share');
    els.shareImage = document.getElementById('geo-quiz-share-image');
    els.shareStatus = document.getElementById('geo-quiz-share-status');
    els.feedbackButtons = document.querySelectorAll('.geo-quiz-feedback-buttons button[data-feedback]');
    els.feedbackStatus = document.getElementById('geo-quiz-feedback-status');
    els.feedbackLocationForm = document.getElementById('geo-quiz-feedback-location-form');
    els.actualLocation = document.getElementById('geo-quiz-actual-location');
    els.modeButtons = document.querySelectorAll('.geo-quiz-mode-options button[data-question-count]');

    if (!els.app) return;

    loadLacdData();

    els.back.addEventListener('click', goBack);
    els.next.addEventListener('click', goNext);
    els.resetButtons.forEach(function(button) {
      button.addEventListener('click', restart);
    });
    els.review.addEventListener('click', reviewAnswers);
    els.share.addEventListener('click', shareResult);
    if (els.shareImage) {
      els.shareImage.addEventListener('click', shareResultImage);
    }
    els.modeButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        setQuestionCount(Number(button.getAttribute('data-question-count')));
      });
    });
    els.feedbackButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        handleFeedbackClick(button.getAttribute('data-feedback'), button);
      });
    });
    if (els.feedbackLocationForm) {
      els.feedbackLocationForm.addEventListener('submit', submitLocationFeedback);
    }

    restoreState();
    if (state.completed && hasCompleteAnswers()) {
      renderResults();
    } else {
      renderQuestion();
    }
  }

  function renderQuestion() {
    var activeQuestions = getActiveQuestions();
    var question = activeQuestions[state.index];
    var selected = state.answers[state.index];
    var progress = ((state.index + 1) / activeQuestions.length) * 100;

    if (!question) {
      state.index = 0;
      question = activeQuestions[state.index];
    }

    renderModeButtons();
    els.progressText.textContent = uiText('progress', {
      current: state.index + 1,
      total: activeQuestions.length
    });
    els.progressBar.style.width = progress + '%';
    els.promptType.textContent = question.type;
    els.title.textContent = question.prompt;
    els.note.textContent = question.note || ' ';
    renderQuestionVisual(question);
    els.options.innerHTML = '';

    question.answers.forEach(function(option, optionIndex) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'geo-quiz-option';
      button.textContent = option.text;
      button.setAttribute('aria-pressed', selected === optionIndex ? 'true' : 'false');
      if (selected === optionIndex) {
        button.classList.add('is-selected');
      }
      button.addEventListener('click', function() {
        state.answers[state.index] = optionIndex;
        state.completed = false;
        saveState();
        renderQuestion();
      });
      els.options.appendChild(button);
    });

    els.back.disabled = state.index === 0;
    els.next.disabled = typeof selected !== 'number';
    els.next.textContent = state.index === activeQuestions.length - 1 ? uiText('showMap') : uiText('next');
    els.app.hidden = false;
    els.results.hidden = true;
  }

  function renderQuestionVisual(question) {
    if (!els.visual) return;

    els.visual.innerHTML = '';
    if (!question.icon || !question.icon.name) {
      els.visual.removeAttribute('data-tone');
      els.visual.hidden = true;
      return;
    }

    var iconEl = document.createElement('i');
    iconEl.className = 'fas ' + question.icon.name;
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.setAttribute('role', 'presentation');
    els.visual.setAttribute('data-tone', question.icon.tone || 'default');
    els.visual.appendChild(iconEl);
    els.visual.hidden = false;
  }

  function goBack() {
    if (state.index > 0) {
      state.index -= 1;
      state.completed = false;
      saveState();
      renderQuestion();
    }
  }

  function goNext() {
    if (typeof state.answers[state.index] !== 'number') return;
    if (state.index < getQuestionCount() - 1) {
      state.index += 1;
      state.completed = false;
      saveState();
      renderQuestion();
    } else {
      renderResults();
    }
  }

  function restart() {
    var questionCount = getQuestionCount();
    state.index = 0;
    state.answers = [];
    state.questionCount = questionCount;
    state.completed = false;
    saveState();
    clearMap();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reviewAnswers() {
    state.index = 0;
    state.completed = false;
    saveState();
    els.results.hidden = true;
    els.app.hidden = false;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function calculateResults() {
    var activeQuestions = getActiveQuestions();
    var scores = {};
    Object.keys(categories).forEach(function(key) {
      scores[key] = 0;
    });

    var clues = [];
    var answeredCount = 0;
    state.answers.slice(0, activeQuestions.length).forEach(function(answerIndex, questionIndex) {
      var option = activeQuestions[questionIndex].answers[answerIndex];
      if (!option) return;
      answeredCount += 1;

      Object.keys(option.scores).forEach(function(key) {
        scores[key] += option.scores[key];
      });

      clues.push({
        text: localizedClue(option),
        strength: maxScore(option.scores)
      });
    });

    if (answeredCount === 0) {
      return {
        ranked: [],
        clues: [],
        rawScores: scores
      };
    }

    var ranked = Object.keys(scores)
      .filter(function(key) {
        return key !== 'mixed';
      })
      .map(function(key) {
        return {
          key: key,
          score: scores[key],
          category: categories[key]
        };
      })
      .sort(function(a, b) {
        return b.score - a.score;
      });

    var top = ranked[0];
    var second = ranked[1];
    var mixedScore = scores.mixed;
    var isMixed = answeredCount >= 3 && (mixedScore >= 6 || !top || top.score < 8 || (second && top.score - second.score < 3));

    if (isMixed) {
      ranked.unshift({
        key: 'mixed',
        score: Math.max(mixedScore, top ? Math.max(6, top.score - 1) : 6),
        category: categories.mixed
      });
    }

    var max = ranked.reduce(function(value, item) {
      return Math.max(value, item.score);
    }, 1);

    ranked.forEach(function(item) {
      item.normalized = Math.max(0, item.score) / max;
      item.confidence = confidenceLabel(item.normalized, item.score, ranked);
    });

    clues = clues
      .sort(function(a, b) {
        return b.strength - a.strength;
      })
      .slice(0, 5);

    return {
      ranked: ranked,
      clues: clues,
      rawScores: scores
    };
  }

  function maxScore(scores) {
    return Object.keys(scores).reduce(function(max, key) {
      return Math.max(max, scores[key]);
    }, 0);
  }

  function localizedClue(option) {
    if (pageLang === 'zh-Hans') {
      return '你选择了：' + option.text;
    }
    if (pageLang === 'zh-Hant') {
      return '你選擇了：' + option.text;
    }
    return option.clue;
  }

  function confidenceLabel(normalized, score, ranked) {
    if (score < 8) return uiText('lowConfidence');
    if (normalized >= 0.86 && ranked.length > 1 && score - ranked[1].score >= 5) return uiText('highConfidence');
    if (normalized >= 0.64) return uiText('mediumConfidence');
    return uiText('lowConfidence');
  }

  function renderResults() {
    var result = calculateResults();
    var best = result.ranked[0];
    if (!best) return;

    state.completed = true;
    saveState();

    els.app.hidden = true;
    els.results.hidden = false;
    els.bestMatch.textContent = best.category.label;
    els.resultCopy.textContent = best.category.summary;
    els.confidence.textContent = best.confidence;
    els.variety.textContent = best.category.variety;
    renderSpecificRegion(result);
    resetFeedbackButtons();

    els.topMatches.innerHTML = '';
    result.ranked.slice(0, 5).forEach(function(item) {
      var li = document.createElement('li');
      var percent = Math.round(item.normalized * 100);
      li.innerHTML = '<span>' + escapeHtml(item.category.label) + '</span><strong>' +
        escapeHtml(uiText('relativeMatch', {
          percent: percent,
          band: membershipBand(item.normalized)
        })) +
        '</strong><em>' + escapeHtml(item.category.macroRegion) + '</em>';
      els.topMatches.appendChild(li);
    });

    if (els.mapInsight) {
      els.mapInsight.innerHTML = buildMapInsight(result);
    }
    renderLocalReport(result);
    renderLocalMatches(result);

    els.clues.innerHTML = '';
    result.clues.forEach(function(clue) {
      var li = document.createElement('li');
      li.textContent = clue.text;
      els.clues.appendChild(li);
    });

    renderMap(result.ranked);
    window.setTimeout(function() {
      els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function renderMap(ranked) {
    var mapEl = document.getElementById('geo-quiz-map');
    if (!mapEl) return;
    pendingMapRanked = ranked;

    if (typeof L === 'undefined') {
      mapEl.innerHTML = '<div class="geo-quiz-map-fallback">' + escapeHtml(uiText('mapFallback')) + '</div>';
      return;
    }

    if (!map) {
      map = L.map(mapEl, {
        scrollWheelZoom: false,
        worldCopyJump: true
      }).setView([30.5, 112.5], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 10,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      legendControl = L.control({ position: 'bottomleft' });
      legendControl.onAdd = function() {
        var div = L.DomUtil.create('div', 'geo-quiz-map-legend');
        div.innerHTML = '<strong>' + escapeHtml(uiText('legendTitle')) + '</strong>' +
          '<span><i class="geo-quiz-legend-swatch geo-quiz-legend-swatch-red"></i>' + escapeHtml(uiText('legendColor')) + '</span>' +
          '<span><i class="geo-quiz-legend-swatch geo-quiz-legend-swatch-purple"></i>' + escapeHtml(uiText('legendGroups')) + '</span>' +
          '<span><i class="geo-quiz-legend-swatch geo-quiz-legend-swatch-dark"></i>' + escapeHtml(uiText('legendStrength')) + '</span>' +
          '<span><i class="geo-quiz-legend-ring"></i>' + escapeHtml(uiText('legendRings')) + '</span>' +
          '<span><i class="geo-quiz-legend-dot"></i>' + escapeHtml(uiText('legendDots')) + '</span>';
        return div;
      };
      legendControl.addTo(map);
    }

    clearMap();
    var focusMarkers = renderLacdLayer(ranked) || [];

    if (focusMarkers.length) {
      var focusGroup = L.featureGroup(focusMarkers);
      map.fitBounds(focusGroup.getBounds().pad(0.12), { maxZoom: 10 });
    } else if (overlays.length) {
      var group = L.featureGroup(overlays);
      map.fitBounds(group.getBounds().pad(0.12), { maxZoom: 7 });
    } else {
      map.setView([30.5, 112.5], 4);
    }

    window.setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }

  function clearMap() {
    if (!map) return;
    overlays.forEach(function(layer) {
      map.removeLayer(layer);
    });
    overlays = [];
    if (lacdLayer) {
      map.removeLayer(lacdLayer);
      lacdLayer = null;
    }
    if (heatLayer) {
      map.removeLayer(heatLayer);
      heatLayer = null;
    }
    if (focusLayer) {
      map.removeLayer(focusLayer);
      focusLayer = null;
    }
  }

  function loadLacdData() {
    if (!window.fetch) return;
    fetch(lacdDataUrl, { credentials: 'same-origin' })
      .then(function(response) {
        if (!response.ok) throw new Error('Unable to load Linguistic Atlas of Chinese Dialects data');
        return response.json();
      })
      .then(function(data) {
        lacdData = data;
        if (pendingMapRanked && map) {
          renderMap(pendingMapRanked);
        }
        if (els.results && !els.results.hidden) {
          var result = calculateResults();
          if (els.mapInsight) {
            els.mapInsight.innerHTML = buildMapInsight(result);
          }
          renderLocalReport(result);
          renderLocalMatches(result);
          renderSpecificRegion(result);
        }
      })
      .catch(function() {
        lacdData = null;
      });
  }

  function renderLacdLayer(ranked) {
    if (!map || !lacdData || !Array.isArray(lacdData.points)) return [];

    var result = calculateResults();
    var rawScores = result.rawScores;
    var maxScoreValue = Object.keys(rawScores).reduce(function(max, key) {
      return Math.max(max, rawScores[key]);
    }, 1);
    var scoredPoints = getScoredLacdPoints(rawScores, maxScoreValue);
    var focusedPoints = getMapFocusPoints(result, scoredPoints);

    heatLayer = createAtlasHeatLayer(scoredPoints.filter(function(point) {
      return point.match > 0.18;
    }));
    heatLayer.addTo(map);

    var markers = scoredPoints.map(function(point) {
      var scaledMatch = scaleMapMatch(point.match);
      var marker = L.circleMarker([point.lat, point.lon], {
        radius: 2.4 + scaledMatch * 5.4,
        color: '#263238',
        weight: point.match > 0.62 ? 1 : 0,
        fillColor: point.rgb || '#8aa9c4',
        fillOpacity: 0.04 + scaledMatch * 0.86,
        opacity: 0.12 + scaledMatch * 0.78
      }).bindPopup(
        '<strong>' + escapeHtml(point.name) + '</strong><br>' +
        escapeHtml(lacdClusterLabels[point.sharp10] || point.sharp10) + '<br>' +
        'Relative locality score: ' + Math.round(point.match * 100) + '%'
      );
      return marker;
    });

    lacdLayer = L.layerGroup(markers);
    lacdLayer.addTo(map);
    overlays = markers.filter(function(marker, index) {
      return scoredPoints[index].match > 0.42;
    });

    focusLayer = L.layerGroup(focusedPoints.map(function(point, index) {
      return L.circleMarker([point.lat, point.lon], {
        radius: 10 - index,
        color: '#10211f',
        fillColor: point.rgb || '#2f7f73',
        fillOpacity: 0.28,
        opacity: 0.92,
        weight: 3
      }).bindPopup(
        '<strong>' + escapeHtml(point.name) + '</strong><br>' +
        'Closest local signal<br>' +
        'Relative locality score: ' + Math.round(point.match * 100) + '%'
      );
    }));
    focusLayer.addTo(map);

    return focusLayer.getLayers();
  }

  function getMapFocusPoints(result, scoredPoints) {
    if (!result || !result.ranked || !result.ranked.length) return [];
    if (result.ranked[0].key === 'mixed') return [];

    var specificRegion = result.specificRegion || computeSpecificRegion(result);
    var candidates = scoredPoints.filter(function(point) {
      return point.match > 0.32;
    });

    if (specificRegion && specificRegion.bounds) {
      candidates = candidates.filter(function(point) {
        return pointInBounds(point, specificRegion.bounds);
      });
    }

    candidates = candidates.sort(function(a, b) {
      return b.match - a.match;
    });

    if (!candidates.length) return [];
    if (candidates[0].match < 0.42) return [];

    return candidates.slice(0, 3);
  }

  function scaleMapMatch(match) {
    return Math.pow(Math.max(0, Math.min(1, match)), 2.1);
  }

  function getScoredLacdPoints(rawScores, maxScoreValue) {
    if (!lacdData || !Array.isArray(lacdData.points)) return [];

    return lacdData.points.map(function(point) {
      var match = Math.max(
        lacdPointMatch(point, rawScores, maxScoreValue),
        lacdPointGeoBoost(point, rawScores, maxScoreValue)
      );
      var scoredPoint = {};
      Object.keys(point).forEach(function(key) {
        scoredPoint[key] = point[key];
      });
      scoredPoint.match = match;
      return scoredPoint;
    });
  }

  function createAtlasHeatLayer(points) {
    var AtlasHeatLayer = L.Layer.extend({
      onAdd: function(layerMap) {
        this._map = layerMap;
        this._canvas = L.DomUtil.create('canvas', 'geo-quiz-heat-layer leaflet-zoom-hide');
        this._ctx = this._canvas.getContext('2d');
        layerMap.getPanes().overlayPane.appendChild(this._canvas);
        layerMap.on('move zoom resize viewreset', this._reset, this);
        this._reset();
      },
      onRemove: function(layerMap) {
        layerMap.off('move zoom resize viewreset', this._reset, this);
        if (this._canvas && this._canvas.parentNode) {
          this._canvas.parentNode.removeChild(this._canvas);
        }
      },
      _reset: function() {
        var size = this._map.getSize();
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._canvas.width = size.x;
        this._canvas.height = size.y;
        this._draw(topLeft);
      },
      _draw: function(topLeft) {
        var ctx = this._ctx;
        var zoom = this._map.getZoom();
        var radius = Math.max(24, Math.min(64, 18 + zoom * 5.4));

        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        points.forEach(function(point) {
          if (!point.match) return;
          var layerPoint = this._map.latLngToLayerPoint([point.lat, point.lon]);
          var x = layerPoint.x - topLeft.x;
          var y = layerPoint.y - topLeft.y;
          var alpha = Math.max(0.015, Math.min(0.32, scaleMapMatch(point.match) * 0.32));
          var gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

          gradient.addColorStop(0, hexToRgba(point.rgb || '#8aa9c4', alpha));
          gradient.addColorStop(0.45, hexToRgba(point.rgb || '#8aa9c4', alpha * 0.32));
          gradient.addColorStop(1, hexToRgba(point.rgb || '#8aa9c4', 0));
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }, this);
      }
    });

    return new AtlasHeatLayer();
  }

  function hexToRgba(hex, alpha) {
    var normalized = String(hex || '').replace('#', '');
    if (normalized.length === 3) {
      normalized = normalized.split('').map(function(char) {
        return char + char;
      }).join('');
    }
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
      normalized = '8aa9c4';
    }
    var value = parseInt(normalized, 16);
    var red = (value >> 16) & 255;
    var green = (value >> 8) & 255;
    var blue = value & 255;
    return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
  }

  function lacdPointMatch(point, rawScores, maxScoreValue) {
    var categoryKeys = lacdClusterCategoryKeys[point.sharp10] || [];
    var best = categoryKeys.reduce(function(max, key) {
      var categoryScore = rawScores[key] || 0;
      if (!categoryScore) return max;
      return Math.max(max, (categoryScore / Math.max(1, maxScoreValue)) * pointCategoryAffinity(point, key));
    }, 0);

    var normalized = best;
    if (point.heat10 === 'Z') {
      normalized *= 0.75;
    } else if (/_b$/.test(point.heat10 || '')) {
      normalized *= 0.88;
    }
    return Math.max(0, Math.min(1, normalized));
  }

  function pointCategoryAffinity(point, key) {
    var category = categories[key];
    if (!category || !category.center) return 0.5;

    var distance = distanceKm(point.lat, point.lon, category.center[0], category.center[1]);
    var radiusKm = Math.max(60, (category.radius || 160000) / 1000);
    var proximity = 1 / (1 + Math.pow(distance / radiusKm, 1.45));

    return 0.48 + proximity * 0.52;
  }

  function distanceKm(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;
    var dLat = degreesToRadians(lat2 - lat1);
    var dLon = degreesToRadians(lon2 - lon1);
    var rLat1 = degreesToRadians(lat1);
    var rLat2 = degreesToRadians(lat2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLat1) * Math.cos(rLat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function lacdPointGeoBoost(point, rawScores, maxScoreValue) {
    if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') return 0;

    return lacdGeoBoosts.reduce(function(best, zone) {
      var categoryScore = rawScores[zone.key] || 0;
      if (!categoryScore || !pointInBounds(point, zone.bounds)) return best;
      return Math.max(best, (categoryScore / Math.max(1, maxScoreValue)) * zone.weight);
    }, 0);
  }

  function pointInBounds(point, bounds) {
    return point.lat >= bounds[0] &&
      point.lon >= bounds[1] &&
      point.lat <= bounds[2] &&
      point.lon <= bounds[3];
  }

  function computeLacdMatches(result, limit) {
    if (!lacdData || !Array.isArray(lacdData.points)) return [];

    var rawScores = result.rawScores || {};
    var maxScoreValue = Object.keys(rawScores).reduce(function(max, key) {
      return Math.max(max, rawScores[key]);
    }, 1);

    return lacdData.points.map(function(point) {
      var clusterMatch = lacdPointMatch(point, rawScores, maxScoreValue);
      var geoMatch = lacdPointGeoBoost(point, rawScores, maxScoreValue);
      var match = Math.max(clusterMatch, geoMatch);
      var matchBand = point.heat10 === 'Z' ? 'mixed or weak' : /_b$/.test(point.heat10 || '') ? 'near the edge' : 'strong area';

      return {
        id: point.id,
        name: point.name,
        lat: point.lat,
        lon: point.lon,
        match: match,
        cluster: point.sharp10,
        clusterLabel: lacdClusterLabels[point.sharp10] || point.sharp10,
        fuzzyCode: point.heat10,
        fuzzyBand: matchBand
      };
    })
      .filter(function(item) {
        return item.match > 0;
      })
      .sort(function(a, b) {
        if (b.match !== a.match) return b.match - a.match;
        if (a.fuzzyBand !== b.fuzzyBand) return matchBandRank(a.fuzzyBand) - matchBandRank(b.fuzzyBand);
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit || 8);
  }

  function matchBandRank(label) {
    if (label === 'strong area') return 0;
    if (label === 'near the edge') return 1;
    return 2;
  }

  function renderLocalMatches(result) {
    if (!els.localMatches) return;
    els.localMatches.innerHTML = '';

    if (!lacdData) {
      var loading = document.createElement('li');
      loading.className = 'geo-quiz-local-muted';
      loading.textContent = uiText('loadingLocalities');
      els.localMatches.appendChild(loading);
      return;
    }

    var matches = computeLacdMatches(result, 8);
    if (!matches.length) {
      var empty = document.createElement('li');
      empty.className = 'geo-quiz-local-muted';
      empty.textContent = uiText('noLocalities');
      els.localMatches.appendChild(empty);
      return;
    }

    matches.forEach(function(match) {
      var li = document.createElement('li');
      li.innerHTML = '<span>' + escapeHtml(match.name) + '</span><strong>' +
        escapeHtml(uiText('localityScore', { percent: Math.round(match.match * 100) })) + '</strong><em>' +
        escapeHtml(match.clusterLabel) + ' · ' + escapeHtml(match.fuzzyBand) + '</em>';
      els.localMatches.appendChild(li);
    });
  }

  function renderSpecificRegion(result) {
    if (!els.specificRegion) return;

    var specificRegion = computeSpecificRegion(result);
    result.specificRegion = specificRegion;
    if (!specificRegion) {
      els.specificRegion.hidden = true;
      els.specificRegion.textContent = '';
      return;
    }

    els.specificRegion.textContent = uiText('moreSpecific', { label: specificRegion.label });
    els.specificRegion.hidden = false;
  }

  function renderLocalReport(result) {
    if (!els.localReport) return;

    var best = result.ranked[0];
    if (!best) {
      els.localReport.innerHTML = '<p>' + escapeHtml(uiText('noLocalReport')) + '</p>';
      return;
    }

    var specificRegion = result.specificRegion || computeSpecificRegion(result);
    var blend = result.ranked
      .filter(function(item) {
        return item.key !== 'mixed' && item.score > 0;
      })
      .slice(0, 3);
    var localities = computeLacdMatches(result, 5);
    var copy = '<p>' + uiText('strongestSignal', { label: escapeHtml(best.category.label) });

    if (specificRegion) {
      copy += uiText('specificSignal', { label: escapeHtml(specificRegion.label) });
      if (specificRegion.localities.length) {
        copy += uiText('nearLocalities', { localities: escapeHtml(specificRegion.localities.join(', ')) });
      }
      copy += '.</p>';
    } else {
      copy += uiText('noNarrowLabel') + '</p>';
    }

    if (blend.length) {
      copy += '<div class="geo-quiz-blend" aria-label="Regional blend">';
      blend.forEach(function(item) {
        var percent = Math.round(item.normalized * 100);
        copy += '<div class="geo-quiz-blend-row"><span>' + escapeHtml(item.category.label) +
          '</span><strong>' + percent + '%</strong><i style="width:' + percent + '%"></i></div>';
      });
      copy += '</div>';
    }

    if (localities.length) {
      copy += '<p class="geo-quiz-local-report-note">' + escapeHtml(uiText('closestLocalitySignals', {
        localities: localities.slice(0, 3).map(function(item) {
          return item.name + ' ' + Math.round(item.match * 100) + '%';
        }).join(', ')
      })) + '</p>';
    }

    els.localReport.innerHTML = copy;
  }

  function computeSpecificRegion(result) {
    if (!lacdData || !Array.isArray(lacdData.points) || !result || !result.rawScores) return null;
    if (result.ranked && result.ranked[0] && result.ranked[0].key === 'mixed') return null;

    var rawScores = result.rawScores;
    var maxScoreValue = Object.keys(rawScores).reduce(function(max, key) {
      return Math.max(max, rawScores[key]);
    }, 1);
    var scoredPoints = getScoredLacdPoints(rawScores, maxScoreValue);

    return subregions.map(function(region) {
      return scoreSubregion(region, scoredPoints, rawScores, maxScoreValue);
    })
      .filter(function(region) {
        return region.score > 0.18 && region.localities.length;
      })
      .sort(function(a, b) {
        return b.score - a.score;
      })[0] || null;
  }

  function scoreSubregion(region, scoredPoints, rawScores, maxScoreValue) {
    var categoryStrength = region.categoryKeys.reduce(function(max, key) {
      return Math.max(max, (rawScores[key] || 0) / Math.max(1, maxScoreValue));
    }, 0);
    var localities = scoredPoints
      .filter(function(point) {
        return point.match > 0.08 && pointInBounds(point, region.bounds);
      })
      .sort(function(a, b) {
        return b.match - a.match;
      })
      .slice(0, 5);
    var localityStrength = localities.reduce(function(total, point) {
      return total + point.match;
    }, 0) / Math.max(1, localities.length);
    var localityNames = localities.slice(0, 3).map(function(point) {
      return point.name;
    });

    return {
      label: region.label,
      bounds: region.bounds,
      score: localityStrength * 0.72 + categoryStrength * 0.28,
      confidence: subregionConfidence(localityStrength, categoryStrength, localities.length),
      localities: localityNames
    };
  }

  function subregionConfidence(localityStrength, categoryStrength, localityCount) {
    if (localityCount < 2 || categoryStrength < 0.35) return 'low';
    if (localityStrength >= 0.72 && categoryStrength >= 0.7) return 'high';
    if (localityStrength >= 0.48 && categoryStrength >= 0.5) return 'medium';
    return 'low';
  }

  function membershipBand(value) {
    if (value >= 0.82) return uiText('coreLike');
    if (value >= 0.58) return uiText('marginal');
    if (value >= 0.34) return uiText('weak');
    return uiText('trace');
  }

  function buildMapInsight(result) {
    var ranked = result.ranked || result;
    var visible = ranked.filter(function(item) {
      return item.key !== 'mixed' && item.score > 0;
    });
    if (!visible.length) {
      return '<p>' + escapeHtml(uiText('noMapSignal')) + '</p>';
    }

    var top = visible[0];
    var second = visible[1];
    var specificRegion = computeSpecificRegion(result);
    var copy = '<p>' + escapeHtml(uiText('mapInsightIntro')) + '</p>';
    copy += '<p>' + uiText('topRegionCurrent', {
      label: escapeHtml(top.category.label),
      band: escapeHtml(membershipBand(top.normalized))
    }) + '</p>';
    if (specificRegion) {
      copy += '<p>' + uiText('closestLocalSignal', {
        label: escapeHtml(specificRegion.label),
        localities: escapeHtml(specificRegion.localities.join(', '))
      }) + '</p>';
    }

    if (second && top.normalized - second.normalized < 0.22) {
      copy += '<p>' + escapeHtml(uiText('overlapPattern')) + '</p>';
    }

    copy += '<p>' + escapeHtml(uiText('dialectGeographyNote')) + '</p>';
    return copy;
  }

  function shareResult() {
    var result = calculateResults();
    var best = result.ranked[0];
    if (!best) return;

    var shareData = buildShareData(result);
    setShareStatus('');

    if (navigator.share) {
      navigator.share(shareData)
        .then(function() {
          setShareStatus(uiText('resultShared'));
        })
        .catch(function(err) {
          if (err && err.name === 'AbortError') return;
          copyShareText(shareData.text + '\n' + shareData.url);
        });
      return;
    }

    copyShareText(shareData.text + '\n' + shareData.url);
  }

  function shareResultImage() {
    var result = calculateResults();
    if (!result.ranked.length) return;

    setShareStatus(uiText('creatingShareImage'));
    createShareCardBlob(result, function(blob) {
      if (!blob) {
        setShareStatus(uiText('shareImageFailed'));
        return;
      }

      var shareData = buildShareData(result);
      var file = typeof File !== 'undefined' ?
        new File([blob], 'hanzi-guide-geo-quiz.png', { type: 'image/png' }) :
        null;
      var shareText = shareData.text + ' ' + shareData.url;

      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share({
          title: shareData.title,
          text: shareText,
          files: [file]
        })
          .then(function() {
            setShareStatus(uiText('shareCardSent'));
          })
          .catch(function(err) {
            if (err && err.name === 'AbortError') {
              setShareStatus('');
              return;
            }
            downloadShareCard(blob);
          });
        return;
      }

      downloadShareCard(blob);
      copyShareText(shareText);
    });
  }

  function createShareCardBlob(result, done) {
    var canvas = document.createElement('canvas');
    var width = 1080;
    var height = 1350;
    var ctx = canvas.getContext('2d');
    var best = result.ranked[0];
    var specificRegion = result.specificRegion || computeSpecificRegion(result);
    var blend = result.ranked
      .filter(function(item) {
        return item.key !== 'mixed' && item.score > 0;
      })
      .slice(0, 3);
    var localities = computeLacdMatches(result, 3);

    canvas.width = width;
    canvas.height = height;

    drawShareCardBackground(ctx, width, height, blend);
    ctx.fillStyle = '#17312d';
    ctx.font = '700 44px Arial, sans-serif';
    ctx.fillText(uiText('shareCardTitle'), 76, 110);

    ctx.fillStyle = '#10211f';
    ctx.font = '700 76px Arial, sans-serif';
    wrapCanvasText(ctx, best.category.label, 76, 240, 870, 86, 3);

    ctx.fillStyle = '#3f4d49';
    ctx.font = '400 34px Arial, sans-serif';
    wrapCanvasText(ctx, specificRegion ? uiText('closestLocalSignalCanvas', { label: specificRegion.label }) : best.category.summary, 76, 500, 860, 46, 3);

    drawShareBlend(ctx, blend, 76, 690);

    if (localities.length) {
      ctx.fillStyle = '#4d5b57';
      ctx.font = '700 31px Arial, sans-serif';
      ctx.fillText(uiText('closestAtlasLocalities'), 76, 1010);
      ctx.font = '400 31px Arial, sans-serif';
      localities.forEach(function(item, index) {
        ctx.fillText(item.name + ' · ' + Math.round(item.match * 100) + '%', 76, 1062 + index * 46);
      });
    }

    ctx.fillStyle = '#2f7f73';
    ctx.font = '700 32px Arial, sans-serif';
    ctx.fillText(uiText('tryYours', { path: localizedQuizPath() }), 76, 1260);

    if (canvas.toBlob) {
      canvas.toBlob(done, 'image/png');
    } else {
      done(dataUrlToBlob(canvas.toDataURL('image/png')));
    }
  }

  function drawShareCardBackground(ctx, width, height, blend) {
    ctx.fillStyle = '#f6faf8';
    ctx.fillRect(0, 0, width, height);

    blend.forEach(function(item, index) {
      var color = item.category.mapColor || '#8aa9c4';
      var x = 760 + index * 82;
      var y = 180 + index * 145;
      var gradient = ctx.createRadialGradient(x, y, 0, x, y, 360);
      gradient.addColorStop(0, hexToRgba(color, 0.34));
      gradient.addColorStop(0.62, hexToRgba(color, 0.12));
      gradient.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 360, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = '#d9e5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, width - 68, height - 68);
  }

  function drawShareBlend(ctx, blend, x, y) {
    blend.forEach(function(item, index) {
      var percent = Math.round(item.normalized * 100);
      var rowY = y + index * 78;
      ctx.fillStyle = '#253431';
      ctx.font = '700 38px Arial, sans-serif';
      ctx.fillText(percent + '%', x, rowY);
      ctx.font = '400 34px Arial, sans-serif';
      ctx.fillText(item.category.label, x + 128, rowY);
      ctx.fillStyle = item.category.mapColor || '#8aa9c4';
      ctx.fillRect(x + 128, rowY + 18, Math.max(28, percent * 7.1), 13);
    });
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var words = String(text || '').split(/\s+/);
    var line = '';
    var lines = 0;

    words.forEach(function(word) {
      if (lines >= maxLines) return;
      var test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        lines += 1;
        line = word;
      } else {
        line = test;
      }
    });

    if (line && lines < maxLines) {
      ctx.fillText(line, x, y);
    }
  }

  function dataUrlToBlob(dataUrl) {
    var parts = dataUrl.split(',');
    var mime = parts[0].match(/:(.*?);/)[1];
    var binary = atob(parts[1]);
    var array = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  }

  function downloadShareCard(blob) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'hanzi-guide-geo-quiz.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 1000);
    setShareStatus(uiText('shareImageDownloaded'));
  }

  function localizedQuizPath() {
    if (pageLang === 'zh-Hans') return '/cn/geo-quiz/';
    if (pageLang === 'zh-Hant') return '/tw/geo-quiz/';
    return '/geo-quiz/';
  }

  function buildShareData(result) {
    var best = result.ranked[0];
    var second = result.ranked[1];
    var specificRegion = result.specificRegion || computeSpecificRegion(result);
    var blendText = result.ranked
      .filter(function(item) {
        return item.key !== 'mixed' && item.score > 0;
      })
      .slice(0, 3)
      .map(function(item) {
        return Math.round(item.normalized * 100) + '% ' + item.category.label;
      })
      .join(', ');
    var title = uiText('shareTitle');
    var url = window.location.origin + localizedQuizPath();
    var text = uiText('shareText', {
      blend: blendText || best.category.label,
      confidence: best.confidence,
      count: getQuestionCount()
    });

    if (specificRegion) {
      text += uiText('shareMoreSpecific', { label: specificRegion.label });
    }

    if (second && second.score > 0) {
      text += uiText('shareNextClosest', { label: second.category.label });
    }

    return {
      title: title,
      text: text,
      url: url
    };
  }

  function copyShareText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function() {
          setShareStatus(uiText('shareTextCopied'));
        })
        .catch(function() {
          fallbackCopyShareText(text);
        });
      return;
    }

    fallbackCopyShareText(text);
  }

  function fallbackCopyShareText(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      var copied = document.execCommand('copy');
      setShareStatus(copied ? uiText('shareTextCopied') : uiText('copyFailed'));
    } catch (err) {
      setShareStatus(uiText('copyFailed'));
    }

    document.body.removeChild(textarea);
  }

  function setShareStatus(message) {
    if (els.shareStatus) {
      els.shareStatus.textContent = message;
    }
  }

  function handleFeedbackClick(feedback, button) {
    if (feedback === 'no') {
      showLocationFeedbackForm(button);
      return;
    }

    submitFeedback(feedback, button);
  }

  function showLocationFeedbackForm(button) {
    resetFeedbackButtons();
    if (button) {
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
    }
    if (els.feedbackLocationForm) {
      els.feedbackLocationForm.hidden = false;
    }
    if (els.feedbackStatus) {
      els.feedbackStatus.textContent = uiText('askActualLocation');
    }
    if (els.actualLocation) {
      els.actualLocation.value = '';
      els.actualLocation.focus();
    }
  }

  function submitLocationFeedback(event) {
    event.preventDefault();
    var location = normalizeFeedbackLocation(els.actualLocation ? els.actualLocation.value : '');
    var noButton = getFeedbackButton('no');

    if (!location) {
      if (els.feedbackStatus) {
        els.feedbackStatus.textContent = uiText('enterActualLocation');
      }
      if (els.actualLocation) {
        els.actualLocation.focus();
      }
      return;
    }

    submitFeedback('no', noButton, location);
  }

  function submitFeedback(feedback, button, actualLocation) {
    var result = calculateResults();
    if (!result.ranked.length) return;

    var payload = buildFeedbackPayload(feedback, result, actualLocation);
    var eventValue = feedback === 'yes' ? 2 : feedback === 'close' ? 1 : 0;
    var sent = trackMatomoEvent('Geo Quiz', 'Feedback', JSON.stringify(payload), eventValue);

    resetFeedbackButtons();
    if (button) {
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
    }
    hideLocationFeedbackForm();

    if (els.feedbackStatus) {
      els.feedbackStatus.textContent = sent ?
        uiText('feedbackSent') :
        uiText('feedbackUnavailable');
    }
  }

  function buildFeedbackPayload(feedback, result, actualLocation) {
    var best = result.ranked[0];
    var specificRegion = result.specificRegion || computeSpecificRegion(result);
    var payload = {
      version: 1,
      feedback: feedback,
      result: {
        best: best ? best.key : null,
        bestLabel: best ? best.category.label : null,
        specificRegion: specificRegion,
        confidence: best ? best.confidence : null,
        variety: best ? best.category.variety : null,
        topMatches: result.ranked.slice(0, 5).map(function(item) {
          return {
            key: item.key,
            label: item.category.label,
            score: item.score,
            match: Math.round(item.normalized * 100),
            band: membershipBand(item.normalized)
          };
        }),
        atlasLocalities: computeLacdMatches(result, 8).map(function(item) {
          return {
            id: item.id,
            name: item.name,
            match: Math.round(item.match * 100),
            cluster: item.cluster,
            clusterLabel: item.clusterLabel,
            fuzzyCode: item.fuzzyCode,
            fuzzyBand: item.fuzzyBand
          };
        })
      },
      answers: state.answers.map(function(answerIndex, questionIndex) {
        if (questionIndex >= getQuestionCount()) return null;
        var question = questions[questionIndex];
        var selected = question && question.answers[answerIndex];
        return {
          question: 'q' + String(questionIndex + 1).padStart(2, '0'),
          type: question ? question.type : null,
          prompt: question ? question.prompt : null,
          answerIndex: typeof answerIndex === 'number' ? answerIndex : null,
          answer: selected ? selected.text : null
        };
      }).filter(Boolean),
      questionCount: getQuestionCount()
    };
    if (feedback === 'no') {
      payload.actualLocation = actualLocation || null;
    }
    return payload;
  }

  function resetFeedbackButtons() {
    if (!els.feedbackButtons) return;
    els.feedbackButtons.forEach(function(button) {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
    });
    if (els.feedbackStatus) {
      els.feedbackStatus.textContent = uiText('feedbackDefault');
    }
    hideLocationFeedbackForm();
  }

  function hideLocationFeedbackForm() {
    if (els.feedbackLocationForm) {
      els.feedbackLocationForm.hidden = true;
    }
    if (els.actualLocation) {
      els.actualLocation.value = '';
    }
  }

  function getFeedbackButton(feedback) {
    if (!els.feedbackButtons) return null;
    for (var i = 0; i < els.feedbackButtons.length; i += 1) {
      if (els.feedbackButtons[i].getAttribute('data-feedback') === feedback) {
        return els.feedbackButtons[i];
      }
    }
    return null;
  }

  function normalizeFeedbackLocation(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }

  function trackMatomoEvent(category, action, name, value) {
    if (typeof window === 'undefined' || !window._paq || typeof window._paq.push !== 'function') {
      return false;
    }

    var payload = ['trackEvent', category, action];
    if (name !== undefined && name !== null) {
      payload.push(name);
      if (value !== undefined && value !== null) {
        payload.push(value);
      }
    }
    window._paq.push(payload);
    return true;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function hasCompleteAnswers() {
    for (var i = 0; i < getQuestionCount(); i += 1) {
      if (typeof state.answers[i] !== 'number') return false;
    }
    return true;
  }

  function saveState() {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({
        index: state.index,
        answers: state.answers,
        questionCount: getQuestionCount(),
        completed: state.completed
      }));
    } catch (err) {
      // Session persistence is a convenience; the quiz still works without it.
    }
  }

  function restoreState() {
    var raw;
    try {
      raw = window.sessionStorage.getItem(storageKey);
    } catch (err) {
      return;
    }
    if (!raw) return;

    try {
      var saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.answers)) return;

      if (quizLengths.indexOf(saved.questionCount) !== -1) {
        state.questionCount = saved.questionCount;
      }

      state.answers = saved.answers.map(function(value, index) {
        var question = questions[index];
        if (!question || typeof value !== 'number') return undefined;
        if (value < 0 || value >= question.answers.length) return undefined;
        return value;
      });

      if (typeof saved.index === 'number' && saved.index >= 0) {
        state.index = Math.min(saved.index, getQuestionCount() - 1);
      }
      state.completed = saved.completed === true;
    } catch (err) {
      clearSavedState();
    }
  }

  function clearSavedState() {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch (err) {
      // Ignore unavailable storage.
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
