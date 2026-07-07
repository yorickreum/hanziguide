# Hanzi.guide Geo-Prediction Quiz for Chinese Varieties

## Summary

Create an interactive quiz that predicts where a user likely grew up, learned Chinese, or acquired their Chinese variety based on the words, pronunciations, characters, and written forms they naturally use.

The quiz should work across Mandarin regional varieties, Cantonese, and eventually other Sinitic varieties such as Hokkien/Min Nan, Wu/Shanghainese, Hakka, Gan, Xiang, and Jin.

The experience should feel like:

> Tell us how you say these things. We’ll guess where your Chinese is from.

This is feasible for a fun MVP and valuable for hanzi.guide, especially if the system collects user-confirmed corrections over time. A truly precise Tages-Anzeiger-style geo-predictor is harder because Chinese regional speech variation is highly complex, and high-quality geo-tagged data is not as conveniently available as for some European dialect projects.

---

## Product Goal

The feature should infer a likely region, city cluster, or Chinese variety from a user’s answers to vocabulary, character, pronunciation, and writing-style questions.

The system should not ask directly:

> Where are you from?

until the end, where the user may optionally confirm or correct the result.

The result should say something like:

> Your answers most closely match Hong Kong Cantonese.

rather than:

> You are from Hong Kong.

This makes the feature more accurate, respectful, and robust for mixed-background users, heritage speakers, learners, and people who moved between regions.

---

## Core User Experience

The user is shown a sequence of prompts. Each prompt asks how they would naturally say, write, recognize, or pronounce a concept.

The main prompt types are:

1. Picture-based vocabulary prompts
2. Meaning-based word-choice prompts
3. Hanzi recognition prompts
4. Hanzi usage prompts
5. Pronunciation prompts
6. Sentence-completion prompts
7. Cantonese/Mandarin written-form prompts

Each answer contributes evidence toward one or more geographic regions or speech communities.

---

## Example Prompt Types

### 1. Picture-based vocabulary prompt

Show an image of an everyday object, action, or situation.

Prompt:

> What would you naturally call this?

Example: picture of a child

Options:

- 小孩
- 小朋友
- 細路
- 囡仔
- 娃娃
- 伢儿
- Other / I would say something else

Possible interpretation:

- `細路` strongly suggests Cantonese/Yue usage.
- `囡仔` may suggest Min/Hokkien-related usage, depending on context.
- `娃娃` may suggest parts of western/northern Mandarin usage.

---

### 2. Meaning-based word-choice prompt

Prompt:

> Which word would you naturally use for “to eat”?

Options:

- 吃
- 食
- 食飯
- 喫
- 呷
- Other

This tests lexical choice and written preference.

---

### 3. Hanzi recognition prompt

Prompt:

> Which of these characters do you know or recognize?

Options:

- 冇
- 嘅
- 佢
- 咗
- 唔
- 啲
- 乜
- 咩
- None of these

Recognizing many of these suggests exposure to written Cantonese. This should not be treated as proof of Cantonese nativeness, because learners and media consumers may also know them.

---

### 4. Hanzi usage prompt

Prompt:

> Which of these would you actually write in a message?

Options:

- 没有
- 冇
- 無
- 唔有
- I would not write this in Chinese

This distinguishes recognition from active use.

---

### 5. Pronunciation prompt

Prompt:

> How would you pronounce 生?

Input modes:

- Choose from romanized options
- Play audio and select closest match
- Type pronunciation manually

Example options:

- shēng
- saang1
- senn / sen
- seⁿ
- sang
- Other

This can separate Mandarin, Cantonese, Min, Wu, and other varieties.

---

### 6. Sentence-completion prompt

Prompt:

> Complete this sentence naturally: “I don’t know.”

Options:

- 我不知道
- 我不晓得
- 我唔知
- 我毋知
- 我弗晓得
- 我不懂
- Other

This tests grammar, negation, vocabulary, and regional phrasing.

---

### 7. Written Cantonese prompt

Prompt:

> In casual texting, which looks most natural to you?

Options:

- 你在做什么？
- 你喺度做咩？
- 你做紧乜？
- 你係咪做緊嘢？
- None of these

This helps distinguish standard written Chinese, Hong Kong Cantonese-style writing, and other Cantonese-influenced forms.

---

## Prediction Model

Each answer maps to weighted geographic and linguistic hypotheses.

Example:

```json
{
  "answer": "我唔知",
  "features": {
    "Yue": 4,
    "Cantonese": 4,
    "Hong Kong": 2,
    "Guangdong": 2,
    "Mandarin": -2
  }
}
```

The model should not make a hard guess immediately. Instead, it should maintain a probability distribution over possible regions and varieties.

The result map should be treated as fuzzy dialect membership, not a hard boundary map. This follows the dialectometric approach in Huang, Grieve, Jiao, and Cai (2024), which argues that Chinese dialect geography contains cores, margins, transition zones, and hierarchical relationships rather than only sharply separated dialect blocks.

Possible prediction levels:

### Level 1: Language/topolect family

- Mandarin
- Yue/Cantonese
- Min/Hokkien
- Wu/Shanghainese
- Hakka
- Gan
- Xiang
- Jin

### Level 2: Regional cluster

- Hong Kong / Macau Cantonese
- Guangdong Cantonese
- Sichuan/Chongqing Mandarin
- Northeastern Mandarin
- Beijing/Northern Mandarin
- Taiwanese Mandarin
- Southern Min / Hokkien
- Shanghainese/Wu

### Level 3: Specific location guess

- Hong Kong
- Guangzhou
- Chengdu/Chongqing area
- Beijing area
- Taiwan
- Shanghai area
- Fujian / Southern Fujian
- etc.

The final result should include confidence and alternatives.

Example result:

> Our best guess: **Hong Kong Cantonese**
>
> Other possible matches:
>
> - Guangzhou Cantonese
> - Macau Cantonese
> - Cantonese-speaking overseas background
>
> Why: You actively use 冇, 唔, 嘅 and 咗, selected 食飯 over 吃饭, and chose Cantonese-style sentence forms in casual writing.

---

## Important Distinctions

The quiz should distinguish between:

- Recognized characters vs actively used characters
- Formal written Chinese vs casual texting
- Native speech vs learned Chinese
- Family/home language vs school language
- Pronunciation vs vocabulary
- Mainland written norms vs Hong Kong/Taiwan/traditional-character norms

For example, a Mandarin speaker may recognize Cantonese characters from media but not use them. A Hong Kong speaker may know standard written Chinese but use Cantonese forms in casual messaging.

---

## Adaptive Questioning

The quiz should become more specific over time.

Early questions separate broad groups:

- Mandarin vs Cantonese vs Min vs Wu vs Hakka
- Simplified vs Traditional exposure
- Standard written Chinese vs colloquial written variety

Later questions target fine-grained distinctions:

- Hong Kong vs Guangzhou Cantonese
- Taiwan Mandarin vs Mainland Mandarin
- Sichuan/Chongqing vs Northern Mandarin
- Shanghai/Wu vs Mandarin-influenced Shanghai speech
- Hokkien/Min Nan vs Cantonese-like southern usage

Example flow:

1. Ask broad vocabulary questions.
2. Detect Cantonese-like answers.
3. Ask Cantonese-specific written-form and pronunciation questions.
4. Distinguish Hong Kong, Guangzhou, Macau, Taishan, overseas Cantonese, or mixed learner profile.

---

## Output

The result page should show:

- Best geographic guess
- Likely Chinese variety/topolect
- Confidence level
- Map visualization
- Top 3 alternative guesses
- Explanation of the strongest clues
- Option for user correction

### Map Visualization

The result should include a map that color-codes how strongly the user's answers match each region or speech community.

The map should not imply an exact birthplace. It should show relative match strength, using phrasing such as:

> Your answers are most similar to speech patterns associated with these areas.

Recommended map behavior:

- Highlight the best-matching region with the strongest color.
- Show secondary matches with lighter colors.
- Show low-confidence or ambiguous regions with neutral or muted colors.
- Allow the user to tap or hover a region to see:
  - Match score or confidence band
  - Likely variety/topolect
  - Strongest clues contributing to that region
  - Any ambiguity notes
- Show city markers only when the model has enough evidence for a city-level guess.
- Prefer regional clusters over precise points when confidence is limited.

Example color scale:

- Strong match: saturated red or orange
- Medium match: yellow or light orange
- Weak match: pale gray or pale blue
- No meaningful signal: uncolored/neutral

For the MVP, the map can start with broad regions and clusters:

- Hong Kong / Macau
- Guangdong
- Taiwan
- Sichuan / Chongqing
- Northeast China
- Beijing / Northern Mandarin area
- Shanghai / Wu area
- Fujian / Southern Min area

The map should be driven by the same normalized scores used for the result ranking. If the model is uncertain, the map should visibly show multiple moderate matches instead of forcing one strong location.

Example:

> Best guess: **Hong Kong**
>
> Likely variety: **Hong Kong Cantonese**
>
> Confidence: **High**
>
> Strongest clues:
>
> - You actively use 冇, 唔, 嘅, 咗, and 啲.
> - You selected 食飯 instead of 吃饭.
> - You chose 喺度做咩 as the natural casual sentence.
> - Your selected pronunciations match Cantonese readings.

---

## Feedback Loop

At the end, ask:

> Were we right?

Options:

- Yes
- Close, but not exact
- No

Then ask optionally:

- Where did you grow up?
- What Chinese variety do you speak at home?
- What Chinese variety did you learn in school?
- Which city/region best represents your speech?

This feedback becomes training data for future prediction.

The feature should clearly state that the user’s correction helps improve the model.

---

## Data Requirements

Each quiz item needs:

- Concept or character
- Prompt type
- Answer options
- Romanization/audio where relevant
- Associated regions
- Associated topolects
- Weight per region/topolect
- Source
- Confidence of the item
- Notes about ambiguity

Example schema:

```json
{
  "id": "eat_word_001",
  "type": "word_choice",
  "concept": "to eat / eat a meal",
  "prompt": "How would you naturally say 'to eat'?",
  "answers": [
    {
      "text": "吃饭",
      "features": {
        "Standard Mandarin": 3,
        "Mainland Mandarin": 2
      }
    },
    {
      "text": "食飯",
      "features": {
        "Cantonese": 4,
        "Yue": 4,
        "Hong Kong": 2,
        "Guangdong": 2
      }
    }
  ]
}
```

---

## Best Data Sources for Geo-Prediction

### 0. Huang et al. 2024 Dialectometric Analysis of LACD

**Best methodological reference for the map and hierarchy.**

Huang, Grieve, Jiao, and Cai (2024), “Geographic structure of Chinese dialects: a computational dialectometric approach,” is directly relevant because it applies large-scale dialectometry to the Linguistic Atlas of Chinese Dialects.

Key implications for hanzi.guide:

- Use fuzzy match strengths rather than hard dialect borders.
- Show core, marginal, weak, and transition-zone matches on the map.
- Treat Chinese dialect geography as hierarchical.
- Include broad regions such as North Mandarin, South Mandarin, Wu, Min, Yue/Hakka/Pinghua-related southern areas, and a Central transition region around Hunan/Hubei/Jiangxi.
- Be cautious about presenting Jin, Hui, and Pinghua as strong independent MVP categories unless the data supports them.

Best role for hanzi.guide:

> Methodological foundation for the map and scoring display, especially once we ingest LACD-style or sincomp-derived data.

Current implementation status:

- Uses the Zenodo supplementary `cn_tax.csv` as a static LACD atlas-point layer.
- Shows all 930 atlas localities on the result map.
- Uses the paper's MDS-derived RGB values for atlas-point colors.
- Uses the paper's 6/10-cluster FCM outputs as the geographic taxonomy layer.
- Still needs a proper question-to-LACD-variable mapping before it can become a truly local predictor.

Next precision step:

> Build quiz prompts from the 510 LACD variables, or map existing prompts to those variables, then score answers against all 930 localities using the paper's Weighted Jaccard logic.

### 1. Linguistic Atlas of Chinese Dialects / 汉语方言地图集

**Best overall source for true geo-prediction.**

The atlas is the most relevant source conceptually because it is explicitly geographic. It covers hundreds of survey sites and maps phonetic, lexical, and grammatical variation.

Use this if you want:

- Highest-quality geographic prediction
- Fine-grained location clues
- Lexical, phonological, and grammatical diagnostic items

Limitations:

- Not conveniently available as a clean open API.
- Licensing and digitization may be difficult.
- The survey style may reflect traditional/local speech rather than modern young urban speech.

Best role for hanzi.guide:

> Gold-standard target dataset, not necessarily the first MVP source.

---

### 2. Lexibank / CLDF Chinese Dialect Datasets

**Best open-data starting point.**

Relevant datasets include:

- `lexibank/beidasinitic`
- `lexibank/liusinitic`
- `SequenceComparison/houchinese`

These are useful because they are structured, reproducible, and easier to process than scanned books or maps.

Use this if you want:

- Prototype now
- Clean structured data
- Open-data pipeline
- Comparable lexical/phonological features

Limitations:

- Coarser geography than the Linguistic Atlas
- Fewer locations
- May require normalization across datasets

Best role for hanzi.guide:

> First real data source for an MVP.

---

### 3. Chinese Dialect Database / `digling/cddb`

**Best aggregator and infrastructure source.**

This is useful as a backend layer that aggregates and organizes Chinese dialect data, classifications, character readings, and lexical datasets.

Use this if you want:

- One normalized internal dialect-data layer
- Links between lexical forms, readings, classifications, and sources
- Infrastructure for combining several datasets

Limitations:

- More of an aggregation/infrastructure source than a finished geo-prediction quiz dataset
- Still requires curation and quiz-item design

Best role for hanzi.guide:

> Internal data normalization layer.

---

## Other Useful Supporting Sources

### WikiHan

Useful for comparative character readings across Sinitic varieties.

Good for:

- Character pronunciation comparison
- Educational pages
- “How is this character read across Chinese varieties?”

Less ideal for:

- Direct hometown prediction

---

### CC-Canto / CC-CEDICT

Useful for Cantonese-Mandarin dictionary data and Jyutping readings.

Good for:

- Cantonese/Mandarin distinction
- Cantonese quiz items
- hanzi.guide dictionary integration

Less ideal for:

- Fine-grained geo-prediction beyond broad Cantonese vs Mandarin

---

### Words.hk

Excellent modern Cantonese dictionary resource, especially for colloquial Cantonese.

Good for:

- Hong Kong Cantonese vocabulary
- Written Cantonese examples
- Colloquial Cantonese prompts

Important:

- Check content licensing carefully before using in hanzi.guide.

---

## MVP Scope

The first version should focus on:

- Cantonese vs Mandarin
- Hong Kong Cantonese vs Mainland Mandarin
- Taiwanese Mandarin vs Mainland Mandarin
- A small number of major regional Mandarin clues
- A small number of Min/Hokkien and Wu/Shanghainese distractors

Recommended MVP result categories:

- Hong Kong Cantonese
- Guangdong Cantonese
- Standard Mainland Mandarin
- Taiwanese Mandarin
- Sichuan/Chongqing Mandarin
- Northeastern Mandarin
- Shanghainese/Wu-influenced Chinese
- Hokkien/Min Nan-influenced Chinese
- Mixed / learner profile

---

## Recommended Implementation Path

### Stage 1: Cantonese/Mandarin MVP

Build a playful quiz focused on:

- Cantonese vs Mandarin
- Written Cantonese characters: 冇, 唔, 嘅, 咗, 啲, 佢, 乜, 咩
- Basic vocabulary differences
- Jyutping vs Pinyin pronunciation prompts

This is the fastest and most aligned with hanzi.guide.

---

### Stage 2: Add major regional clusters

Add broader regional categories:

- Taiwanese Mandarin
- Sichuan/Chongqing Mandarin
- Northeastern Mandarin
- Shanghainese/Wu
- Hokkien/Min Nan
- Hakka

Use CLDF/Lexibank-style data to create structured feature weights.

---

### Stage 3: Add user-confirmed geo-training data

After showing a prediction, ask users to confirm or correct it.

Collect:

- Predicted variety
- User-confirmed location
- Home variety
- School variety
- Confidence/self-rating
- Which questions felt wrong or ambiguous

This becomes hanzi.guide’s own geo-prediction dataset.

---

### Stage 4: Train a better model

Start with hand-weighted Bayesian scoring.

Later improve using:

- Naive Bayes
- Logistic regression
- Gradient-boosted trees
- Hierarchical classifier: family → region → city cluster
- Active learning to select the most informative next question

Keep the output explainable.

---

## Design Principles

The quiz should be playful but careful.

Avoid saying:

> You are from X.

Prefer:

> Your answers most closely match X.

Avoid treating Standard Mandarin as “normal Chinese” and all other varieties as deviations.

Use labels like:

- Chinese variety
- regional speech
- topolect
- Cantonese
- Mandarin region
- Sinitic variety

Support mixed identities, heritage speakers, learners, and people who moved between regions.

---

## Long-Term Goal

The long-term goal is to create a user-contributed, geographically tagged database of Chinese lexical, phonological, and written-form variation.

Over time, hanzi.guide can use this data to build:

- Dialect maps
- Character usage maps
- Pronunciation comparison pages
- Cantonese/Mandarin/Min/Wu/Hakka learning aids
- “How this word varies across Chinese” pages
- A robust geo-prediction model trained on real user responses

---

## Suggested Feature Names

- Where is your Chinese from?
- Hanzi.guide Dialect Compass
- Chinese Variety Map
- Chinese Speech Map
- Hanzi Geo Quiz
- Sinitic Variety Compass

---

## Practical Recommendation

For hanzi.guide, the best practical path is:

1. Start with open CLDF/Lexibank datasets for an MVP.
2. Use cddb or a similar internal structure to normalize dialect features.
3. Add Cantonese-specific sources such as CC-Canto and, if licensing allows, Words.hk.
4. Treat the Linguistic Atlas of Chinese Dialects as the gold-standard source for future expansion.
5. Collect anonymous user-confirmed corrections from day one.

The MVP is not too hard. A reliable fine-grained geo-predictor is hard, but becomes realistic once hanzi.guide starts collecting its own answer/location data.
