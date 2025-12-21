import { defineMotion } from '../../../../lib/fancy-text-presets/motion-api';

/**
 * 笑翻全场 - 综艺片头主标题
 * Q萌弹跳风格，糖果色渐变，带弹簧回弹和彩纸特效
 */
export default defineMotion(({ timeline, text, effects, easing }) => {
    // 总时长 2.2 秒
    timeline.duration(2200);

    // 入场动画 - 弹簧弹跳入场 (700ms)
    timeline.in(700, () => {
        // 渐变色 - 粉紫糖果色
        text.fill.from('#ffffff').to('#e91e63');

        // 从上方弹跳落下 (带多次回弹)
        text.y.from(-200).to(0, easing.outBounce);

        // 缩放弹性效果
        text.scale.from(0.3).to(1.0, easing.outElastic);

        // 透明度淡入
        text.opacity.from(0).to(1, easing.easeOut);

        // 糖果色发光
        effects.glow({ strength: 0.9, color: '#f48fb1', blur: 35 });

        // 紫色描边
        effects.outline({ color: '#6a1b9a', width: 5 });

        // 彩纸粒子
        effects.particle({ count: 25, color: '#ffeb3b', speed: 2 });
        effects.particle({ count: 20, color: '#4caf50', speed: 1.8 });
        effects.particle({ count: 15, color: '#2196f3', speed: 1.5 });
    });

    // 循环动画 - 可爱跳动 (500ms 每次)
    timeline.loop(500, () => {
        // 上下跳动
        text.y.pulse(0, -15, 250);

        // 缩放呼吸
        text.scale.pulse(1.0, 0.95, 250);

        // 颜色渐变闪烁 (粉色到紫色) - pulse 用亮度
        text.fill.pulse(1, 0.85, 250);

        // 发光呼吸
        effects.glow({ strength: 0.6, color: '#f48fb1', blur: 25 });
    });

    // 出场动画 - 弹跳离开 (500ms)
    timeline.out(500, () => {
        // 向上弹出
        text.y.from(0).to(-150, easing.easeIn);

        // 透明度淡出
        text.opacity.from(1).to(0, easing.easeIn);

        // 缩小
        text.scale.from(1).to(0.7, easing.easeIn);

        // 旋转离开
        text.rotation.from(0).to(15, easing.easeIn);
    });
});
