(function() {
  'use strict';

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

  var questions = [
    {
      type: 'Word choice',
      prompt: 'Which word would you naturally use for a child?',
      note: 'Choose the form that feels most natural to you.',
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
      prompt: 'Which would you actually write in a casual message for “do not have / none”?',
      note: 'Recognition alone is less important here than active use.',
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
      prompt: 'Complete this naturally: “I do not know.”',
      note: '',
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
      prompt: 'How would you pronounce 生?',
      note: 'Pick the closest option.',
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
      prompt: 'In casual texting, which looks most natural to you?',
      note: '',
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
      prompt: 'Which word would you naturally use for eating a meal?',
      note: 'Pick the closest eating-a-meal expression.',
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
      prompt: 'Which word feels most natural for “home / house”?',
      note: 'Think of an everyday word for home or house.',
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
      prompt: 'What would you naturally call the sun?',
      note: 'Choose your everyday word for the sun.',
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
      prompt: 'Which phrase feels natural for “it is raining”?',
      note: 'Choose your everyday expression for raining.',
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
      prompt: 'Which word would you naturally use for hot weather?',
      note: 'Choose your natural word for hot weather.',
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
      prompt: 'Which word would you naturally use for cold weather?',
      note: 'Choose your natural word for cold weather.',
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
      prompt: 'What would you naturally call your father?',
      note: '',
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
      prompt: 'What would you naturally call your mother?',
      note: '',
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
      prompt: 'Which set of characters do you recognize most comfortably?',
      note: 'Recognition is weaker evidence than active use.',
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
      prompt: 'Which form feels most natural for “very good”?',
      note: '',
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
      prompt: 'Which word would you naturally use for “what?”',
      note: '',
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
      prompt: 'Which word feels natural for “where?”',
      note: '',
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
      prompt: 'Which script feels most natural for everyday Chinese writing?',
      note: '',
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
      prompt: 'How would you naturally say “I”?',
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
      prompt: 'How would you naturally say “you”?',
      note: '',
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
      prompt: 'Which sounds most natural for “we/us”?',
      note: '',
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
      prompt: 'Which sentence sounds most natural for “I am eating”?',
      note: '',
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
      prompt: 'Which feels natural for “I ate already”?',
      note: '',
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
      prompt: 'Which casual question sounds most natural?',
      note: '',
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
      prompt: 'Which pronunciation is closest to how you say 人?',
      note: 'Pick the closest option.',
      answers: [
        answer('ren', { mainland_mandarin: 4, taiwan_mandarin: 3, northeast_mandarin: 2, sichuan_mandarin: 1 }, 'You chose a ren-like reading.'),
        answer('yan / jan', { hk_cantonese: 5, guangdong_cantonese: 5 }, 'You chose a yan/jan-like reading.'),
        answer('lang', { min_hokkien: 5 }, 'You chose a lang-like reading.'),
        answer('nyin / gnin', { wu_shanghai: 4, central_china: 1 }, 'You chose a nyin/gnin-like reading.'),
        answer('nin / yin', { central_china: 2, sichuan_mandarin: 1, mixed: 1 }, 'You chose a regional or mixed non-standard reading.')
      ]
    }
  ];

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
    els.mapInsight = document.getElementById('geo-quiz-map-insight');
    els.clues = document.getElementById('geo-quiz-clues');
    els.resetButtons = document.querySelectorAll('.geo-quiz-reset');
    els.review = document.getElementById('geo-quiz-review');
    els.share = document.getElementById('geo-quiz-share');
    els.shareStatus = document.getElementById('geo-quiz-share-status');
    els.feedbackButtons = document.querySelectorAll('.geo-quiz-feedback-buttons button[data-feedback]');
    els.feedbackStatus = document.getElementById('geo-quiz-feedback-status');
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
    els.modeButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        setQuestionCount(Number(button.getAttribute('data-question-count')));
      });
    });
    els.feedbackButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        submitFeedback(button.getAttribute('data-feedback'), button);
      });
    });

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
    els.progressText.textContent = 'Question ' + (state.index + 1) + ' of ' + activeQuestions.length;
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
    els.next.textContent = state.index === activeQuestions.length - 1 ? 'Show Map' : 'Next';
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
        text: option.clue,
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

  function confidenceLabel(normalized, score, ranked) {
    if (score < 8) return 'Low confidence';
    if (normalized >= 0.86 && ranked.length > 1 && score - ranked[1].score >= 5) return 'High confidence';
    if (normalized >= 0.64) return 'Medium confidence';
    return 'Low confidence';
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
        percent + '% relative match · ' + escapeHtml(membershipBand(item.normalized)) +
        '</strong><em>' + escapeHtml(item.category.macroRegion) + '</em>';
      els.topMatches.appendChild(li);
    });

    if (els.mapInsight) {
      els.mapInsight.innerHTML = buildMapInsight(result);
    }
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
      mapEl.innerHTML = '<div class="geo-quiz-map-fallback">OpenStreetMap could not load. The ranked list still shows your regional matches.</div>';
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
        div.innerHTML = '<strong>How to read the map</strong>' +
          '<span><i class="geo-quiz-legend-swatch geo-quiz-legend-swatch-red"></i>Color = atlas region group</span>' +
          '<span><i class="geo-quiz-legend-swatch geo-quiz-legend-swatch-purple"></i>Different colors mean different groups</span>' +
          '<span><i class="geo-quiz-legend-swatch geo-quiz-legend-swatch-dark"></i>Darker/larger = stronger match</span>' +
          '<span><i class="geo-quiz-legend-dot"></i>Dots = atlas localities</span>';
        return div;
      };
      legendControl.addTo(map);
    }

    clearMap();
    renderLacdLayer(ranked);

    if (overlays.length) {
      var group = L.featureGroup(overlays);
      map.fitBounds(group.getBounds().pad(0.18), { maxZoom: 6 });
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
          renderLocalMatches(result);
          renderSpecificRegion(result);
        }
      })
      .catch(function() {
        lacdData = null;
      });
  }

  function renderLacdLayer(ranked) {
    if (!map || !lacdData || !Array.isArray(lacdData.points)) return;

    var rawScores = calculateResults().rawScores;
    var maxScoreValue = Object.keys(rawScores).reduce(function(max, key) {
      return Math.max(max, rawScores[key]);
    }, 1);
    var scoredPoints = getScoredLacdPoints(rawScores, maxScoreValue);

    heatLayer = createAtlasHeatLayer(scoredPoints.filter(function(point) {
      return point.match > 0.08;
    }));
    heatLayer.addTo(map);

    var markers = scoredPoints.map(function(point) {
      var marker = L.circleMarker([point.lat, point.lon], {
        radius: 3.2 + point.match * 3.8,
        color: '#263238',
        weight: point.match > 0.55 ? 1 : 0,
        fillColor: point.rgb || '#8aa9c4',
        fillOpacity: 0.16 + point.match * 0.68,
        opacity: 0.35 + point.match * 0.5
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
      return scoredPoints[index].match > 0.28;
    });
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
        var radius = Math.max(32, Math.min(92, 28 + zoom * 8));

        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        points.forEach(function(point) {
          if (!point.match) return;
          var layerPoint = this._map.latLngToLayerPoint([point.lat, point.lon]);
          var x = layerPoint.x - topLeft.x;
          var y = layerPoint.y - topLeft.y;
          var alpha = Math.max(0.03, Math.min(0.23, point.match * 0.22));
          var gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

          gradient.addColorStop(0, hexToRgba(point.rgb || '#8aa9c4', alpha));
          gradient.addColorStop(0.5, hexToRgba(point.rgb || '#8aa9c4', alpha * 0.42));
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
      loading.textContent = 'Loading Linguistic Atlas of Chinese Dialects localities...';
      els.localMatches.appendChild(loading);
      return;
    }

    var matches = computeLacdMatches(result, 8);
    if (!matches.length) {
      var empty = document.createElement('li');
      empty.className = 'geo-quiz-local-muted';
      empty.textContent = 'No atlas locality match is available for this answer pattern.';
      els.localMatches.appendChild(empty);
      return;
    }

    matches.forEach(function(match) {
      var li = document.createElement('li');
      li.innerHTML = '<span>' + escapeHtml(match.name) + '</span><strong>' +
        Math.round(match.match * 100) + '% locality score</strong><em>' +
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

    els.specificRegion.textContent = 'More specific: ' + specificRegion.label;
    els.specificRegion.hidden = false;
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
    if (value >= 0.82) return 'core-like';
    if (value >= 0.58) return 'marginal';
    if (value >= 0.34) return 'weak';
    return 'trace';
  }

  function buildMapInsight(result) {
    var ranked = result.ranked || result;
    var visible = ranked.filter(function(item) {
      return item.key !== 'mixed' && item.score > 0;
    });
    if (!visible.length) {
      return '<p>No strong geographic signal yet.</p>';
    }

    var top = visible[0];
    var second = visible[1];
    var specificRegion = computeSpecificRegion(result);
    var copy = '<p>The darkest shading is the strongest relative match. Lighter shading shows secondary or transitional signals.</p>';
    copy += '<p><strong>' + escapeHtml(top.category.label) + '</strong> is currently ' +
      escapeHtml(membershipBand(top.normalized)) + ' for your answer pattern.</p>';
    if (specificRegion) {
      copy += '<p>The more specific map signal is <strong>' + escapeHtml(specificRegion.label) +
        '</strong>, based on nearby atlas localities such as ' +
        escapeHtml(specificRegion.localities.join(', ')) + '.</p>';
    }

    if (second && top.normalized - second.normalized < 0.22) {
      copy += '<p>Your top two regions are close, so this should be read as an overlap pattern rather than a precise location.</p>';
    }

    copy += '<p>This follows the idea that Chinese dialect geography has stronger centers, softer margins, and transition zones.</p>';
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
          setShareStatus('Result shared.');
        })
        .catch(function(err) {
          if (err && err.name === 'AbortError') return;
          copyShareText(shareData.text + '\n' + shareData.url);
        });
      return;
    }

    copyShareText(shareData.text + '\n' + shareData.url);
  }

  function buildShareData(result) {
    var best = result.ranked[0];
    var second = result.ranked[1];
    var specificRegion = result.specificRegion || computeSpecificRegion(result);
    var title = 'Where is your Chinese from?';
    var url = window.location.origin + '/geo-quiz/';
    var text = 'My Hanzi Guide Chinese variety match is ' + best.category.label +
      ' (' + best.confidence + ', ' + getQuestionCount() + ' questions).';

    if (specificRegion) {
      text += ' More specific: ' + specificRegion.label + '.';
    }

    if (second && second.score > 0) {
      text += ' Next closest: ' + second.category.label + '.';
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
          setShareStatus('Share text copied to clipboard.');
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
      setShareStatus(copied ? 'Share text copied to clipboard.' : 'Copy failed. Select and copy the page URL instead.');
    } catch (err) {
      setShareStatus('Copy failed. Select and copy the page URL instead.');
    }

    document.body.removeChild(textarea);
  }

  function setShareStatus(message) {
    if (els.shareStatus) {
      els.shareStatus.textContent = message;
    }
  }

  function submitFeedback(feedback, button) {
    var result = calculateResults();
    if (!result.ranked.length) return;

    var payload = buildFeedbackPayload(feedback, result);
    var eventValue = feedback === 'yes' ? 2 : feedback === 'close' ? 1 : 0;
    var sent = trackMatomoEvent('Geo Quiz', 'Feedback', JSON.stringify(payload), eventValue);

    resetFeedbackButtons();
    if (button) {
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
    }

    if (els.feedbackStatus) {
      els.feedbackStatus.textContent = sent ?
        'Feedback sent. Thank you.' :
        'Feedback recorded on this page, but Matomo was not available.';
    }
  }

  function buildFeedbackPayload(feedback, result) {
    var best = result.ranked[0];
    var specificRegion = result.specificRegion || computeSpecificRegion(result);
    return {
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
  }

  function resetFeedbackButtons() {
    if (!els.feedbackButtons) return;
    els.feedbackButtons.forEach(function(button) {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
    });
    if (els.feedbackStatus) {
      els.feedbackStatus.textContent = 'Feedback sends your quiz answers and result to us so we can improve the model.';
    }
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
