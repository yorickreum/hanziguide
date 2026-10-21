# Controlled advertising

HanziGuide uses one explicitly placed display banner per eligible page. The same placement policy applies on mobile and desktop:

- Practice: after the entire workspace, including character settings and pronunciation controls.
- Reference pages, tutorials, and idioms: after page content, before the footer.
- Quiz: inside the results section, after the results and actions. No ad request is made while questions are being answered.
- Legal, PDF, stroke-matching, and error/redirect pages: no ads.

The banner reserves 100 px of creative height on mobile and 90 px at viewport widths of 800 px and above, with a maximum creative width of 728 px. A separate localized advertisement label and margins keep it apart from controls. The loader requests a banner only when it is within 200 px of the viewport, and never refreshes it automatically. No second placement is included initially; measure this baseline before adding more inventory.

The configured unit is **Hanzi Guide Unit Horizontal**, slot `7163092498`, for publisher `ca-pub-3884633005784550`. The supplied square unit (`9573633413`) is intentionally unused to keep mobile banners compact. The supplied `data-ad-format="auto"` and full-width expansion settings are replaced with the site's explicit dimensions.

## Activate manual ads

The site code cannot change AdSense account settings. Complete these steps before deploying with a manual slot ID:

1. In **AdSense → Ads → By site → edit HanziGuide**, turn **Auto ads off** and apply the change to the site. This prevents extra automatic in-page, anchor, vignette, side-rail, multiplex, and ad-intent placements after the Google library loads. Allow time for the account change to propagate and verify the live pages.
2. In **Ads → Global settings**, turn off **Let Google optimize the size of your mobile ads** if enabled. Keep the compact dimensions specified by the site.
3. The responsive Display unit is already configured in `_config.yml` as `adsense_slot: "7163092498"`. One unit serves all explicit placements initially.
4. In the GitHub repository's **Settings → Secrets and variables → Actions**, retain the existing `ADSENSE_CLIENT_ID` secret and ensure it is `ca-pub-3884633005784550`. No slot variable is required. An optional **repository variable** `ADSENSE_SLOT_ID` overrides the configured slot; remove any stale value to use the horizontal unit. These IDs are public in rendered HTML.
5. Deploy through the existing GitHub Pages workflow. No new hosting service is required.
6. Verify the three practice languages, a character/reference page, a tutorial, and quiz questions/results on a narrow phone and desktop. Confirm there are no automatic overlays, no ads inside controls, and at most one banner per page. Verify the current consent flow still controls advertising as intended.

**Without a publisher ID or with an empty slot, the new build renders no ad units or empty ad space and does not load the Google advertising library.** Local builds remain ad-free by default because the publisher ID is injected only by deployment. Existing live pages retain their previous behavior until a new build is deployed or AdSense settings change.

## Implementation

- `_includes/ad-unit.html` renders the guarded, localized unit.
- `_includes/head.html` includes Google's supported inline sizing pattern and the deferred local loader only when configured and permitted.
- `assets/js/ads.js` waits for a visible, sufficiently wide placement before requesting Google's library and pushing one ad request. Browsers without IntersectionObserver simply show no ads.
- `_includes/practice.html` and `_includes/geo-quiz.html` own their specific placements. Their page front matter sets `ad_placement: practice` or `ad_placement: quiz-results` to suppress the general footer placement.
- `_includes/footer.html` provides the single default placement on other pages.
- `adsense: false` in front matter opts a page out of both the initializer and unit markup.
- `_sass/_ads.scss` handles spacing, labels, and print exclusion. Do not clip rendered ads or manipulate Google's injected overlays.

For a local build with test IDs, create a config file outside the repository and pass it after `_config.yml` with Jekyll's `--config` option. Inspect the generated markup without loading live Google ads. Do not click your own ads during checks.

The loader does not grant consent or replace the site's configured consent management. Retain the existing AdSense consent configuration.

## Measure the compromise

Record a baseline before changing settings, then compare 2–4 weeks after deployment, segmented by device and page type. Account for traffic-source and weekday differences:

- AdSense revenue per 1,000 sessions and total revenue.
- Engagement with the practice controls, quiz completion, and returning visitors where tracking exists.
- Mobile layout stability and whether advertising delays interaction.

Fewer placements may reduce revenue. If the reduction is unacceptable, test a second well-spaced placement on long reference/tutorial pages before adding ads to the practice workspace or reintroducing overlays. The starting setup makes no claim of optimal revenue without those measurements.

## References

- [Auto ads settings](https://support.google.com/adsense/answer/9305577?hl=en)
- [Supported responsive ad code modifications](https://support.google.com/adsense/answer/9183363?hl=en)
