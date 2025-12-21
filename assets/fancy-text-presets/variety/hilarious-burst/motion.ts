import { defineMotion } from '../../../../lib/fancy-text-presets/motion-api';

export default defineMotion(({ timeline, text, effects, easing }) => {
    // 总时长 1.8 秒
    timeline.duration(1800);

    // 入场动画 - 爆炸式弹入 (600ms)
    timeline.in(600, () => {
        // 颜色从白色变为橙红色
        text.fill.from('#ffffff').to('#ff3d00');

        // 缩放从 0.3 弹到 1.1 (过冲效果)
        text.scale.from(0.3).to(1.1, easing.outBack);

        // 透明度淡入
        text.opacity.from(0).to(1);

        // 添加发光效果
        effects.glow({ strength: 0.8, color: '#ff6600', blur: 30 });

        // 添加爆炸粒子
        effects.particle({ count: 12, color: '#ffcc00', speed: 2 });
    });

    // 循环动画 - 呼吸律动 (800ms 每次)
    timeline.loop(800, () => {
        // 微微缩放呼吸
        text.scale.pulse(1.0, 1.08, 400);

        // 发光强度呼吸
        effects.glow({ strength: 0.5, color: '#ff6600', blur: 20 });
    });

    // 出场动画 - 模糊消散 (400ms)
    timeline.out(400, () => {
        // 透明度淡出
        text.opacity.from(1).to(0, easing.easeIn);

        // 模糊增强
        text.blur.from(0).to(15);

        // 轻微放大
        text.scale.from(1).to(1.2, easing.easeOut);
    });
});
