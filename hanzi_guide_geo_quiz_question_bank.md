# Hanzi Guide Geo Quiz Question Bank

## Recommendation

Use an adaptive quiz with a short first run and a larger internal question bank.

Recommended public quiz length:

- **Fast mode:** 12 questions
- **Default mode:** 18 questions
- **High-precision mode:** 25 questions

Recommended internal bank:

- **MVP bank:** 40-60 questions
- **Good v1 bank:** 100-150 questions
- **Research-grade bank:** generated from LACD or another labeled atlas source

Do not show all questions to every user. Start with broad discriminators, then branch toward the strongest competing regions. If the top two regions are close, spend the remaining questions separating those two.

## What We Can Learn From LACD

The Linguistic Atlas of Chinese Dialects is ideal for the map and scoring architecture, but the currently downloaded Zenodo supplement does not include user-facing names for all 510 variables. It includes coded variables and cluster outputs.

Useful facts:

- LACD covers **930 localities**.
- It contains **510 linguistic maps**.
- The maps are split into:
  - **205 phonology maps**
  - **203 lexicon maps**
  - **102 grammar maps**
- The underlying survey elicited:
  - pronunciations for **425 characters**
  - local terms for **470 lexical items**
  - local forms for **110 grammatical forms**

Current implementation can therefore use LACD safely for:

- locality points
- map colors
- broad/fuzzy dialect clusters
- top atlas-locality display

But for a fully LACD-native quiz, we still need one of:

- the printed atlas map titles and legends
- a digital LACD release with variable labels
- manual labeling of the 510 coded variables

## Question Count Strategy

### First 5 Questions: Broad Split

Goal: Mandarin vs Cantonese/Yue vs Min vs Wu vs Central/Southwestern vs mixed.

Use:

- script preference
- casual negation
- “what?”
- “I do not know”
- one pronunciation prompt

### Questions 6-12: Primary Region

Goal: identify likely macro-region.

Use:

- lexicon for common actions and nouns
- pronoun or question-word grammar
- casual-message written form
- a second pronunciation prompt

### Questions 13-18: Close Competitors

Goal: separate top competing clusters.

Examples:

- Hong Kong Cantonese vs Guangdong Cantonese
- Taiwan Mandarin vs Min/Hokkien influence
- North Mandarin vs Northeastern Mandarin
- Southwestern Mandarin vs Central transition zone
- Wu/Shanghainese vs broader Central/Wu-adjacent patterns

### Questions 19-25: High Precision

Goal: refine atlas-locality match and confidence.

Use:

- kinship terms
- body parts
- everyday verbs
- classifier/particle usage
- 2-3 pronunciation prompts
- one “which sentence sounds natural?” prompt

## Prompt Design Rules

Each question should have:

- `id`
- `prompt`
- `type`
- `answers`
- `features`
- `source_status`
- `ambiguity_note`
- `avoid_overclaiming`

Source status values:

- `lacd_direct`: exact LACD map title/legend verified
- `lacd_aligned`: matches an LACD survey category, but exact variable not yet verified
- `literature_aligned`: supported by dialectological literature but not mapped to an LACD variable yet
- `product_seed`: useful for MVP, needs later validation

## Visual Lexicon Questions

Yes: the quiz should use icons or images for many lexical prompts.

This is especially useful for LACD-style lexical items because the user does not need to translate an English gloss like "child" or "sun" into a Chinese category first. They can simply see a thing or situation and choose the word they would naturally use.

Recommended visual prompt types:

- `image_lexicon`: show one concrete object or scene and ask what the user calls it.
- `image_action`: show a person doing something and ask for the natural verb or phrase.
- `image_weather`: show a weather condition and ask for the natural expression.
- `image_kinship`: show a family relation diagram and ask for the natural term.

Good first visual prompts:

- child: `小孩`, `小朋友`, `細路`, `囡仔`, `娃娃`, `伢儿`
- home/house: `家`, `屋`, `屋企`, `厝`, `房子`
- sun: `太阳`, `日头`, `日頭`, `太阳公`, `日头公`
- rain/raining: `下雨`, `落雨`, `落水`, `落雨水`
- father: `爸爸`, `爹`, `阿爸`, `老豆`
- mother: `妈妈`, `娘`, `阿母`, `老母`, `媽咪`
- older brother: `哥哥`, `阿哥`, `大佬`, `兄`
- older sister: `姐姐`, `阿姐`, `家姐`, `姊`
- eat/eat a meal: `吃饭`, `吃飯`, `食飯`, `呷`, `喫`
- hot weather: `热`, `熱`, `焗`, `烫`, `暑`, `烧`
- cold weather: `冷`, `凍`, `寒`, `凉`, `冰`

Asset rules:

- Prefer the site’s existing local Font Awesome icons for simple decorative cues.
- Use photos or custom illustrations only when the visual distinction matters and the asset is culturally neutral.
- Avoid showing region-specific scenery, clothing, writing systems, license plates, shop signs, or architecture unless the question is explicitly about that context.
- Do not put Chinese text inside the icon or image; all answer text should be in the answer choices.
- Keep visual style consistent across the quiz so visual style does not accidentally imply a region.
- Do not rely on the visual asset for meaning. The text question should be complete by itself.
- Avoid decorative icons for kinship prompts if the icon would feel reductive or awkward.

Recommended UI copy:

> Which word would you naturally use for a child?

For actions:

> Which word would you naturally use for eating a meal?

For weather:

> Which phrase feels natural for “it is raining”?

Implementation shape:

```json
{
  "id": "lexicon_child_icon_001",
  "source_status": "lacd_aligned",
  "prompt_type": "icon_lexicon",
  "prompt": "Which word would you naturally use for a child?",
  "icon": {
    "class": "fas fa-child",
    "decorative": true
  },
  "answers": [
    {
      "text": "小孩",
      "features": {
        "mainland_mandarin": 2
      }
    },
    {
      "text": "細路",
      "features": {
        "yue_cantonese": 2
      }
    }
  ]
}
```

For the first implementation, prefer the site’s existing local Font Awesome icon font for decorative cues. Use custom local SVG/PNG assets only when an icon cannot represent the concept cleanly.

## LACD-Aligned User-Facing Questions

These are intentionally written as natural quiz prompts. Most are **LACD-aligned**, not yet `lacd_direct`, because the available supplement uses coded feature IDs without readable map labels.

### 1. First-Person Singular Pronoun

Source status: `lacd_direct` for topic, because Huang et al. explicitly mention LACD grammar map No. 1: first-person singular pronoun “I”.

Prompt:

> How would you naturally say “I”?

Options:

- 我
- 俺
- 吾 / 𠊎
- 我哋 / 我
- 阿拉 / 我
- Other

Notes:

- Good broad grammar prompt.
- Needs careful option validation by region.

### 2. Second-Person Singular Pronoun

Source status: `lacd_aligned`

Prompt:

> How would you naturally say “you”?

Options:

- 你
- 侬
- 汝 / 你
- 你哋 / 你
- 恁
- Other

Why useful:

- Pronouns often separate Mandarin, Wu, Min/Hakka-like, and Yue-influenced profiles.

### 3. Third-Person Pronoun

Source status: `lacd_aligned`

Prompt:

> How would you naturally say “he/she/they” in speech?

Options:

- 他 / 她
- 佢
- 伊
- 渠 / 其
- 侬 / 伊
- Other

### 4. Plural “We”

Source status: `lacd_aligned`

Prompt:

> Which sounds most natural for “we/us”?

Options:

- 我们
- 咱们
- 我哋
- 阮 / 咱
- 阿拉
- Other

### 5. “What?”

Source status: `lacd_aligned`

Prompt:

> Which word would you naturally use for “what?”?

Options:

- 什么
- 什麼
- 啥
- 咩
- 乜
- 啥物 / 物事
- Other

### 6. “Where?”

Source status: `lacd_aligned`

Prompt:

> Which word feels natural for “where?”?

Options:

- 哪里
- 哪儿
- 邊度
- 佗位 / 佗落
- 何里 / 啥地方
- Other

### 7. “I Do Not Know”

Source status: `product_seed`, likely LACD-aligned as grammar/negation.

Prompt:

> Complete this naturally: “I do not know.”

Options:

- 我不知道
- 我不晓得
- 我唔知
- 我毋知
- 我弗晓得
- Other

### 8. Negative Marker

Source status: `lacd_aligned`

Prompt:

> Which negative word feels most natural in casual speech?

Options:

- 不
- 没
- 唔
- 毋
- 弗
- 勿
- Other

### 9. “Do Not Have”

Source status: `product_seed`, likely LACD-aligned.

Prompt:

> Which would you naturally write or say for “do not have / none”?

Options:

- 没有
- 沒有
- 冇
- 無
- 呒 / 呒没
- Other

### 10. Progressive Aspect

Source status: `lacd_aligned`

Prompt:

> Which sentence sounds most natural for “I am eating”?

Options:

- 我在吃饭
- 我正在吃饭
- 我食緊飯
- 我喺度食飯
- 我勒吃饭 / 我在吃饭
- Other

### 11. Perfective / Completed Action

Source status: `lacd_aligned`

Prompt:

> Which feels natural for “I ate already”?

Options:

- 我吃了
- 我吃过了
- 我食咗
- 我食矣 / 食了
- 我吃脱了 / 吃仔
- Other

### 12. Sentence-Final Question Particle

Source status: `lacd_aligned`

Prompt:

> Which casual question sounds most natural?

Options:

- 你去吗？
- 你去不去？
- 你去咩？
- 你去未？
- 你去伐？
- Other

### 13. Casual “Doing What?”

Source status: `product_seed`

Prompt:

> In casual texting, which looks most natural?

Options:

- 你在做什么？
- 你在做什麼？
- 你喺度做咩？
- 你做紧乜？
- 侬勒做啥？
- Other

### 14. Eat / Eat a Meal

Source status: `lacd_aligned`

Prompt type: `image_action` or `text_lexicon`

Prompt:

> Which word would you naturally use for “eat / eat a meal”?

Options:

- 吃饭
- 吃飯
- 食飯
- 呷
- 喫
- Other

### 15. Child

Source status: `lacd_aligned`

Prompt type: `image_lexicon` or `text_lexicon`

Prompt:

> What would you naturally call a child?

Options:

- 小孩
- 小朋友
- 細路
- 囡仔
- 娃娃
- 伢儿
- Other

### 16. Very Good

Source status: `literature_aligned`

Prompt:

> Which form feels natural for “very good”?

Options:

- 很好
- 好好
- 巴适
- 老好了
- 蛮好
- 老灵额
- Other

### 17. House / Home

Source status: `lacd_aligned`

Prompt type: `image_lexicon` or `text_lexicon`

Prompt:

> Which word feels most natural for “home / house”?

Options:

- 家
- 屋
- 屋企
- 厝
- 房子
- Other

### 18. Sun

Source status: `lacd_aligned`

Prompt type: `image_lexicon` or `text_lexicon`

Prompt:

> What would you naturally call the sun?

Options:

- 太阳
- 日头
- 日頭
- 太阳公 / 日头公
- 日脚
- Other

### 19. Rain

Source status: `lacd_aligned`

Prompt type: `image_weather` or `text_lexicon`

Prompt:

> Which phrase feels natural for “it is raining”?

Options:

- 下雨
- 落雨
- 落水
- 落雨水
- 落雨仔
- Other

### 20. Hot Weather

Source status: `lacd_aligned`

Prompt type: `image_weather` or `text_lexicon`

Prompt:

> Which word would you naturally use for “hot” weather?

Options:

- 热
- 熱
- 焗
- 烫 / 烘
- 暑 / 烧
- Other

### 21. Cold Weather

Source status: `lacd_aligned`

Prompt type: `image_weather` or `text_lexicon`

Prompt:

> Which word would you naturally use for “cold” weather?

Options:

- 冷
- 凍
- 寒
- 凉
- 冰
- Other

### 22. Father

Source status: `lacd_aligned`

Prompt type: `image_kinship` or `text_lexicon`

Prompt:

> What would you naturally call your father?

Options:

- 爸爸
- 爹
- 阿爸
- 老豆
- 父亲 / 父親
- Other

### 23. Mother

Source status: `lacd_aligned`

Prompt type: `image_kinship` or `text_lexicon`

Prompt:

> What would you naturally call your mother?

Options:

- 妈妈
- 娘
- 阿母
- 老母 / 媽咪
- 母亲 / 母親
- Other

### 24. Older Brother

Source status: `lacd_aligned`

Prompt type: `image_kinship` or `text_lexicon`

Prompt:

> What would you naturally call an older brother?

Options:

- 哥哥
- 阿哥
- 大佬
- 兄
- 哥
- Other

### 25. Older Sister

Source status: `lacd_aligned`

Prompt type: `image_kinship` or `text_lexicon`

Prompt:

> What would you naturally call an older sister?

Options:

- 姐姐
- 阿姐
- 家姐
- 姊
- 姐
- Other

## Pronunciation Prompts

Pronunciation prompts should be optional or use romanization/audio choices. They are powerful but can frustrate users who do not know romanization.

### 26. 生

Source status: `product_seed`

Prompt:

> Which pronunciation is closest to how you say 生?

Options:

- sheng
- saang
- seh (with a nasal ending)
- senn / sen
- sang
- Other

Implementation note: avoid tone marks or tone numbers in the user-facing option labels. They make the answer set feel like a romanization-system test and can reveal the intended region too strongly.

### 27. 人

Source status: `lacd_aligned`

Prompt:

> Which pronunciation is closest to how you say 人?

Options:

- ren
- yan / jan
- lang
- nyin / gnin
- nin / yin
- Other

### 28. 日

Source status: `lacd_aligned`

Prompt:

> Which pronunciation is closest to how you say 日?

Options:

- rì
- jat6
- ji̍t / lit
- nyit / gniet
- niq / zeq
- Other

### 29. 山

Source status: `lacd_aligned`

Prompt:

> Which pronunciation is closest to how you say 山?

Options:

- shān
- saan1
- soaⁿ
- sae / san
- san
- Other

### 30. 水

Source status: `lacd_aligned`

Prompt:

> Which pronunciation is closest to how you say 水?

Options:

- shuǐ
- seoi2
- chúi / tsuí
- sy / su
- sui
- Other

## High-Precision Branch Questions

These should appear only after broad matching.

### Hong Kong / Guangdong Cantonese Branch

1. In texting, would you write `佢`, `他`, or something else?
2. Which looks natural: `我食咗飯`, `我吃了饭`, `我食完飯`?
3. Which question particle feels natural: `嗎`, `咩`, `呀`, `未`?
4. Would you write `嘅`, `的`, or avoid this structure?
5. Which pronunciation is closest for 我: `ngo`, `wo`, `gua`, other?

### Taiwan / Min-Hokkien Branch

1. Which feels natural for “home”: `家`, `厝`, `屋企`, `房子`?
2. Which feels natural for “eat”: `吃`, `食`, `呷`?
3. Which pronunciation is closest for 人: `ren`, `lang`, `yan / jan`, other?
4. Which sentence-final style feels natural: `嗎`, `喔/啦`, `無`, other?
5. Which script do you normally use: traditional, simplified, mixed?

### Wu / Shanghai Branch

1. Which pronoun feels familiar: `侬`, `你`, `伊`, `佢`?
2. Which negative marker feels natural: `勿`, `弗`, `不`, `唔`?
3. Which “what” form feels natural: `啥`, `什么`, `咩`, `物事`?
4. Which sentence sounds natural: `侬勒做啥？`, `你在做什么？`, other?
5. Which “very good” form feels natural: `老灵额`, `很好`, `蛮好`?

### Southwestern / Central Branch

1. Which feels natural: `我不知道`, `我不晓得`, `我不懂`?
2. Which adjective feels natural: `巴适`, `蛮好`, `很好`?
3. Which “what” form feels natural: `啥`, `什么`, `咩`?
4. Which “child” word feels natural: `娃娃`, `小孩`, `伢儿`, `小朋友`?
5. Which regionally marked phrase do you actively use, if any?

### North / Northeast Mandarin Branch

1. Which “very good” form feels natural: `很好`, `老好了`, `挺好`, `蛮好`?
2. Which “child” form feels natural: `小孩`, `孩子`, `娃娃`, `小朋友`?
3. Which “where” form feels natural: `哪儿`, `哪里`, `啥地方`?
4. Do you naturally use erhua in words like `哪儿`, `这儿`, `玩儿`?
5. Which sentence sounds natural: `你干啥呢？`, `你在做什么？`, `你做咩？`

## Implementation Plan

### Phase 1: Markdown Bank

This file.

### Phase 2: Structured JSON

Create:

`assets/data/geo-quiz-questions.json`

Each question should contain:

```json
{
  "id": "pronoun_i_001",
  "source_status": "lacd_direct",
  "prompt_type": "grammar",
  "prompt": "How would you naturally say \"I\"?",
  "answers": [
    {
      "text": "我",
      "features": {
        "mainland_mandarin": 2,
        "taiwan_mandarin": 2
      }
    }
  ],
  "notes": "LACD grammar map No. 1 topic is first-person singular pronoun."
}
```

### Phase 3: Adaptive Engine

Rules:

- Always ask 5 broad split questions.
- Score live.
- Select next question that separates top two or top three regions.
- Stop after 12 questions if confidence is high.
- Continue to 18 questions if confidence is medium.
- Offer high-precision mode up to 25 questions.

### Phase 4: LACD Validation

For every `lacd_aligned` question:

1. Find the exact LACD map title.
2. Map answer options to LACD type/subtype codes where possible.
3. Add `lacd_feature_id`, such as `F1_L` or equivalent.
4. Use Weighted Jaccard-like locality scoring instead of only hand feature weights.

## Product Copy

Use:

> Your answers most closely match these atlas localities and broader dialect regions.

Avoid:

> You are from X.

Use:

> This map compares your answer pattern with LACD atlas localities. It is strongest for traditional regional speech patterns and may be less precise for learners, mixed-background users, and modern urban speech.

## Sources

- Huang, He; Grieve, Jack; Jiao, Lei; Cai, Zhuo. 2024. “Geographic structure of Chinese dialects: a computational dialectometric approach.” Linguistics 62(4): 937-976. DOI: 10.1515/ling-2021-0138.
- Zenodo supplement: https://zenodo.org/records/10697975
- Commercial Press description of 汉语方言地图集（语音卷）: https://www.cp.com.cn/book/6187bddd-8.html
- Linguistic Atlas of Chinese Dialects overview: https://en.wikipedia.org/wiki/Linguistic_Atlas_of_Chinese_Dialects
