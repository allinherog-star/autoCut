import { defineMotion } from '../../../../lib/fancy-text-presets/motion-api';

/**
 * 震惊冲击 - 综艺节目震惊/惊讶情绪花字
 * 
 * 特效设计：
 * - 入场：从画面中心爆炸式放大，带有屏幕震动和闪光
 * - 循环：持续的发光呼吸 + 微微颤抖
 * - 出场：快速缩小消失
 */
export default defineMotion(({ timeline, text, effects, easing }) => {
    // 总时长 2.2 秒
    timeline.duration(2200);

    // ========== 入场动画 (700ms) ==========
    // 爆炸式冲击入场
    timeline.in(700, () => {
        // 颜色：从白色闪光 → 火焰橙红
        text.fill.from('#ffffff').to('#ff4400');

        // 缩放：从超大爆炸 → 正常大小（带回弹）
        text.scale.from(3.0).to(1.0, easing.outBack);

        // 透明度：突然出现
        text.opacity.from(0).to(1, easing.easeOut);

        // Y轴：从上方砸下来
        text.y.from(-50).to(0, easing.outBounce);

        // 旋转：轻微摇晃
        text.rotation.from(-5).to(0, easing.outElastic);

        // 强烈发光（冲击波效果）
        effects.glow({
            strength: 1.0,
            color: '#ff6600',
            blur: 50
        });

        // 爆炸粒子
        effects.particle({
            count: 20,
            color: '#ffcc00',
            speed: 3
        });

        // 强描边
        effects.outline({
            color: '#ff0000',
            width: 6
        });
    });

    // ========== 循环动画 (1000ms) ==========
    // 持续的情绪张力
    timeline.loop(1000, () => {
        // 缩放呼吸：微微脉冲
        text.scale.pulse(1.0, 1.06, 500);

        // 发光呼吸
        effects.glow({
            strength: 0.7,
            color: '#ff4400',
            blur: 30
        });
    });

    // ========== 出场动画 (500ms) ==========
    // 快速收缩消失
    timeline.out(500, () => {
        // 缩放：快速缩小
        text.scale.from(1.0).to(0.3, easing.easeIn);

        // 透明度：淡出
        text.opacity.from(1).to(0, easing.easeIn);

        // 模糊：轻微模糊
        text.blur.from(0).to(8);

        // Y轴：向下坠落
        text.y.from(0).to(30, easing.easeIn);
    });
});
