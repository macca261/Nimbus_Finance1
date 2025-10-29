export const ENTITLEMENTS = {
  free:     { upload: { maxRows: 10_000,  maxSizeMB: 5 },   banks: 0, chat: 'none', retentionHours: 24 },
  proLite:  { upload: { maxRows: 50_000,  maxSizeMB: 20 },  banks: 1, chat: 'mini', retentionHours: 8760 },
  proPlus:  { upload: { maxRows: 200_000, maxSizeMB: 100 }, banks: 3, chat: 'full', retentionHours: 8760 }
} as const;

export type Tier = keyof typeof ENTITLEMENTS;


