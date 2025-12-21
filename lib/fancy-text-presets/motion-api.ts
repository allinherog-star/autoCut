/**
 * Motion API for Fancy Text Preset Scripts
 * 
 * This module provides a sandboxed API for defining text animations.
 * Scripts use this API to describe animations, and the build system
 * compiles them into motion.plan.json.
 * 
 * @example
 * import { defineMotion } from "@fancy-text/motion-api";
 * 
 * export default defineMotion(({ timeline, text, effects, easing }) => {
 *   timeline.duration(1800);
 *   timeline.in(600, () => {
 *     text.fill.from("#fff").to("#ff3d00");
 *   });
 * });
 */

// --- Types ---

export type EasingType =
    | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
    | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
    | 'easeInBounce' | 'easeOutBounce'
    | 'easeInElastic' | 'easeOutElastic';

export interface Keyframe {
    time: number; // 0-1 normalized
    value: number | string;
    easing?: EasingType;
}

export interface PropertyAnimation {
    property: string;
    keyframes: Keyframe[];
}

export interface Section {
    startMs: number;
    durationMs: number;
    animations: PropertyAnimation[];
}

export interface Effect {
    type: 'glow' | 'particle' | 'sticker' | 'outline' | 'shadow';
    params: Record<string, unknown>;
    section?: 'in' | 'loop' | 'out' | 'always';
}

export interface MotionPlanOutput {
    dslVersion: number;
    durationMs: number;
    sections: {
        in?: Section;
        loop?: Section;
        out?: Section;
    };
    effects: Effect[];
}

// --- Internal State ---

class MotionBuilder {
    private _durationMs = 2000;
    private _sections: { in?: Section; loop?: Section; out?: Section } = {};
    private _effects: Effect[] = [];
    private _currentSection: 'in' | 'loop' | 'out' | null = null;
    private _currentAnimations: PropertyAnimation[] = [];

    // --- Timeline API ---

    duration(ms: number) {
        this._durationMs = ms;
    }

    in(durationMs: number, callback: () => void) {
        this._startSection('in', durationMs, callback);
    }

    loop(durationMs: number, callback: () => void) {
        this._startSection('loop', durationMs, callback);
    }

    out(durationMs: number, callback: () => void) {
        this._startSection('out', durationMs, callback);
    }

    private _startSection(name: 'in' | 'loop' | 'out', durationMs: number, callback: () => void) {
        this._currentSection = name;
        this._currentAnimations = [];
        callback();

        let startMs = 0;
        if (name === 'loop' && this._sections.in) {
            startMs = this._sections.in.durationMs;
        } else if (name === 'out') {
            startMs = this._durationMs - durationMs;
        }

        this._sections[name] = {
            startMs,
            durationMs,
            animations: [...this._currentAnimations],
        };
        this._currentSection = null;
    }

    // --- Text Property API ---

    createPropertyBuilder(property: string) {
        // Use arrow function to capture 'this' and get current animations dynamically
        const getAnimations = () => this._currentAnimations;

        const builder = {
            _fromValue: null as number | string | null,

            from(value: number | string) {
                this._fromValue = value;
                return this;
            },

            to(value: number | string, easing?: EasingType) {
                const keyframes: Keyframe[] = [];
                if (this._fromValue !== null) {
                    keyframes.push({ time: 0, value: this._fromValue });
                }
                keyframes.push({ time: 1, value, easing });
                getAnimations().push({ property, keyframes });
                // Reset fromValue for potential chaining
                this._fromValue = null;
                return this;
            },

            pulse(min: number, max: number, _cycleMs: number) {
                getAnimations().push({
                    property,
                    keyframes: [
                        { time: 0, value: min },
                        { time: 0.5, value: max, easing: 'easeInOut' },
                        { time: 1, value: min, easing: 'easeInOut' },
                    ],
                });
                return this;
            },
        };

        return builder;
    }

    // --- Effects API ---

    addEffect(type: Effect['type'], params: Record<string, unknown>) {
        this._effects.push({
            type,
            params,
            section: this._currentSection || 'always',
        });
    }

    // --- Build ---

    build(): MotionPlanOutput {
        return {
            dslVersion: 1,
            durationMs: this._durationMs,
            sections: this._sections,
            effects: this._effects,
        };
    }
}

// --- Easing Presets ---

export const easing = {
    linear: 'linear' as EasingType,
    easeIn: 'easeIn' as EasingType,
    easeOut: 'easeOut' as EasingType,
    easeInOut: 'easeInOut' as EasingType,
    inBack: 'easeInBack' as EasingType,
    outBack: 'easeOutBack' as EasingType,
    inOutBack: 'easeInOutBack' as EasingType,
    inBounce: 'easeInBounce' as EasingType,
    outBounce: 'easeOutBounce' as EasingType,
    inElastic: 'easeInElastic' as EasingType,
    outElastic: 'easeOutElastic' as EasingType,
};

// --- API Context ---

export interface MotionContext {
    timeline: {
        duration: (ms: number) => void;
        in: (durationMs: number, callback: () => void) => void;
        loop: (durationMs: number, callback: () => void) => void;
        out: (durationMs: number, callback: () => void) => void;
    };
    text: {
        fill: ReturnType<MotionBuilder['createPropertyBuilder']>;
        scale: ReturnType<MotionBuilder['createPropertyBuilder']>;
        opacity: ReturnType<MotionBuilder['createPropertyBuilder']>;
        blur: ReturnType<MotionBuilder['createPropertyBuilder']>;
        x: ReturnType<MotionBuilder['createPropertyBuilder']>;
        y: ReturnType<MotionBuilder['createPropertyBuilder']>;
        rotation: ReturnType<MotionBuilder['createPropertyBuilder']>;
    };
    effects: {
        glow: (params: { strength?: number; color?: string; blur?: number }) => void;
        particle: (params: { count?: number; color?: string; speed?: number }) => void;
        sticker: (params: { src: string; scale?: number }) => void;
        outline: (params: { color?: string; width?: number }) => void;
        shadow: (params: { color?: string; blur?: number; offsetX?: number; offsetY?: number }) => void;
    };
    easing: typeof easing;
}

// --- Main Entry Point ---

export type MotionDefinition = (context: MotionContext) => void;

export function defineMotion(definition: MotionDefinition): MotionPlanOutput {
    const builder = new MotionBuilder();

    const context: MotionContext = {
        timeline: {
            duration: (ms) => builder.duration(ms),
            in: (ms, cb) => builder.in(ms, cb),
            loop: (ms, cb) => builder.loop(ms, cb),
            out: (ms, cb) => builder.out(ms, cb),
        },
        text: {
            fill: builder.createPropertyBuilder('fill'),
            scale: builder.createPropertyBuilder('scale'),
            opacity: builder.createPropertyBuilder('opacity'),
            blur: builder.createPropertyBuilder('blur'),
            x: builder.createPropertyBuilder('x'),
            y: builder.createPropertyBuilder('y'),
            rotation: builder.createPropertyBuilder('rotation'),
        },
        effects: {
            glow: (params) => builder.addEffect('glow', params),
            particle: (params) => builder.addEffect('particle', params),
            sticker: (params) => builder.addEffect('sticker', params),
            outline: (params) => builder.addEffect('outline', params),
            shadow: (params) => builder.addEffect('shadow', params),
        },
        easing,
    };

    definition(context);
    return builder.build();
}

// Re-export for convenience
export default { defineMotion, easing };
