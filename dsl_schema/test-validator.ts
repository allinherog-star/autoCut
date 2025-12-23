/**
 * DSL Schema 验证测试脚本
 * 用于测试 JSON Schema 验证功能
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_DIR = __dirname;

// 加载 Schema 文件
function loadSchema(filename: string): Record<string, unknown> {
    const content = fs.readFileSync(path.join(SCHEMA_DIR, filename), 'utf-8');
    return JSON.parse(content);
}

async function main() {
    // 加载所有 Schema
    const metaSchema = loadSchema('meta.schema.json');
    const assetsSchema = loadSchema('assets.schema.json');
    const expressionsSchema = loadSchema('expressions.schema.json');
    const presetsSchema = loadSchema('presets.schema.json');
    const timelineSchema = loadSchema('timeline.schema.json');
    const indexSchema = loadSchema('index.schema.json');

    // 创建验证器 - 使用 draft-07
    const ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: false,
    });
    addFormats(ajv);

    // 注册所有 Schema（使用 $id）
    ajv.addSchema(metaSchema);
    ajv.addSchema(assetsSchema);
    ajv.addSchema(expressionsSchema);
    ajv.addSchema(presetsSchema);
    ajv.addSchema(timelineSchema);
    ajv.addSchema(indexSchema);

    console.log('✅ 所有 Schema 已成功加载并注册\n');

    // 加载示例项目
    const exampleProject = loadSchema('example-project.json');

    // 验证完整项目
    const validate = ajv.getSchema('index.schema.json');
    if (!validate) {
        console.error('❌ 无法获取 index schema');
        process.exit(1);
    }

    const valid = validate(exampleProject);

    if (valid) {
        console.log('✅ 示例项目验证通过！\n');
        const meta = exampleProject.meta as Record<string, unknown>;
        const assets = exampleProject.assets as { assets: Record<string, unknown> };
        const timeline = exampleProject.timeline as { tracks: unknown[] };

        console.log('📋 项目信息：');
        console.log(`   - 项目 ID: ${meta.projectId}`);
        console.log(`   - 版本: ${meta.version}`);
        console.log(`   - 分辨率: ${(meta.resolution as number[]).join('x')}`);
        console.log(`   - 帧率: ${meta.fps} fps`);
        console.log(`   - 时长: ${meta.duration} 秒`);
        console.log(`   - 素材数量: ${Object.keys(assets.assets).length}`);
        console.log(`   - 轨道数量: ${timeline.tracks.length}`);
    } else {
        console.log('❌ 示例项目验证失败！\n');
        console.log('错误详情：');
        validate.errors?.forEach((err, i) => {
            console.log(`  ${i + 1}. 路径: ${err.instancePath || '/'}`);
            console.log(`     消息: ${err.message}`);
            console.log(`     关键字: ${err.keyword}`);
        });
    }

    // 测试错误检测
    console.log('\n--- 测试错误检测 ---\n');

    const invalidProject = {
        meta: {
            projectId: 'test',
            version: '1.0.0',
            fps: 0, // 错误：fps 必须 >= 1
            resolution: [1920], // 错误：必须是 2 元素数组
            duration: -5, // 错误：必须 >= 0
        },
        assets: {
            assets: {},
        },
        timeline: {
            tracks: [],
        },
    };

    const valid2 = validate(invalidProject);

    if (!valid2) {
        console.log('✅ 成功检测到无效项目中的错误：\n');
        validate.errors?.forEach((err, i) => {
            console.log(`  ${i + 1}. ${err.instancePath}: ${err.message}`);
        });
    } else {
        console.log('❌ 未能检测到无效项目中的错误');
    }

    console.log('\n🎉 DSL Schema 验证系统工作正常！');
}

main().catch(console.error);
