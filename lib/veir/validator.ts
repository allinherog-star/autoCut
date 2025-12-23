/**
 * VEIR v1.0 Schema 验证器
 * 用于验证视频剪辑中间表示
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM 兼容
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_DIR = path.join(__dirname, 'schemas');

/**
 * 加载 Schema 文件
 */
function loadSchema(filename: string): Record<string, unknown> {
    const content = fs.readFileSync(path.join(SCHEMA_DIR, filename), 'utf-8');
    return JSON.parse(content);
}

/**
 * 验证结果
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
 * 创建 VEIR 验证器实例
 */
export function createVEIRValidator(): Ajv {
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

    schemas.forEach((schemaFile) => {
        const schema = loadSchema(schemaFile);
        ajv.addSchema(schema);
    });

    return ajv;
}

/**
 * 验证 VEIR 项目数据
 */
export function validateVEIRProject(data: unknown): ValidationResult {
    const ajv = createVEIRValidator();
    const validate = ajv.getSchema('veir.schema.json');

    if (!validate) {
        return {
            valid: false,
            errors: [
                {
                    path: '',
                    message: 'Failed to load VEIR schema',
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
 * 验证单个模块
 */
export function validateModule(
    moduleName: 'meta' | 'assets' | 'vocabulary' | 'timeline' | 'annotations' | 'adjustments',
    data: unknown
): ValidationResult {
    const ajv = createVEIRValidator();
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
 * 从文件加载并验证 VEIR 项目
 */
export function validateVEIRProjectFile(filePath: string): ValidationResult {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        return validateVEIRProject(data);
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
        return '✅ 验证通过！VEIR 项目结构完全符合 Schema 定义。';
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
