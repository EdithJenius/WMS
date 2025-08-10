// 单位转换工具函数
export interface UnitConversionResult {
  boxes: number
  cases: number
  caseBoxes: number
}

export interface ProductSpecs {
  boxesPerCase?: number | null
  boxesPerSet?: number | null
}

// 单位类型
export type Unit = 'case' | 'casebox' | 'box';

/**
 * 将任意单位转换为盒数
 * @param quantity 数量
 * @param unit 单位
 * @param specs 商品规格
 * @returns 盒数
 */
export function convertToBoxes(quantity: number, unit: Unit, specs: ProductSpecs): number {
  switch (unit) {
    case 'case':
      // 1箱 = boxesPerCase 端盒 = boxesPerCase * boxesPerSet 盒
      return quantity * (specs.boxesPerCase || 1) * (specs.boxesPerSet || 1);
    
    case 'casebox':
      // 1端盒 = boxesPerSet 盒
      return quantity * (specs.boxesPerSet || 1);
    
    case 'box':
    default:
      return quantity;
  }
}

/**
 * 将盒数转换为指定单位
 * @param boxes 盒数
 * @param targetUnit 目标单位
 * @param specs 商品规格
 * @returns 转换后的数量
 */
export function convertFromBoxes(boxes: number, targetUnit: Unit, specs: ProductSpecs): number {
  switch (targetUnit) {
    case 'case':
      // 盒数 -> 箱数
      const boxesPerCase = (specs.boxesPerCase || 1) * (specs.boxesPerSet || 1);
      return boxes / boxesPerCase;
    
    case 'casebox':
      // 盒数 -> 端盒数
      return boxes / (specs.boxesPerSet || 1);
    
    case 'box':
    default:
      return boxes;
  }
}

/**
 * 将盒数分解为不同单位的表示
 * @param boxes 盒数
 * @param specs 商品规格
 * @returns 分解结果
 */
export function breakdownBoxes(boxes: number, specs: ProductSpecs): UnitConversionResult {
  const boxesPerCase = (specs.boxesPerCase || 1) * (specs.boxesPerSet || 1);
  const boxesPerSet = specs.boxesPerSet || 1;
  
  const cases = Math.floor(boxes / boxesPerCase);
  const remainingBoxes = boxes % boxesPerCase;
  
  const caseBoxes = Math.floor(remainingBoxes / boxesPerSet);
  const finalBoxes = remainingBoxes % boxesPerSet;
  
  return {
    boxes: finalBoxes,
    cases,
    caseBoxes
  };
}

/**
 * 格式化库存显示
 * @param boxes 盒数
 * @param specs 商品规格
 * @returns 格式化的字符串
 */
export function formatInventory(boxes: number, specs: ProductSpecs): string {
  const breakdown = breakdownBoxes(boxes, specs);
  const parts: string[] = [];
  
  if (breakdown.cases > 0) {
    parts.push(`${breakdown.cases}箱`);
  }
  
  if (breakdown.caseBoxes > 0) {
    parts.push(`${breakdown.caseBoxes}端盒`);
  }
  
  if (breakdown.boxes > 0) {
    parts.push(`${breakdown.boxes}盒`);
  }
  
  if (parts.length === 0) {
    return '0盒';
  }
  
  return parts.join(' ');
}

/**
 * 获取单位的显示名称
 * @param unit 单位
 * @returns 显示名称
 */
export function getUnitDisplayName(unit: Unit): string {
  switch (unit) {
    case 'case':
      return '箱';
    case 'casebox':
      return '端盒';
    case 'box':
      return '盒';
    default:
      return unit;
  }
}

/**
 * 验证单位是否有效
 * @param unit 单位
 * @returns 是否有效
 */
export function isValidUnit(unit: string): unit is Unit {
  return ['case', 'casebox', 'box'].includes(unit);
}

/**
 * 计算单位转换后的成本
 * @param cost 原成本
 * @param fromUnit 原单位
 * @param toUnit 目标单位
 * @param specs 商品规格
 * @returns 转换后的成本
 */
export function convertUnitCost(cost: number, fromUnit: Unit, toUnit: Unit, specs: ProductSpecs): number {
  const fromBoxes = convertToBoxes(1, fromUnit, specs);
  const toBoxes = convertToBoxes(1, toUnit, specs);
  
  // 成本转换 = 原成本 * (原单位对应的盒数 / 目标单位对应的盒数)
  return cost * (fromBoxes / toBoxes);
}