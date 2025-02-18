function deepMerge(defaultConfig, userConfig) {
  for (let key in userConfig) {
    if (userConfig.hasOwnProperty(key)) {
      // 如果目标和源都存在这个属性且都是对象，递归合并
      if (
        defaultConfig[key] &&
        typeof defaultConfig[key] === 'object' &&
        typeof userConfig[key] === 'object'
      ) {
        defaultConfig[key] = deepMerge(defaultConfig[key], userConfig[key]);
      } else {
        defaultConfig[key] = userConfig[key];
      }
    }
  }
  return defaultConfig;
}

/**
 * 处理图片，添加渐变背景和圆角效果
 * @param {HTMLCanvasElement} canvas - 目标画布元素
 * @param {string} base64 - base64 格式的图片数据
 * @param {Object} [option] - 配置选项
 * @param {number} [option.padding=80] - 图片周围的内边距（像素）, 渐变背景显示越多，图片就会越大
 * @param {number} [option.radius=40] - 图片圆角的半径（像素）
 * @param {Object} [option.footer] - 页脚配置
 * @param {string} [option.footer.text] - 页脚文字
 * @param {string} [option.footer.font='14px Arial'] - 页脚字体样式
 * @param {string} [option.footer.color='#ffffff'] - 页脚文字颜色
 * @param {number} [option.footer.margin=20] - 页脚距离边缘的距离
 * @param {string} [option.footer.logo] - SVG字符串或图片URL
 * @param {number} [option.footer.logoSize=16] - logo的大小
 * @param {number} [option.footer.logoGap=10] - logo和文字之间的间距
 * @return {Promise<string>} - 返回处理后的图片 base64 数据
 */
export function processImage(canvas, base64, option = {}) {
  const defaultConfig = {
    padding: 80,
    radius: 40,
    colors: ['#ff6b6b', '#4ecdc4'],
    enableFooter: false,
    footer: {
      text: 'Powered by',
      font: '14px Arial',
      color: 'black',
      margin: 20,
      logo: 'http://github.com/oeyoews.png',
      logoSize: 16,
      logoGap: 10,
    },
  };
  // 合并配置
  return new Promise(async (resolve, reject) => {
    if (!canvas) reject('canvas is null');
    const ctx = canvas.getContext('2d');
    const { padding, radius, colors, footer } = deepMerge(
      defaultConfig,
      option
    );

    async function updateCanvas(img) {
      // 创建临时画布用于处理原始图片和页脚
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');

      // 在临时画布上绘制原始图片
      tempCtx.drawImage(img, 0, 0, img.width, img.height);

      // 添加页脚文字和logo到临时画布
      if (footer.enableFooter) {
        const footerY = img.height - footer.margin;
        let textX = img.width - footer.margin;

        // 如果有logo，先绘制logo
        if (footer.logo) {
          try {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';

            // 判断是否为SVG
            const isSvg = footer.logo.trim().startsWith('<svg');

            if (isSvg) {
              const svgBlob = new Blob([footer.logo], {
                type: 'image/svg+xml',
              });
              logoImg.src = URL.createObjectURL(svgBlob);
            } else {
              logoImg.src = footer.logo;
            }

            await new Promise((resolve, reject) => {
              logoImg.onload = () => {
                const logoX = textX - footer.logoSize;
                const logoY = footerY - footer.logoSize;

                // 保存当前上下文状态
                tempCtx.save();

                // 创建圆形裁剪路径
                tempCtx.beginPath();
                const centerX = logoX + footer.logoSize / 2;
                const centerY = logoY + footer.logoSize / 2;
                const radius = footer.logoSize / 2;
                tempCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                tempCtx.closePath();
                tempCtx.clip();

                // 绘制logo
                tempCtx.drawImage(
                  logoImg,
                  logoX,
                  logoY,
                  footer.logoSize,
                  footer.logoSize
                );

                // 恢复上下文状态
                tempCtx.restore();

                // 更新文字位置
                textX = logoX - footer.logoGap;

                if (isSvg) {
                  URL.revokeObjectURL(logoImg.src);
                }
                resolve();
              };

              logoImg.onerror = reject;
            });
          } catch (error) {
            console.error('处理logo时出错:', error);
          }
        }

        // 绘制文字
        if (footer.text) {
          tempCtx.font = footer.font;
          tempCtx.fillStyle = footer.color;
          tempCtx.textAlign = 'right';
          tempCtx.textBaseline = 'bottom';
          tempCtx.fillText(footer.text, textX, footerY);
        }
      }

      // 设置最终画布尺寸（包含padding）
      const width = img.width + padding * 2;
      const height = img.height + padding * 2;
      canvas.width = width;
      canvas.height = height;

      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 创建圆角裁剪路径
      ctx.beginPath();
      ctx.moveTo(padding + radius, padding);
      ctx.lineTo(width - padding - radius, padding);
      ctx.quadraticCurveTo(
        width - padding,
        padding,
        width - padding,
        padding + radius
      );
      ctx.lineTo(width - padding, height - padding - radius);
      ctx.quadraticCurveTo(
        width - padding,
        height - padding,
        width - padding - radius,
        height - padding
      );
      ctx.lineTo(padding + radius, height - padding);
      ctx.quadraticCurveTo(
        padding,
        height - padding,
        padding,
        height - padding - radius
      );
      ctx.lineTo(padding, padding + radius);
      ctx.quadraticCurveTo(padding, padding, padding + radius, padding);
      ctx.closePath();
      ctx.clip();

      // 将临时画布的内容（包含footer）绘制到最终画布
      ctx.drawImage(tempCanvas, padding, padding);

      const newbase64 = canvas.toDataURL('image/png');
      resolve(newbase64);
    }

    const img = new Image();
    img.onload = () => updateCanvas(img);
    img.onerror = reject;
    img.src = base64;
  });
}
