# Controlled advertising

HanziGuide uses explicit placements, with at most two visible ads per page. Auto ads remain disabled. The current revenue/usability experiment is:

- Practice, mobile/tablet (up to 900 px): a compact banner after the introduction and before the workspace, plus one after the entire workspace, including settings and pronunciation controls.
- Practice, desktop (over 900 px): the same introductory banner, plus a non-sticky 250×250 square below the sidebar settings. The lower mobile banner is hidden and is not requested.
- Long tutorials (English basics and all three stroke-order tutorials) and the HSK list: a banner after opening content, plus the standard end-of-content banner.
- Short character/radical reference pages, the short radicals tutorial, and idioms: one banner after page content, before the footer.
- Quiz: inside the results section, after the results and actions. No ad request is made while questions are being answered.
- Legal, PDF, stroke-matching, and error/redirect pages: no ads.

Horizontal banners reserve 100 px of creative height on mobile and 90 px at viewport widths of 800 px and above, with a maximum creative width of 728 px. The desktop sidebar square reserves 250×250 px. Separate localized advertisement labels and margins keep ads apart from controls. The loader requests an ad only when it is within 200 px of the viewport, and never refreshes it automatically. There are no ads between practice controls, sticky mobile ads, or full-screen interruptions.

The horizontal unit is **Hanzi Guide Unit Horizontal**, slot `7163092498`; the desktop sidebar uses **Hanzi Guide Unit Square**, slot `9573633413`. Both use publisher `ca-pub-3884633005784550`. The supplied `data-ad-format="auto"` and full-width expansion settings are replaced with the site's explicit dimensions.

## Activate manual ads

The site code cannot change AdSense account settings. Complete these steps before deploying with a manual slot ID:

1. In **AdSense → Ads → By site → edit HanziGuide**, turn **Auto ads off** and apply the change to the site. This prevents extra automatic in-page, anchor, vignette, side-rail, multiplex, and ad-intent placements after the Google library loads. Allow time for the account change to propagate and verify the live pages.
2. In **Ads → Global settings**, turn off **Let Google optimize the size of your mobile ads** if enabled. Keep the compact dimensions specified by the site.
3. The responsive Display units are already configured in `_config.yml` as `adsense_slot: "7163092498"` and `adsense_square_slot: "9573633413"`.
4. In the GitHub repository's **Settings → Secrets and variables → Actions**, retain the existing `ADSENSE_CLIENT_ID` secret and ensure it is `ca-pub-3884633005784550`. No slot variable is required. An optional **repository variable** `ADSENSE_SLOT_ID` overrides the configured slot; remove any stale value to use the horizontal unit. These IDs are public in rendered HTML.
5. Deploy through the existing GitHub Pages workflow. No new hosting service is required.
6. Verify the three practice languages, a character/reference page, a tutorial, and quiz questions/results on a narrow phone and desktop. Confirm there are no automatic overlays, no ads inside controls, and at most two visible placements per page (one on quiz results and short reference pages). Verify the current consent flow still controls advertising as intended.

**Without a publisher ID or with an empty slot, the new build renders no ad units or empty ad space and does not load the Google advertising library.** Local builds remain ad-free by default because the publisher ID is injected only by deployment. Existing live pages retain their previous behavior until a new build is deployed or AdSense settings change.

## Implementation

- `_includes/ad-unit.html` renders the guarded, localized unit. Optional `shape`, `slot`, and `variant` parameters support the desktop sidebar square and device-specific placements.
- `_includes/head.html` includes Google's supported inline sizing pattern and the deferred local loader only when configured and permitted.
- `assets/js/ads.js` waits for a visible, sufficiently wide placement before adding the `adsbygoogle` class and pushing one ad request. Delayed registration prevents hidden desktop/mobile alternatives from consuming another placement's request. A script load error (including browser blocking) collapses the entire placement, including its label and margins. Google's `data-ad-status="unfilled"` also collapses the placement. Filled ads and `unfill-optimized` placements are left alone. There is no timeout that could hide a slow or consent-delayed ad. Browsers without IntersectionObserver show no ads or reserved space.
- `_includes/practice.html` and `_includes/geo-quiz.html` own their specific placements. Their page front matter sets `ad_placement: practice` or `ad_placement: quiz-results` to suppress the general footer placement.
- `_includes/footer.html` provides the end-of-content placement on other pages. Long tutorial sources and the HSK page generator explicitly insert the additional earlier placement.
- `adsense: false` in front matter opts a page out of both the initializer and unit markup.
- `_sass/_ads.scss` handles spacing, labels, and print exclusion. Do not clip rendered ads or manipulate Google's injected overlays.

For a local build with test IDs, create a config file outside the repository and pass it after `_config.yml` with Jekyll's `--config` option. Inspect the generated markup without loading live Google ads. Do not click your own ads during checks.

The loader does not grant consent or replace the site's configured consent management. Retain the existing AdSense consent configuration.

## Measure the compromise

Record a baseline before changing settings, then review the first three complete days after this experiment is deployed, segmented by device and page type. Use a longer comparable period before drawing firm conclusions. Compare equivalent hours and account for traffic-source and weekday differences:

- AdSense revenue per 1,000 sessions and total revenue.
- Ad impressions, page views, coverage, and page RPM, to distinguish lost visibility from unfilled inventory.
- Engagement with the practice controls, quiz completion, and returning visitors where tracking exists.
- Mobile layout stability and whether advertising delays interaction.

The first single-banner setup reduced ad count, visibility, and size simultaneously. This experiment restores visibility and a second placement without reintroducing overlays. It makes no promise of recovering the previous €3/day; use the reports to decide the next change.

## References

- [Auto ads settings](https://support.google.com/adsense/answer/9305577?hl=en)
- [Supported responsive ad code modifications](https://support.google.com/adsense/answer/9183363?hl=en)
- [Google's unfilled ad status handling](https://support.google.com/adsense/answer/10762946?hl=en)
