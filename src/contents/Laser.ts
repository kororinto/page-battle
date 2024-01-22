import BattleObject from "./BattleObject";
import Line from "./Line";
import Point from "./Point";

class Laser {
  color = 'red'
  start: Point
  angle: number
  lasing = false
  vertexes: Point[]

  /** 
   * @param start 发射点
   * @param angle 发射角度
   * @param r 半径
   */
  constructor(start: Point, angle: number, r: number) {
    const length = 200
    this.start = start
    this.angle = angle

    const rad = angle * Math.PI / 180
    const p1 = new Point(start.x - r * Math.cos(rad), start.y + r * Math.sin(rad))
    const p2 = new Point(start.x + r * Math.cos(rad), start.y - r * Math.sin(rad))
    const p3 = new Point(p2.x + length * Math.sin(rad), p2.y + length * Math.cos(rad))
    const p4 = new Point(p1.x + length * Math.sin(rad), p1.y + length * Math.cos(rad))
    this.vertexes = [p1, p2, p3, p4, p1]
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.fillStyle = this.color
    ctx.beginPath()
    this.vertexes.forEach((p, index) => {
      if (index === 0) {
        ctx.moveTo(p.x, p.y)
      } else {
        ctx.lineTo(p.x, p.y)
      }
    })
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  setLasing(lasing: boolean) {
    this.lasing = lasing
  }
}

export default Laser
