import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { FancyTextMetaSchema, MotionPlanSchema } from '../lib/fancy-text-presets/schemas';

const SOURCE_DIR = path.join(process.cwd(), 'assets/fancy-text-presets');
const DIST_DIR = path.join(process.cwd(), 'public/presets/fancy-text');

interface RegistryItem {
    id: string;
    category: string;
    name: string;
    level: string;
    tags: string[];
    thumbnail: string;
    path: string;
}

async function compileMotionScript(scriptPath: string): Promise<unknown> {
    // Use ts-node/register to execute TypeScript
    // The script should export a default function that returns the motion plan
    try {
        // Clear require cache to ensure fresh execution
        delete require.cache[require.resolve(scriptPath)];

        // Import the motion script
        const module = require(scriptPath);
        const result = module.default || module;

        // The script should return the motion plan directly (from defineMotion)
        return result;
    } catch (err: unknown) {
        const error = err as Error & { stack?: string };
        // Extract line number from stack trace if possible
        const stackMatch = error.stack?.match(/motion\.ts:(\d+):(\d+)/);
        if (stackMatch) {
            throw new Error(`Script error at line ${stackMatch[1]}: ${error.message}`);
        }
        throw error;
    }
}

async function buildPresets() {
    console.log('🏗️  Building Fancy Text Presets (Script Mode)...\n');

    if (!fs.existsSync(SOURCE_DIR)) {
        console.warn(`⚠️  Source directory ${SOURCE_DIR} does not exist. Skipping build.`);
        fs.mkdirSync(DIST_DIR, { recursive: true });
        fs.writeFileSync(path.join(DIST_DIR, 'index.json'), '[]');
        return;
    }

    // Ensure dist dir exists
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    const categories = fs.readdirSync(SOURCE_DIR).filter(item => {
        const itemPath = path.join(SOURCE_DIR, item);
        return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
    });

    const registry: RegistryItem[] = [];
    let errorCount = 0;
    let successCount = 0;

    for (const category of categories) {
        const categoryPath = path.join(SOURCE_DIR, category);
        const presets = fs.readdirSync(categoryPath).filter(item => {
            const itemPath = path.join(categoryPath, item);
            return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
        });

        for (const presetId of presets) {
            const presetPath = path.join(categoryPath, presetId);
            const distPresetPath = path.join(DIST_DIR, category, presetId);

            console.log(`📦 Processing ${category}/${presetId}...`);

            try {
                // 1. Read and Validate meta.json
                const metaPath = path.join(presetPath, 'meta.json');
                if (!fs.existsSync(metaPath)) {
                    throw new Error(`Missing meta.json`);
                }
                const metaRaw = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                const meta = FancyTextMetaSchema.parse(metaRaw);

                if (meta.id !== presetId) {
                    throw new Error(`ID mismatch: meta.json says '${meta.id}', folder says '${presetId}'`);
                }

                // 2. Prepare Dist Directory
                if (!fs.existsSync(distPresetPath)) {
                    fs.mkdirSync(distPresetPath, { recursive: true });
                }

                // 3. Copy meta.json
                fs.copyFileSync(metaPath, path.join(distPresetPath, 'meta.json'));

                // 4. Handle Animation Logic (Script vs Canvas)
                if (meta.compat?.renderer === 'canvas-fancy-text') {
                    const scenePath = path.join(presetPath, 'scene.ts');
                    if (fs.existsSync(scenePath)) {
                         console.log(`   ✅ Canvas scene detected (scene.ts)`);
                         // We don't compile scene.ts here as it's imported at build time by the app.
                         // But we could verify it exports the right symbols if we wanted to be strict.
                    } else {
                        console.warn(`   ⚠️  Canvas template missing scene.ts`);
                    }
                } else {
                    // Compile motion.ts → motion.plan.json
                    const motionScriptPath = path.join(presetPath, 'motion.ts');
                    if (fs.existsSync(motionScriptPath)) {
                        console.log(`   ⚙️  Compiling motion.ts...`);
                        const motionPlan = await compileMotionScript(motionScriptPath);

                        // Validate the compiled plan
                        const validatedPlan = MotionPlanSchema.parse(motionPlan);

                        // Write motion.plan.json
                        fs.writeFileSync(
                            path.join(distPresetPath, 'motion.plan.json'),
                            JSON.stringify(validatedPlan, null, 2)
                        );
                        console.log(`   ✅ motion.plan.json generated`);
                    } else if (meta.level === 'advanced') {
                        console.warn(`   ⚠️  Advanced template missing motion.ts`);
                    }
                }

                // 5. Copy SFX files
                const sfxExtensions = ['.mp3', '.ogg', '.wav', '.m4a'];
                const files = fs.readdirSync(presetPath);
                for (const file of files) {
                    const ext = path.extname(file).toLowerCase();
                    if (sfxExtensions.includes(ext)) {
                        fs.copyFileSync(
                            path.join(presetPath, file),
                            path.join(distPresetPath, file)
                        );
                        console.log(`   🔊 Copied ${file}`);
                    }
                }

                // 6. Copy thumbnail if exists
                const thumbnailPath = path.join(presetPath, 'thumbnail.png');
                if (fs.existsSync(thumbnailPath)) {
                    fs.copyFileSync(thumbnailPath, path.join(distPresetPath, 'thumbnail.png'));
                }

                // 7. Add to Registry
                registry.push({
                    id: meta.id,
                    category,
                    name: meta.name,
                    level: meta.level || 'simple',
                    tags: meta.tags || [],
                    thumbnail: `/presets/fancy-text/${category}/${presetId}/thumbnail.png`,
                    path: `/presets/fancy-text/${category}/${presetId}`,
                });

                successCount++;

            } catch (err: unknown) {
                const error = err as Error;
                console.error(`   ❌ Error: ${error.message}`);
                if (err instanceof z.ZodError) {
                    console.error('   ', JSON.stringify(err.format(), null, 2).split('\n').join('\n   '));
                }
                errorCount++;
            }
        }
    }

    // Write Index
    fs.writeFileSync(path.join(DIST_DIR, 'index.json'), JSON.stringify(registry, null, 2));

    console.log('\n-----------------------------------');
    console.log(`📊 Results: ${successCount} success, ${errorCount} failed`);

    if (errorCount > 0) {
        console.error(`\n❌ Build failed with ${errorCount} errors.`);
        process.exit(1);
    } else {
        console.log(`\n✅ Build success! Registered ${registry.length} presets.`);
    }
}

buildPresets();
