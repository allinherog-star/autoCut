import { FancyTextPreset, MotionPlan } from './schemas';
import { FancyTextTemplate, FancyTextGlobalParams, EntranceAnimation, LoopAnimation, ExitAnimation, ColorPreset } from '../fancy-text/types';

/**
 * Converts a Fancy Text Preset (meta + motionPlan) into a FancyTextTemplate
 * that the existing renderer can consume.
 */
export function convertPresetToTemplate(preset: FancyTextPreset): FancyTextTemplate {
    const { meta, motionPlan } = preset;

    // Base global params from meta defaults
    const globalParams: FancyTextGlobalParams = {
        text: meta.textDefaults?.text || 'Preview',
        fontFamily: meta.textDefaults?.fontFamily?.[0] || 'PingFang SC',
        fontSize: meta.textDefaults?.fontSizeRange?.[1] || 60,
        fontWeight: 700,
        letterSpacing: 2,
        lineHeight: 1.2,
        color: { type: 'solid', value: '#ffffff' },
        stroke: {
            enabled: meta.textDefaults?.stroke?.enabled ?? false,
            color: meta.textDefaults?.stroke?.color || '#000000',
            width: meta.textDefaults?.stroke?.width || 2,
        },
        shadow: {
            enabled: meta.textDefaults?.shadow?.enabled ?? false,
            color: meta.textDefaults?.shadow?.color || 'rgba(0,0,0,0.5)',
            blur: meta.textDefaults?.shadow?.blur || 10,
            offsetX: meta.textDefaults?.shadow?.offsetX || 0,
            offsetY: meta.textDefaults?.shadow?.offsetY || 4,
        },
        glow: { enabled: false, color: '#ffff00', blur: 10, spread: 0 },
        rotation: 0,
        skewX: 0,
        skewY: 0,
        animation: {
            entrance: 'scale-bounce' as EntranceAnimation,
            entranceDuration: 0.6,
            entranceEasing: 'ease-out',
            entranceDelay: 0,
            loop: 'pulse' as LoopAnimation,
            loopDuration: 0.8,
            loopDelay: 0,
            exit: 'fade' as ExitAnimation,
            exitDuration: 0.4,
            exitEasing: 'ease-in',
        },
        decorations: [],
        totalDuration: 1.8,
    };

    // Apply motion plan data if available
    if (motionPlan) {
        globalParams.totalDuration = motionPlan.durationMs / 1000;

        // Map sections to animation config
        if (motionPlan.sections.in) {
            globalParams.animation.entranceDuration = motionPlan.sections.in.durationMs / 1000;
        }
        if (motionPlan.sections.loop) {
            globalParams.animation.loopDuration = motionPlan.sections.loop.durationMs / 1000;
        }
        if (motionPlan.sections.out) {
            globalParams.animation.exitDuration = motionPlan.sections.out.durationMs / 1000;
        }

        // Map effects to glow/decorations
        const glowEffect = motionPlan.effects?.find(e => e.type === 'glow');
        if (glowEffect) {
            globalParams.glow = {
                enabled: true,
                color: (glowEffect.params.color as string) || '#ff6600',
                blur: (glowEffect.params.blur as number) || 20,
                spread: 0,
            };
        }
    }

    // Determine renderer type
    const rendererType = meta.compat?.renderer;
    let renderer: 'css' | 'canvas' | 'react' = 'css';
    if (rendererType === 'canvas-fancy-text') {
        renderer = 'canvas';
    } else if (rendererType === 'react-component') {
        renderer = 'react';
    }

    return {
        id: meta.id,
        name: meta.name,
        description: meta.description || '',
        visualStyles: meta.tags,
        source: 'system',
        renderer,
        canvasPresetId: rendererType === 'canvas-fancy-text' ? meta.id : undefined,
        componentPath: meta.compat?.componentPath,
        colorPresets: (meta as unknown as { colorPresets?: ColorPreset[] }).colorPresets,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        globalParams,
        perCharacter: {
            enabled: false,
            characters: [],
        },
    };
}

/**
 * Parse motion plan for more detailed animation control.
 * This can be used by advanced renderers.
 */
export function parseMotionPlan(plan: MotionPlan) {
    return {
        durationMs: plan.durationMs,
        sections: plan.sections,
        effects: plan.effects || [],

        getAnimationsForTime(timeMs: number) {
            const results: { section: string; animations: typeof plan.sections.in }[] = [];

            for (const [name, section] of Object.entries(plan.sections)) {
                if (!section) continue;
                if (timeMs >= section.startMs && timeMs < section.startMs + section.durationMs) {
                    results.push({ section: name, animations: section });
                }
            }

            return results;
        },
    };
}
