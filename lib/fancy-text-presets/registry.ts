import { FancyTextPresetSchema, FancyTextPreset, MotionPlan } from './schemas';

const PRESETS_ROOT = '/presets/fancy-text';

export interface PresetRegistryItem {
    id: string;
    category: string;
    name: string;
    level: string;
    thumbnail?: string;
    tags: string[];
    path: string;
}

let registryCache: PresetRegistryItem[] | null = null;

/**
 * Loads the list of available presets from index.json.
 */
export async function loadPresets(forceRefresh = false): Promise<PresetRegistryItem[]> {
    if (registryCache && !forceRefresh) {
        return registryCache;
    }

    try {
        const res = await fetch(`${PRESETS_ROOT}/index.json`);
        if (!res.ok) {
            console.warn('Failed to load fancy text presets index');
            return [];
        }
        const data = await res.json();
        registryCache = data;
        return data;
    } catch (error) {
        console.error('Error loading fancy text presets:', error);
        return [];
    }
}

/**
 * Fetches full preset data (meta + motionPlan).
 */
export async function getPreset(item: PresetRegistryItem): Promise<FancyTextPreset | null> {
    try {
        // Load meta.json
        const metaRes = await fetch(`${item.path}/meta.json`);
        if (!metaRes.ok) throw new Error(`Failed to load meta.json for ${item.id}`);
        const meta = await metaRes.json();

        // Load motion.plan.json (optional)
        let motionPlan: MotionPlan | undefined;
        try {
            const planRes = await fetch(`${item.path}/motion.plan.json`);
            if (planRes.ok) {
                motionPlan = await planRes.json();
            } else {
                // Fallback: if motion.plan.json is missing, use simple mode
                console.debug(`No motion.plan.json for ${item.id}, using simple mode.`);
            }
        } catch {
            // Ignore motion plan load error
        }

        return { meta, motionPlan };
    } catch (error) {
        console.error(`Error loading preset ${item.id}:`, error);
        return null;
    }
}

/**
 * Get preset by ID directly.
 */
export async function getPresetById(id: string): Promise<FancyTextPreset | null> {
    const presets = await loadPresets();
    const item = presets.find(p => p.id === id);
    if (!item) return null;
    return getPreset(item);
}
