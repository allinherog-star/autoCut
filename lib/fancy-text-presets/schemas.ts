import { z } from 'zod';

// --- Meta Schema (Updated for Script Mode) ---

export const FancyTextMetaSchema = z.object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ID must be kebab-case"),
    name: z.string().min(1),
    description: z.string().optional(),
    level: z.enum(['simple', 'advanced']).default('simple'),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    language: z.enum(['zh', 'en']).optional(),

    textDefaults: z.object({
        text: z.string().optional(),
        fontSizeRange: z.tuple([z.number(), z.number()]).optional(),
        recommendLines: z.number().optional(),
        fontFamily: z.array(z.string()).optional(),
        stroke: z.object({
            enabled: z.boolean().optional(),
            color: z.string().optional(),
            width: z.number().optional(),
        }).optional(),
        shadow: z.object({
            enabled: z.boolean().optional(),
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
        }).optional(),
    }).optional(),

    assets: z.object({
        sfx: z.object({
            file: z.string(),
            cues: z.array(z.enum(['in', 'hit', 'loop', 'out'])).optional(),
        }).optional(),
    }).optional(),

    compat: z.object({
        renderer: z.enum(['fancy-text', 'canvas-fancy-text']).default('fancy-text'),
        minAppVersion: z.string().optional(),
        motionType: z.enum(['script', 'none']).default('script'),
        scriptApiVersion: z.number().default(1),
    }).optional(),
});

export type FancyTextMeta = z.infer<typeof FancyTextMetaSchema>;

// --- Motion Plan Schema (Compiled output from motion.ts) ---

const KeyframeSchema = z.object({
    time: z.number().min(0).max(1), // Normalized 0-1
    value: z.union([z.number(), z.string()]),
    easing: z.string().optional(),
});

const PropertyAnimationSchema = z.object({
    property: z.string(), // e.g., 'fill', 'scale', 'opacity', 'blur'
    keyframes: z.array(KeyframeSchema),
});

const SectionSchema = z.object({
    startMs: z.number(),
    durationMs: z.number(),
    animations: z.array(PropertyAnimationSchema),
});

const EffectSchema = z.object({
    type: z.enum(['glow', 'particle', 'sticker', 'outline', 'shadow']),
    params: z.record(z.string(), z.any()),
    section: z.enum(['in', 'loop', 'out', 'always']).optional(),
});

export const MotionPlanSchema = z.object({
    dslVersion: z.number().default(1),
    durationMs: z.number(),
    sections: z.object({
        in: SectionSchema.optional(),
        loop: SectionSchema.optional(),
        out: SectionSchema.optional(),
    }),
    effects: z.array(EffectSchema).optional(),
});

export type MotionPlan = z.infer<typeof MotionPlanSchema>;

// --- Combined Preset Schema ---

export const FancyTextPresetSchema = z.object({
    meta: FancyTextMetaSchema,
    motionPlan: MotionPlanSchema.optional(),
});

export type FancyTextPreset = z.infer<typeof FancyTextPresetSchema>;
