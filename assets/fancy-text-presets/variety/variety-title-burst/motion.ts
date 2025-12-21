import { defineMotion } from '../../../../lib/fancy-text-presets/motion-api';

/**
 * 一见你就笑 - 综艺片头主标题
 * 卡通爆炸风格，色彩饱和活泼，带爆炸底板和弹性缩放效果
 */
export default defineMotion(({ timeline, text, effects, easing }) => {
    // 总时长 2.5 秒
    timeline.duration(2500);

    // 入场动画 - 卡通爆炸弹入 (800ms)
    timeline.in(800, () => {
        // 颜色从白色变为明黄色
        text.fill.from('#ffffff').to('#ffd600');

        // 从极小弹到超大再回弹 (强烈 overshoot)
        text.scale.from(0.1).to(1.15, easing.outBack);

        // 透明度快速淡入
        text.opacity.from(0).to(1, easing.easeOut);

        // 轻微旋转抖动
        text.rotation.from(-8).to(0, easing.outElastic);

        // 强烈发光 - 明黄色外发光
        effects.glow({ strength: 1.0, color: '#ffeb3b', blur: 40 });

        // 描边发光 - 深蓝描边
        effects.outline({ color: '#1a237e', width: 6 });

        // 释放彩色粒子爆炸
        effects.particle({ count: 20, color: '#ff5722', speed: 3 });
        effects.particle({ count: 15, color: '#e91e63', speed: 2.5 });
        effects.particle({ count: 10, color: '#00bcd4', speed: 2 });
    });

    // 循环动画 - Q弹律动 (600ms 每次)
    timeline.loop(600, () => {
        // 弹性缩放呼吸
        text.scale.pulse(1.0, 1.12, 300);

        // 颜色微微闪烁 (黄色到橙色) - 用 fill 做渐变效果
        text.fill.pulse(1, 0.9, 300); // 使用亮度变化模拟

        // 发光呼吸
        effects.glow({ strength: 0.7, color: '#ffeb3b', blur: 25 });

        // 轻微旋转摇晃
        text.rotation.pulse(-2, 2, 300);
    });

    // 出场动画 - 缩小消散 (400ms)
    timeline.out(400, () => {
        // 透明度淡出
        text.opacity.from(1).to(0, easing.easeIn);

        // 缩小消失
        text.scale.from(1).to(0.5, easing.easeIn);

        // 模糊
        text.blur.from(0).to(10);
    });
});
