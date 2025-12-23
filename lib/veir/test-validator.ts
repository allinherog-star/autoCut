/**
 * VEIR Schema 验证测试脚本
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_DIR = path.join(__dirname, 'schemas');

// 加载 Schema
function loadSchema(filename: string): Record<string, unknown> {
    const content = fs.readFileSync(path.join(SCHEMA_DIR, filename), 'utf-8');
    return JSON.parse(content);
}

async function main() {
    console.log('🚀 VEIR v1.0 Schema 验证测试\n');

    // 创建验证器
    const ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: false,
    });
    addFormats(ajv);

    // 加载并注册所有 Schema
    const schemas = [
        'meta.schema.json',
        'assets.schema.json',
        'vocabulary.schema.json',
        'timeline.schema.json',
        'annotations.schema.json',
        'adjustments.schema.json',
        'veir.schema.json',
    ];

    console.log('📋 加载 Schema 文件...');
    schemas.forEach((schemaFile) => {
        try {
            const schema = loadSchema(schemaFile);
            ajv.addSchema(schema);
            console.log(`  ✅ ${schemaFile}`);
        } catch (e) {
            console.log(`  ❌ ${schemaFile}: ${(e as Error).message}`);
        }
    });
    console.log('');

    // 加载并验证示例项目 + 测试项目
    console.log('📂 加载并验证项目...');
    const validate = ajv.getSchema('veir.schema.json');
    if (!validate) {
        console.log('  ❌ 无法获取 veir.schema.json');
        process.exit(1);
    }

    const projectFiles: string[] = [];
    projectFiles.push(path.join(__dirname, 'example-project.json'));

    const testProjectsDir = path.join(__dirname, 'test-projects');
    if (fs.existsSync(testProjectsDir)) {
        const entries = fs.readdirSync(testProjectsDir);
        for (const f of entries) {
            if (f.endsWith('.json')) {
                projectFiles.push(path.join(testProjectsDir, f));
            }
        }
    }

    let passCount = 0;
    let failCount = 0;

    for (const filePath of projectFiles) {
        const name = path.relative(__dirname, filePath);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            const ok = validate(data);
            if (ok) {
                console.log(`  ✅ ${name}`);
                passCount += 1;
            } else {
                console.log(`  ❌ ${name}`);
                validate.errors?.forEach((err, i) => {
                    console.log(`     ${i + 1}. ${err.instancePath || '/'}: ${err.message}`);
                });
                failCount += 1;
            }
        } catch (e) {
            console.log(`  ❌ ${name}: ${(e as Error).message}`);
            failCount += 1;
        }
    }

    console.log('');
    console.log(`📊 验证统计：通过 ${passCount} / 失败 ${failCount}\n`);

    // 测试错误检测
    console.log('\n--- 测试错误检测 ---\n');

    const invalidProject = {
        meta: {
            resolution: [1920], // 错误：必须是 2 元素数组
            fps: 0, // 错误：必须 >= 1
            duration: -5, // 错误：必须 >= 0
            colorSpace: 'invalid' // 错误：不在枚举中
        },
        assets: { assets: {} },
        vocabulary: {
            expressions: {},
            presets: {},
            filters: {}
        },
        timeline: { tracks: [] }
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

    console.log('\n🎉 VEIR Schema 验证脚本执行完成！');
}

main().catch(console.error);
