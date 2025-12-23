/**
 * VEIR v1.0 模块入口
 * Video Editing Intermediate Representation
 */

// 类型定义导出
export * from './types';

// 注意：验证器 (validator) 使用了 Node.js fs 模块，仅在服务端可用
// 客户端请使用 composer 模块中的 validateVEIRForComposition

// 合成器导出（浏览器环境使用）
export * from './composer';

// Schema 路径常量
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SCHEMA_PATHS = {
    veir: path.join(__dirname, 'schemas', 'veir.schema.json'),
    meta: path.join(__dirname, 'schemas', 'meta.schema.json'),
    assets: path.join(__dirname, 'schemas', 'assets.schema.json'),
    vocabulary: path.join(__dirname, 'schemas', 'vocabulary.schema.json'),
    timeline: path.join(__dirname, 'schemas', 'timeline.schema.json'),
    annotations: path.join(__dirname, 'schemas', 'annotations.schema.json'),
    adjustments: path.join(__dirname, 'schemas', 'adjustments.schema.json'),
} as const;
