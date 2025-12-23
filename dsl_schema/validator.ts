/**
 * DSL Schema 验证器
 * 用于验证多模态智能剪辑 DSL 项目文件
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';

// Schema 文件路径
const SCHEMA_DIR = __dirname;

// 加载所有 Schema 文件
const indexSchema = JSON.parse(
    fs.readFileSync(path.join(SCHEMA_DIR, 'index.schema.json'), 'utf-8')
);
const metaSchema = JSON.parse(
    fs.readFileSync(path.join(SCHEMA_DIR, 'meta.schema.json'), 'utf-8')
);
const assetsSchema = JSON.parse(
    fs.readFileSync(path.join(SCHEMA_DIR, 'assets.schema.json'), 'utf-8')
);
const expressionsSchema = JSON.parse(
    fs.readFileSync(path.join(SCHEMA_DIR, 'expressions.schema.json'), 'utf-8')
);
const presetsSchema = JSON.parse(
    fs.readFileSync(path.join(SCHEMA_DIR, 'presets.schema.json'), 'utf-8')
);
const timelineSchema = JSON.parse(
    fs.readFileSync(path.join(SCHEMA_DIR, 'timeline.schema.json'), 'utf-8')
);

/**
 * DSL 验证结果
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

/**
 * 验证错误详情
 */
export interface ValidationError {
    path: string;
    message: string;
    keyword: string;
    params?: Record<string, unknown>;
}

/**
 * 创建 DSL 验证器实例
 */
export function createDSLValidator(): Ajv {
    const ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: false,
    });

    // 添加格式支持
    addFormats(ajv);

    // 注册所有 Schema
    ajv.addSchema(metaSchema, 'meta.schema.json');
    ajv.addSchema(assetsSchema, 'assets.schema.json');
    ajv.addSchema(expressionsSchema, 'expressions.schema.json');
    ajv.addSchema(presetsSchema, 'presets.schema.json');
    ajv.addSchema(timelineSchema, 'timeline.schema.json');
    ajv.addSchema(indexSchema, 'index.schema.json');

    return ajv;
}

/**
 * 验证 DSL 项目数据
 * @param data - 待验证的 DSL 项目数据
 * @returns 验证结果
 */
export function validateDSLProject(data: unknown): ValidationResult {
    const ajv = createDSLValidator();
    const validate = ajv.getSchema('index.schema.json');

    if (!validate) {
        return {
            valid: false,
            errors: [
                {
                    path: '',
                    message: 'Failed to load index schema',
                    keyword: 'schema',
                },
            ],
        };
    }

    const valid = validate(data);

    if (valid) {
        return { valid: true, errors: [] };
    }

    const errors: ValidationError[] = (validate.errors || []).map((err) => ({
        path: err.instancePath || '/',
        message: err.message || 'Unknown error',
        keyword: err.keyword,
        params: err.params as Record<string, unknown>,
    }));

    return { valid: false, errors };
}

/**
 * 验证单个 Schema 模块
 */
export function validateModule(
    moduleName: 'meta' | 'assets' | 'expressions' | 'presets' | 'timeline',
    data: unknown
): ValidationResult {
    const ajv = createDSLValidator();
    const validate = ajv.getSchema(`${moduleName}.schema.json`);

    if (!validate) {
        return {
            valid: false,
            errors: [
                {
                    path: '',
                    message: `Failed to load ${moduleName} schema`,
                    keyword: 'schema',
                },
            ],
        };
    }

    const valid = validate(data);

    if (valid) {
        return { valid: true, errors: [] };
    }

    const errors: ValidationError[] = (validate.errors || []).map((err) => ({
        path: err.instancePath || '/',
        message: err.message || 'Unknown error',
        keyword: err.keyword,
        params: err.params as Record<string, unknown>,
    }));

    return { valid: false, errors };
}

/**
 * 从文件加载并验证 DSL 项目
 * @param filePath - DSL 项目 JSON 文件路径
 * @returns 验证结果
 */
export function validateDSLProjectFile(filePath: string): ValidationResult {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        return validateDSLProject(data);
    } catch (error) {
        return {
            valid: false,
            errors: [
                {
                    path: '',
                    message: `Failed to read or parse file: ${(error as Error).message}`,
                    keyword: 'parse',
                },
            ],
        };
    }
}

/**
 * 格式化验证错误输出
 */
export function formatValidationErrors(result: ValidationResult): string {
    if (result.valid) {
        return '✅ 验证通过！DSL 项目结构完全符合 Schema 定义。';
    }

    const lines = ['❌ 验证失败！发现以下错误：', ''];

    result.errors.forEach((err, index) => {
        lines.push(`  ${index + 1}. 路径: ${err.path || '根节点'}`);
        lines.push(`     错误: ${err.message}`);
        lines.push(`     类型: ${err.keyword}`);
        if (err.params) {
            lines.push(`     参数: ${JSON.stringify(err.params)}`);
        }
        lines.push('');
    });

    return lines.join('\n');
}

// CLI 支持
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('用法: npx ts-node validator.ts <dsl-project.json>');
        console.log('');
        console.log('示例: npx ts-node validator.ts example-project.json');
        process.exit(1);
    }

    const filePath = args[0];
    const result = validateDSLProjectFile(filePath);
    console.log(formatValidationErrors(result));
    process.exit(result.valid ? 0 : 1);
}
