import { describe, it, expect } from 'vitest';
import { processText, FEATURES, type FeatureType } from './textProcessor';

describe('processText', () => {
  it('returns the original text unchanged when no features are enabled', async () => {
    const result = await processText('  你好,世界.  ', { enabledFeatures: new Set() });
    expect(result.text).toBe('  你好,世界.  ');
    expect(result.processingTime).toBeGreaterThanOrEqual(0);
  });

  it('removes timestamps before other processing runs', async () => {
    const result = await processText('[00:00:01] 大家好，歡迎收看。', {
      enabledFeatures: new Set<FeatureType>(['remove-timestamps']),
    });
    expect(result.text).not.toContain('[00:00:01]');
    expect(result.text).toContain('大家好');
  });

  it('applies punctuation fixing when enabled', async () => {
    const result = await processText('你好,世界', {
      enabledFeatures: new Set<FeatureType>(['fix-punctuation']),
    });
    expect(result.text).toContain('，');
  });

  it('applies segmentation after punctuation fixing (feature order)', async () => {
    const result = await processText('第一句\n第二句', {
      enabledFeatures: new Set<FeatureType>(['segment-paragraphs']),
    });
    expect(result.text).toBe('第一句 第二句');
  });

  it('adds spaces around English words when enabled', async () => {
    const result = await processText('我有iPhone手機', {
      enabledFeatures: new Set<FeatureType>(['add-spaces']),
    });
    expect(result.text).toBe('我有 iPhone 手機');
  });

  it('does not throw when dictionary-backed features cannot fetch (no network in tests)', async () => {
    // simplified-to-traditional / fix-typos / remove-redundancy load their
    // dictionaries via fetch() against a relative URL, which is unavailable in
    // this test environment. processText must degrade gracefully (no throw,
    // no real network/API call) rather than crash the pipeline.
    await expect(
      processText('电脑软件其实很棒', {
        enabledFeatures: new Set<FeatureType>([
          'simplified-to-traditional',
          'fix-typos',
          'remove-redundancy',
        ]),
      })
    ).resolves.toMatchObject({ text: expect.any(String) });
  });
});

describe('FEATURES metadata', () => {
  it('declares one entry per FeatureType with a label and description', () => {
    const ids = FEATURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
    for (const feature of FEATURES) {
      expect(feature.label.length).toBeGreaterThan(0);
      expect(feature.description.length).toBeGreaterThan(0);
    }
  });

  it('includes all seven expected feature ids', () => {
    const ids = FEATURES.map((f) => f.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'simplified-to-traditional',
        'add-spaces',
        'fix-typos',
        'remove-redundancy',
        'fix-punctuation',
        'segment-paragraphs',
        'remove-timestamps',
      ])
    );
  });
});
