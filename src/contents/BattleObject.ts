import FireWorkLine from "./FireWorkLine";
import Line from "./Line";
import Point from "./Point";

class BattleObject {
  x: number
  y: number
  w: number
  h: number

  constructor({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x + this.w, this.y)
    ctx.lineTo(this.x + this.w, this.y + this.h)
    ctx.lineTo(this.x, this.y + this.h)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  static movePointFromAngle({ x, y }: Point, deg: number, delta: number): Point {
    const rad = deg * (Math.PI / 180);
    const newX = x - delta * Math.sin(rad)
    const newY = y + delta * Math.cos(rad)
    return new Point(newX, newY)
  }

  static movePointFromPoint({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point, delta: number): Point {
    // 计算两点连线的斜率和偏转角
    const slope = (y2 - y1) / (x2 - x1);
    const angle = Math.atan(slope);
    const isRight = x2 > x1;
    // 计算新点的坐标
    const newX = isRight ? x1 - delta * Math.cos(angle) : x1 + delta * Math.cos(angle);
    const newY = isRight ? y1 - delta * Math.sin(angle) : y1 + delta * Math.sin(angle);
    return new Point(newX, newY)
  }

  static moveLineFromPoint<T extends Line | FireWorkLine>(line: T, { x, y }: Point, delta: number): T {
    const newStart = BattleObject.movePointFromPoint(line.start, { x, y }, delta)
    const newEnd = BattleObject.movePointFromPoint(line.end, { x, y }, delta)
    line.start = newStart
    line.end = newEnd
    return line
  }

  static rotatePoint = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point, deg: number): Point => {
    let rad = (deg * Math.PI) / 180
    let newX = x2 + (x1 - x2) * Math.cos(rad) - (y1 - y2) * Math.sin(rad)
    let newY = y2 + (x1 - x2) * Math.sin(rad) + (y1 - y2) * Math.cos(rad)
    return new Point(newX, newY)
  }

  static getNumbersWithInterval(a: number, b: number, gap: number): number[] {
    let result = [];
    for (let i = a + gap; i < b; i += gap) {
      result.push(i);
    }
    return result;
  }

  static boundaryLimit({ x, y }: Point) {
    if (x < 0 || x > window.innerWidth) {
      return false
    }
    if (y < 0 || y > window.innerHeight) {
      return false
    }
    return true
  }

  static calculateDistance({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
  }

  /** 获取多边形内的所有坐标 */
  static getPolygonPoints(points: Point[]): Point[] {
    // 将传入的点按照 x 坐标进行排序
    points.sort((a, b) => a.x - b.x);

    // 找到最左边和最右边的点
    const leftPoint = points[0];
    const rightPoint = points[points.length - 1];

    // 计算多边形的边界框
    const top = Math.min(...points.map(p => p.y));
    const bottom = Math.max(...points.map(p => p.y));

    // 遍历边界框内的所有点
    const result: Point[] = [];
    for (let y = top; y <= bottom; y++) {
      for (let x = leftPoint.x; x <= rightPoint.x; x++) {
        if (BattleObject.isPointInsidePolygon({ x, y }, points)) {
          result.push({ x, y });
        }
      }
    }

    return result;
  }

  /** 判断一个点是否在多边形内部 */
  static isPointInsidePolygon(point: Point, polygon: Point[]) {
    let inside = false;
    const x = point.x;
    const y = point.y;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  static checkDescendantsIsEmpty(el: Element): boolean {
    // 遍历所有后代元素
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      // 判断宽高是否与父元素相同
      if (child.clientHeight)
      // 判断宽度或高度是否为0
      if (child.clientHeight === 0 || child.clientWidth === 0) {
        if (!BattleObject.checkDescendantsIsEmpty(child)) {
          return false; // 递归判断后代元素
        }
      } else {
        return false; // 如果有一个后代元素宽度或高度不为0，则返回false
      }
    }
    return true; // 所有后代元素宽度或高度都为0，则返回true
  }


  static getElementFromPoint(point: Point) {
    let el = document.elementFromPoint(point.x, point.y)
    if (!el) {
      return null
    }
    // 如果有子元素，递归遍历所有的后代元素，如果宽度/高度为0，获取这个元素
    if (el.childElementCount) {
      const isEmpty = BattleObject.checkDescendantsIsEmpty(el)
      if (!isEmpty) {
        return null
      }
    }
    // 如果节点是文本节点，获取它的父元素
    if (el.nodeType === Node.TEXT_NODE) {
      el = el.parentElement
    }
    // 只获取元素节点
    if (el.nodeType !== Node.ELEMENT_NODE) {
      return null
    }
    return el
  }
}

export default BattleObject
