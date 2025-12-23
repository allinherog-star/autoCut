/**
 * 多模态智能剪辑 DSL Schema 模块入口
 *
 * 导出：
 * - 所有 TypeScript 类型定义
 * - Schema 验证器函数
 * - Schema JSON 文件引用
 */

// 类型定义导出
export * from './types';

// 验证器导出
export {
    createDSLValidator,
    validateDSLProject,
    validateModule,
    validateDSLProjectFile,
    formatValidationErrors,
    type ValidationResult,
    type ValidationError,
} from './validator';

// Schema JSON 文件路径常量
import * as path from 'path';

export const SCHEMA_PATHS = {
    index: path.join(__dirname, 'index.schema.json'),
    meta: path.join(__dirname, 'meta.schema.json'),
    assets: path.join(__dirname, 'assets.schema.json'),
    expressions: path.join(__dirname, 'expressions.schema.json'),
    presets: path.join(__dirname, 'presets.schema.json'),
    timeline: path.join(__dirname, 'timeline.schema.json'),
} as const;

// 便捷导入函数
import * as fs from 'fs';

/**
 * 加载指定的 Schema JSON
 */
export function loadSchema(
    schemaName: keyof typeof SCHEMA_PATHS
): Record<string, unknown> {
    const schemaPath = SCHEMA_PATHS[schemaName];
    const content = fs.readFileSync(schemaPath, 'utf-8');
    return JSON.parse(content);
}

/**
 * 加载所有 Schema
 */
export function loadAllSchemas(): Record<string, Record<string, unknown>> {
    return {
        index: loadSchema('index'),
        meta: loadSchema('meta'),
        assets: loadSchema('assets'),
        expressions: loadSchema('expressions'),
        presets: loadSchema('presets'),
        timeline: loadSchema('timeline'),
    };
}
